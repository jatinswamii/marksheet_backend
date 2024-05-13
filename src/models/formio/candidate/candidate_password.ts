import { has } from 'lodash'
import { myDB } from '../../../utils/db/dbHelper'
import {
  ERROR_MESSAGE,
  handleServerError,
} from '../../../helpers/server/serverErrors'
import { utils } from '../../../utils/coreUtils'
import { ERROR400 } from '../../../config/systemConstants'
import { handleServerResponse } from '../../../helpers/server/serverResponse'
import { getuser } from '../../../helpers/server/authtoken'

export const upsert = async (params, reply) => {
  try {
    const {
      authUser: { email: recpeintId },
    } = params

    const user = (await getuser(params?.data, reply)) as any

    if (!user) {
      handleServerError(reply, {
        data: {
          statusCode: ERROR400,
          message: ERROR_MESSAGE.INVALID_USER,
        },
      })
    }

    if (has(params?.data, 'old_password')) {
      try {
        const checkPass = await utils.compareHash(
          params?.data?.old_password,
          user.password,
        )

        if (!checkPass) {
          handleServerResponse(reply, {
            data: {
              statusCode: ERROR400,
              message: ERROR_MESSAGE.INVALID_PASSWORD,
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

    const via = utils.get_validVia(recpeintId)
    const hashPass = await utils.genSalt(10, params?.data?.new_password)
    const data = { password: hashPass }

    const table = 'cms.candidate_master'

    await myDB.update({
      table,
      data,
      where: { [via]: recpeintId },
    })
    
    return {
      data: [{ message: 'password has been updated' }],
      message: 'success',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}
