import { map, flatten } from 'lodash'
import { send } from './email/send'
import { prisma } from '../../utils/prismaClient'

const mappedString = (emailStr, commonData) => {
  const keys = Object.keys(commonData)
  for (const key of keys) {
    emailStr = emailStr?.replace(`{{${key}}}`, commonData[key])
  }
  return `<div align="left" class="alignment otp_div" style="margin: 50px; padding: 25px;">${emailStr}</div>`
}

export const sendNotification = async ({
  via,
  recipients,
  templateid = null,
  commonData = {},
  subject,
  reply,
  attachments = [],
}: {
  via: string
  recipients: object
  message: object
  templateid?: string
  commonData: any
  logs?: boolean
  subject: string
  reply: any
  attachments?: any[]
}): Promise<any> => {
  try {
    const templateRes = await prisma.my_templates.findUnique({
      where: {
        name: templateid,
      },
    })

    const emailTemplate = mappedString(templateRes?.message, commonData)

    const receiptants = flatten(map(recipients, (item) => Object.keys(item)))

  

    if (via === 'email') {
      await send(
        receiptants,
        emailTemplate,
        subject || templateRes?.subject || templateRes?.default_subject,
        reply,
        attachments,
        templateid,
      )
    }

    return 'ok'
  } catch (e) {
    throw e
  }
}
