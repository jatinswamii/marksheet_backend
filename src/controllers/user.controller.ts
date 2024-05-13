import fs from 'fs'
import { toString, isEqual, has } from 'lodash'
import { FastifyReply } from 'fastify'
import { ISessionRequest } from '../interfaces'
import { ERROR_MESSAGE, handleServerError } from '../helpers/server/serverErrors'
import { handleServerResponse } from '../helpers/server/serverResponse'
import { myValue, utils } from '../utils/coreUtils'
import { ERROR400, STANDARD } from '../config/systemConstants'
import {
  getuser,
  get_token_user,
  createAuthToken,
  logedin,
} from '../helpers/server/authtoken'
import { myDB } from '../utils/db/dbHelper'
import { CONSTANTS } from '../config/appConstants'

const path = require('path');


async function fileToBase64(filePath) {
  const fileBuffer = await fs.readFileSync(filePath)

  return fileBuffer
}

const logedInUserId= (id) => {
  return `select created_at, updated_at from cms.logedin where registrationid=${id}::bigint order by updated_at desc limit 1`
}

export const login = async (request: any, reply: FastifyReply) => {
  try {
    let params = request.body
    // const ipAddress = request.ip;
    // const macAddress = request.macAddress;
    // const ip=utils.ip2int(ipAddress)
    const user = (await getuser(params, reply)) as any
    if (!user) {
      handleServerResponse(reply, {
        data: {
          statusCode: ERROR400,
          message: ERROR_MESSAGE.INVALID_USER,
        },
      })
    }

    if (has(request.body, 'captcha')) {
      if (request.session.captcha !== request.body.captcha) {
        handleServerResponse(reply, {
          data: {
            statusCode: ERROR400,
            message: ERROR_MESSAGE.INVALID_CAPTCHA,
          },
        })
      }
    }
    if (has(request.body, 'password')) {
      try {
        const checkPass = await utils.compareHash(params?.password, user.password)
        if (!checkPass) {
          handleServerResponse(reply, {
            data: {
              statusCode: ERROR400,
              message: ERROR_MESSAGE.INVALID_PASSWORD
            },
          })
        }
      } catch (e) {
        handleServerResponse(reply, {
          data: {
            statusCode: ERROR400,
            message: ERROR_MESSAGE.INVALID_USER,
          },
        })
      }
    }


    delete user?.password

    const authtoken = await createAuthToken(user, request, reply)

    const profile = await myDB.sqlQry({ sql: `select photo_file,sign_file from cms.candidate_photo_signature where registrationid=${user.registrationid}::bigint order by cdid desc limit 1` })

    const loggedInDetails = await myDB.sqlQry({sql:logedInUserId(user.registrationid)})

    if(params?.usertype === CONSTANTS.CANDIDATE_TYPE){
      await logedin(params, reply);
    }
    
    handleServerResponse(reply, {
      data: {
        token: authtoken.token,
        user: {
          registrationid: toString(user.registrationid),
          email: user.email,
          name: user.candidate_name || user.name,
          mobile: user.mobile,
          type: user.type || 'NA',
          profilephoto: profile?.[0]?.photo_file,
        },
        loginDetails:loggedInDetails
      },
    })
  } catch (err) {
    handleServerError(reply, err)
  }
}

export const logOut = async (request: any, reply: FastifyReply) => {
  try {
    handleServerResponse(reply, {
      data: {
        message: 'User logout',
        statusCode: STANDARD.CREATED,
      },
    })
  } catch (err) {
    handleServerError(reply, err)
  }
}

export const refreshToken = async (
  request: ISessionRequest,
  reply: FastifyReply,
) => {
  let params = request.body
  try {
    const loggedInUser = (await getuser(params, reply)) as any
    let token = request.headers.authorization

    token = token.replace('Bearer ', '')

    let user = await get_token_user(request, reply)
    const profile = await myDB.sqlQry({ sql: `select photo_file,sign_file from cms.candidate_photo_signature where registrationid=${user.registrationid}::bigint order by cdid desc limit 1` })
    loggedInUser.profilephoto = profile?.[0]?.photo_file
    if (
      isEqual(
        toString(user?.registrationid),
        toString(loggedInUser?.registrationid),
      )
    ) {
      const authtoken = await createAuthToken(user, request, reply)

      delete loggedInUser.password

      const loggedInDetails = await myDB.sqlQry({sql:logedInUserId(user.registrationid) })

      handleServerResponse(reply, {
        data: {
          ...authtoken,
          user: loggedInUser,
          loginDetails:loggedInDetails
        },
      })
    } else {
      handleServerError(reply, new Error('Invalid session (101)'))
    }
  } catch (err) {
    handleServerError(reply, err)
  }
}