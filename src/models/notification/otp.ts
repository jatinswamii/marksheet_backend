import { utils, converters } from '../../utils/coreUtils'
import { myDB } from '../../utils/db/dbHelper'
import { handleServerError } from '../../helpers/server/serverErrors'
import { handleServerResponse } from '../../helpers/server/serverResponse'
import { sendNotification } from './sendNotification'
import { CONSTANTS } from '../../config/appConstants'
import { capitalize, toLower } from 'lodash'
import { createAuthToken } from '../../helpers/server/authtoken'
const otpGenerator = require('otp-generator')

export const send = async (params, reply) => {
  try {
    const otpLimit = 5,
      otpLimitSecs = 10 * 60
    const { requestType, recpeintId } = params

    const via = utils.get_validVia(recpeintId)

    if (!['email', 'mobile'].includes(via))
      throw 'recpeintId type is not valid!'

    let newUser = false
    if (['otr_form', 'email_mobile_update'].includes(requestType))
      newUser = true

    let sql
    if (params?.userType === CONSTANTS.CANDIDATE_TYPE) {
      sql = `select email,mobile from cms.candidate_master where ${via}='${toLower(recpeintId)}'`
    } else {
      sql = `select email,mobile from my_users where ${via}='${toLower(recpeintId)}'`
    }

    let rows = await myDB.sqlQry({ sql })
    if (newUser && rows.length > 0) {
      return {
        data: [
          {
            message: `${capitalize(via)}, [${recpeintId}] is already registered!`,
          },
        ],
      }
    }
    if (!newUser && rows.length === 0) {
      return {
        data: [
          { message: `${capitalize(via)}, [${recpeintId}] is not registered!` },
        ],
      }
    }
    const currentTime = utils.moment_CurrentTime({})
    const _lastOtpInSecs = `extract(epoch from ('${currentTime}'::TIMESTAMP - expired_at::TIMESTAMP))::int as otp_time`
    sql = `select ${_lastOtpInSecs},count,limitcount from my_otps where recpeintid='${toLower(recpeintId)}'`
    let count = 0,
      limitcount = 0
    rows = await myDB.sqlQry({ sql })
    if (rows.length > 0) {
      const row = rows[0]
      count = utils.parseInt({ value: row['count'] })
      limitcount = utils.parseInt({ value: row['limitcount'] })
      const lastOtpInSecs = utils.parseInt({ value: row['otp_time'] })
      if (lastOtpInSecs < 0) {
        return {
          data: [
            {
              expire_in_secs: Math.abs(lastOtpInSecs),
              message: `OTP already sent, please wait ${Math.abs(
                lastOtpInSecs,
              )} Secs for new request`,
            },
          ],
        }
      }
      if (limitcount >= otpLimit) {
        if (lastOtpInSecs < otpLimitSecs) {
          return {
            data: [
              {
                message: `OTP limit is over, You can request after ${converters.secondsToHms(
                  otpLimitSecs - lastOtpInSecs,
                )}!`,
              },
            ],
          }
        } else {
          limitcount = 0
        }
      }
    }
    const otp = await otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    })
    const expire_in_secs = parseInt(process.env.OTP_EXPIRED_MINUTES) * 60
    const expired_at = utils.moment_CurrentTime({
      offsetInSec: expire_in_secs,
    })
    await myDB.upsert({
      table: 'my_otps',
      where: {
        recpeintid: toLower(recpeintId),
      },
      data: {
        otp: otp,
        recpeintid: toLower(recpeintId),
        expired_at: expired_at,
        count: count + 1,
        limitcount: limitcount + 1,
      },
    })
    const res = await sendNotification({
      via: via,
      recipients: [{ [recpeintId]: {} }],
      message: {},
      templateid: 'otp',
      commonData: { expiredIn: process.env.OTP_EXPIRED_MINUTES, otp: otp },
      subject: '',
      reply: reply,
    })

    if (res != 'ok')
      handleServerError(
        reply,
        new Error('OTP Error! Please try again after some time'),
      )
    return {
      data: [
        {
          expire_in_secs,
          message: 'OTP Sent',
          otp: otp,
        },
      ],
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const verify = async (params, reply) => {
  try {
    const { recpeintid: recpeintId, otp } = params
    const currentTime = utils.moment_CurrentTime({})
    let sql = `select * from my_otps where recpeintid='${toLower(recpeintId)}' and otp='${otp}' and expired_at >= '${currentTime}' `
    let rs = await myDB.sqlQry({ sql })
    if (rs.length === 0) {
      handleServerResponse(reply, {
        data: [{ message: 'OTP expired/not matched/used' }],
        message: '',
      })
      //handleServerError(reply, new Error('Otp expired or not found'))
    } else {
      sql = `update my_otps set expired_at='${currentTime}' where recpeintid='${toLower(recpeintId)}'`
      await myDB.sqlQry({ sql, qryexe: true })
    }
    handleServerResponse(reply, {
      data: [{ message: 'OTP VERIFIED' }],
      message: 'OTP VERIFIED',
    })
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const sendGuestOtp = async (params, reply) => {
  try {
    const otpLimit = 5,
      otpLimitSecs = 10 * 60
    const { requestType, recpeintId } = params

    const via = utils.get_validVia(recpeintId)

    if (!['mobile'].includes(via)) throw 'recpeintId type is not valid!'

    let sql

    sql = `select mobile from cms.temp_expert_data where ${via}='${toLower(recpeintId)}'`

    let rows = await myDB.sqlQry({ sql })

    const currentTime = utils.moment_CurrentTime({})
    const _lastOtpInSecs = `extract(epoch from ('${currentTime}'::TIMESTAMP - expired_at::TIMESTAMP))::int as otp_time`
    sql = `select ${_lastOtpInSecs},count,limitcount from my_otps where recpeintid='${toLower(recpeintId)}'`
    let count = 0,
      limitcount = 0

    rows = await myDB.sqlQry({ sql })
    if (rows.length > 0) {
      const row = rows[0]
      count = utils.parseInt({ value: row['count'] })
      limitcount = utils.parseInt({ value: row['limitcount'] })
      const lastOtpInSecs = utils.parseInt({ value: row['otp_time'] })
      if (lastOtpInSecs < 0) {
        return {
          data: [
            {
              expire_in_secs: Math.abs(lastOtpInSecs),
              message: `OTP already sent, please wait ${Math.abs(
                lastOtpInSecs,
              )} Secs for new request`,
            },
          ],
        }
      }
      if (limitcount >= otpLimit) {
        if (lastOtpInSecs < otpLimitSecs) {
          return {
            data: [
              {
                message: `OTP limit is over, You can request after ${converters.secondsToHms(
                  otpLimitSecs - lastOtpInSecs,
                )}!`,
              },
            ],
          }
        } else {
          limitcount = 0
        }
      }
    }
    const otp = await otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    })

    const expire_in_secs = parseInt(process.env.OTP_EXPIRED_MINUTES) * 60

    const expired_at = utils.moment_CurrentTime({
      offsetInSec: expire_in_secs,
    })

    await myDB.upsert({
      table: 'my_otps',
      where: {
        recpeintid: toLower(recpeintId),
      },
      data: {
        otp: otp,
        recpeintid: toLower(recpeintId),
        expired_at: expired_at,
        count: count + 1,
        limitcount: limitcount + 1,
      },
    })

    return {
      data: [
        {
          expire_in_secs,
          message: 'OTP Sent',
          otp: otp,
        },
      ],
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const sendGuestLogin = async (params, reply) => {
  try {
    const { requestType, recpeintId } = params

    const via = utils.get_validVia(recpeintId)

    if (!['mobile'].includes(via)) throw 'recpeintId type is not valid!'

    await myDB.upsert({
      table: 'cms.temp_expert_data',
      where: { expertid: recpeintId },
      data: { expertid: recpeintId, type: requestType, mobile: recpeintId },
      dbSerialize: true,
    })

    const user = await myDB.sqlQry({
      sql: `select mobile from cms.temp_expert_data where expertid='${recpeintId}'`,
    })

    const authtoken = await createAuthToken(
      { mobile: recpeintId, registrationid: recpeintId, type: requestType },
      {},
      reply,
    )
    handleServerResponse(reply, {
      data: {
        token: authtoken.token,
        user: recpeintId,
      },
    })
  } catch (e) {
    handleServerError(reply, e)
  }
}
