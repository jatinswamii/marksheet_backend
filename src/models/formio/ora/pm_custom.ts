import { myDB } from '../../../utils/db/dbHelper'
import { handleServerError } from '../../../helpers/server/serverErrors'

export const list = async (params, reply) => {
  try {
    const res = await myDB.sqlQry({
      sql: `select * from main.post_module_master where custom='Y'`,
    })

    return { data: res, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}
