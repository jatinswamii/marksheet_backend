  import { myDB } from '../../../utils/db/dbHelper'
  import { handleServerError } from '../../../helpers/server/serverErrors'

  export const list = async (params, reply) => {
    try {
      const res = await myDB.sqlQry({
        sql: `SELECT formid, title, active
        FROM my_forms
        WHERE formid IS NOT NULL ORDER BY title`,
      })

      return { data: res, message: '' }
    } catch (e) {
      handleServerError(reply, e)
    }
  }
