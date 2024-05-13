import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'

export const list = async (params, reply) => {
  try {
    const { data:{formid, formpkeyid} } = params
    const sql = `select log_id,formpkeyid,action,uid,timestamp,ip,data::text from logs.form_history where formid='${formid}' and formpkeyid ilike '%${formpkeyid}%' order by timestamp desc`
    let rows = await myDB.sqlQry({ sql })
    return { data: rows }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const selectqry_form_module = async (params, reply) => {
  try {
    const sql = `select module as value,module as label from my_forms where COALESCE(type,'')='M' and  module in ('application','candidate','ora') and COALESCE(active,1)=1 group by module`
    const res = await myDB.sqlQry({ sql })
    return { data: res }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_formid = async (params, reply) => {
  try {
    const { form_module } = params
    const sql = `select formid as value,title as label from my_forms where COALESCE(type,'')='C' and COALESCE(active,1)=1 and module='${form_module}' order by title`
    const res = await myDB.sqlQry({ sql })
    return { data: res }
  } catch (e) {
    handleServerError(reply, e)
  }
}
