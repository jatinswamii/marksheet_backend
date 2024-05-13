import { myDB } from '../../../utils/db/dbHelper'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { myValue } from '../../../utils/coreUtils'
import { exitInvalidPkeys } from '../../../helpers/formio/formio.common'
import {post} from '../../../helpers/my/postQry'
export const cQry = async(params ,reply) =>{
  try {
    const {data:{post_id,community_code}}=params
    let _cond =''
    if (!myValue.isEmpty(community_code)) {
      _cond=` where community_code='${community_code}'`
    }
    const community= `select * from (select lower(keyid) as community_code ,keytext as community_name,sortno from my_master('community')  UNION select 'ph' as community,'PH' as community_name,99 as sortno  order by sortno) o ${_cond}`
    const post_vacancy=`(select * from main.post_vacancy where post_id=${post_id})`
    let sql=`select p.vacancy,p.vacancy_m,p.vacancy_f,p.vacancy_o,c.community_code,c.community_name from (${community.toLowerCase()}) c left join ${post_vacancy} p on (lower(p.community_code)=lower(c.community_code))`
    let rows= await myDB.sqlQry({ sql })
    return await post.addReadOnly({params:params?.data,rows,reply})
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const get = async (params, reply) => {
  try {
    exitInvalidPkeys(params,reply)
    const rows= await cQry(params,reply)
    return { data: rows, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const list = async (params, reply) => {
  try {
    const rows= await cQry(params,reply)
    return { data: rows, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

