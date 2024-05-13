import { toString } from 'lodash'
import os from 'os'
import { handleServerError } from './serverErrors'
import * as JWT from 'jsonwebtoken'
import { myDB } from '../../utils/db/dbHelper'
import { myuuid } from '../../utils/myuuid'
import { myValue, utils } from '../../utils/coreUtils'
import { CONSTANTS } from '../../config/appConstants'
// import { createYearSchema } from '../../db/yearlyschema'
export const getuser = async (params: any, reply) => {
  let ukey = ''
  for (const field of ['registrationid', 'email', 'mobile']) {
    if (!params[field]) continue
    ukey = field
    break
  }
  let user = [] as any

  if (!myValue.isEmpty(ukey)) {
    try {
      user = await myDB.tableQry({
        table:
          params?.usertype === CONSTANTS.CANDIDATE_TYPE
            ? 'cms.candidate_master'
            : 'my_users',
        where: { [ukey]: params[ukey]?.toString()?.toLowerCase() },
        dbSerialize: true,
      })

      if (user.length > 0) {
        if (params?.usertype === CONSTANTS.CANDIDATE_TYPE) {
          return {
            type: CONSTANTS.CANDIDATE_TYPE,
            ...user?.[0],
          }
        }
        return user?.[0]
      }
    } catch (e) {
      handleServerError(reply, e)
    }
  }
}

export const get_token_user = async (request, reply) => {
  let token = request.headers.authorization

  token = token.replace('Bearer ', '')

  if (!token) {
    handleServerError(reply, new Error('Invalid token!'))
  }

  const user: any = JWT.verify(token, process.env.APP_JWT_SECRET)

  return user
}

export const createAuthToken = async (user, request, reply) => {
  try {
    //createYearSchema(2023)
    if (!user.sessionid) {
      user.sessionid = request?.session?.get('sessionid')
    }
    
    const token = JWT.sign(
      {
        registrationid: toString(user.registrationid),
        email: user.email,
        name: user.name,
        type: user?.type,
        sessionid: user.sessionid,
      },
      process.env.APP_JWT_SECRET,
      {
        expiresIn: parseInt(process.env.SESSION_EXPIRED_SECONDS),
      },
    )

    const data = {
      token: token,
      expired_at: utils.get_currentdatetime({
        offsetInSec: parseInt(process.env.SESSION_EXPIRED_SECONDS),
      }),
    }

    if (user?.sessionid) {
      await myDB.update({
        table: 'sessions',
        data,
        where: { sessionid: user.sessionid },
      })
    }

    return data
  } catch (err) {
    handleServerError(reply, err)
  }
}

export const logedin = async (request, user) => {

  const userDevice = {
   ip: request.ip,
   os: os.cpus(),
   platform: os.platform(),
   machine: os.machine()
  }

  try {
    const ipAddress = request.ip
    //const macAddress = request.macAddress;
    const ip = utils.ip2int(ipAddress)
    let sql = `select * from cms.logedin where registrationid=${user.registrationid}`
    const rs = await myDB.sqlQry({ sql })
    if (rs.length == 0) {
      sql = `insert into cms.logedin (registrationid,active,ip) values ('${user.registrationid}','1','[${ip}]')`
      return await myDB.sqlQry({ sql, qryexe: true })
    }
    const setLinkPosts = `set active=1,ip=array_to_json(ARRAY(select distinct JSONB_ARRAY_ELEMENTS_TEXT(COALESCE(ip,'[]'::jsonb) || '[${ip}]'::jsonb)::int))::jsonb`
    sql = `update cms.logedin ${setLinkPosts} where registrationid=${user.registrationid}::BIGINT`
    return await myDB.sqlQry({ sql, qryexe: true })
  } catch (err) {
    return err
  }
}
export const createSession = async (request, reply) => {
  let sessionid = request.session.sessionId

  if (!sessionid) {
    sessionid = myuuid('abc1234567890', 15)
    request.session.set('sessionid', sessionid)
  }

  const data = {
    sessionid: sessionid,
    expired_at: utils.get_currentdatetime({
      offsetInSec: parseInt(process.env.SESSION_EXPIRED_SECONDS),
    }),
    props: JSON.stringify({
      host: request?.hostname,
      ips: request.ips,
    }),
    ip_address: request.ip,
  }

  try {
    await myDB.upsert({
      table: 'sessions',
      data,
      where: { sessionid: sessionid },
    })
  } catch (e) {
    handleServerError(reply, e)
  }
}
