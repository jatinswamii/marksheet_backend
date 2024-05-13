import { utils } from '../../utils/coreUtils'
import { myDB } from '../../utils/db/dbHelper'
import { handleServerError } from '../../helpers/server/serverErrors'
import { handleServerResponse } from '../../helpers/server/serverResponse'
import { sendNotification } from './sendNotification'
import { CONSTANTS } from '../../config/appConstants'
const otpGenerator = require('otp-generator')

export const send = async (params, reply) => {
  try {
    const recpeintId = params?.recpeintid
    const via = utils.get_validVia(recpeintId)
    const res = await sendNotification({
      via: via,
      recipients: [{ [recpeintId]: {} }],
      message: {},
      templateid: 'candidate-form',
      commonData: { expiredIn: process.env.OTP_EXPIRED_MINUTES },
      subject: 'Candidate Info',
      reply: reply,
    })
  } catch (e) {
    handleServerError(reply, e)
  }
}