import { handleServerError } from '../../helpers/server/serverErrors'
import { handleServerResponse } from '../../helpers/server/serverResponse'
import { CONSTANTS } from '../../config/appConstants'
import { utils } from '../../utils/coreUtils'
import { myDB } from '../../utils/db/dbHelper'

export const setPassword = async (params, reply) => {
  try {
    const { recpeintId, password } = params
    const via = utils.get_validVia(recpeintId)
    const hashPass = await utils.genSalt(10, password)
    const data = { password: hashPass }

    const table =
      params?.userType === CONSTANTS.CANDIDATE_TYPE
        ? 'cms.candidate_master'
        : 'my_users'

    await myDB.update({
      table,
      data,
      where: { [via]: recpeintId },
    })
    handleServerResponse(reply, {
      data: [{ message: 'password has been updated' }],
      message: 'success',
    })
  } catch (error) {
    handleServerError(reply, error)
  }
}
