import { myDB } from '../../../utils/db/dbHelper'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { myValue } from '../../../utils/coreUtils'
import { exitInvalidPkeys } from '../../../helpers/formio/formio.common'
import {post} from '../../../helpers/my/postQry'
export const qlevelQry = async(params ,reply) =>{
  try {
    const {data:{post_id,qlevel}}=params
    let _cond =''
    if (!myValue.isEmpty(qlevel)) {
      _cond=` where keyid::int=${qlevel}`
    }
    const qlevels=`select keyid qlevel,keytext qlevel_name from my_master('qualification_core_levels') ${_cond}`
    let sql = `select l.*,p.exp_year,p.exp_month from (${qlevels}) l left join main.post_qlevel_experience p on (l.qlevel::INT=p.qlevel and p.post_id=${post_id})`
    let rows= await myDB.sqlQry({ sql })
    return await post.addReadOnly({params:params?.data,rows,reply})
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const get = async (params, reply) => {
  try {
    exitInvalidPkeys(params,reply)
    const rows= await qlevelQry(params,reply)
    return { data: rows, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const list = async (params, reply) => {
  try {
    const rows= await qlevelQry(params,reply)
    return { data: rows, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}
