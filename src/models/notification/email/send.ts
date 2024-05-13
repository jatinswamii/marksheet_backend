import { FastifyReply } from 'fastify'

import path from 'path'

import { handleServerError } from '../../../helpers/server/serverErrors'

const mailer = require('../../../helpers/notification/mailer')
const Email = require('email-templates')

export const send = async (
  id: string[],
  html: string,
  subject: string,
  reply: FastifyReply,
  attachments:Array<any> = [],
  templateid: string
) => {
  try {
    // asolutue path
    let templateDir = path.resolve(__dirname, 'templates','email')

    const Receipt = new Email({
      views: {
        options: {
          extension: 'ejs', // <---- HERE
        },
      },
      preview: {
        open: {
          app: 'firefox',
          wait: false,
        },
      },
    })

    return Receipt.render(templateDir, {
      name: id,
      html: html,
    }).then((welcomeTemplate) => {

      mailer.send(
        'noreply@dev-testing.com',
        id,
        subject,
        welcomeTemplate,
        reply,
        attachments,
        templateid,
      );

      return 'ok'
    })
  } catch (e) {
    handleServerError(reply, e)
  }
}
