import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'

export const get = async (params, reply) => {
  try {
    return await myDB.sqlQry({
      sql: `select candidate_name_score from cms.candidate_photo_id_validations where registrationid='${params?.registrationid}'`,
    })
  } catch (e) {
    handleServerError(reply, e)
  }
}
