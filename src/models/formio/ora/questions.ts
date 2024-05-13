import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'
export const select_qid = async (params, reply) => {
  try {
    const { post_id, module_id, module_type } = params
    const sql = `select  q.qid as value,q.question as label from main.post_modules_questions q where q.post_id=${post_id} and q.module_id=${module_id} and q.module_type=${module_type} order by q.qid`
    return await myDB.sqlQry({sql})
  } catch (e) {
    handleServerError(reply, e)
  }
}
