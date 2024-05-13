import moment from 'moment'
import { prisma } from '../../utils/prismaClient'
import { handleServerError } from '../server/serverErrors'

var nodemailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport')

exports.send = async function (
  from = 'nreplyupsc@gmail.com',
  to,
  subject,
  html,
  reply,
  attachments,
  templateId,
) {
  var transporter = nodemailer.createTransport(
    smtpTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      secure: false, // use SSL
      auth: {
        user: 'nreplyupsc@gmail.com',
        pass: 'hslrquanbmbcjqef',
      },
      tls: {
        rejectUnauthorized: false, // ref https://github.com/nodemailer/nodemailer/issues/406#issuecomment-83941225
      },
    }),
  )

  var mailOptions = {
    from: from,
    to: to,
    subject: subject,
    html: html,
    attachments: attachments,
  }

  transporter.sendMail(mailOptions, async function (error, info) {
    if (error) {
      await prisma.log_broadcast_mails.create({
        data: {
          email: templateId,
          status: 'rejected',
          timestamp: moment().utcOffset('+05:30').toISOString(),
        },
      })

      await prisma.log_broadcast_messages.create({
        data: {
          templateid: templateId,
          timestamp: moment().utcOffset('+05:30').toISOString(),
          categroyid: templateId,
          filters: 'email',
        },
      })
    }

    if (info) {
      await prisma.log_broadcast_mails.create({
        data: {
          email: templateId,
          status: info?.response,
          timestamp: moment().utcOffset('+05:30').toISOString(),
        },
      })

      await prisma.log_broadcast_messages.create({
        data: {
          templateid: templateId,
          timestamp: moment().utcOffset('+05:30').toISOString(),
          categroyid: templateId,
          filters: 'email',
        },
      })
    }
  })

  // Todo: need to add logbroadcasting

  // await prisma.log_broadcast.create({
  //   data: {
  //     ID: getIntId(),
  //     email: to,
  //     message: subject,
  //     log: `mail sent for ${subject}`,
  //     timestamp: moment().toISOString(),
  //   },
  // })
}
