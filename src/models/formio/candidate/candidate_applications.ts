import { myDB } from '../../../utils/db/dbHelper'
import { handleServerError } from '../../../helpers/server/serverErrors'

export const list = async (params, reply) => {
  try {
    const sql=`select c1.app_id,p1.post_id,pn.close_date,p1.vacancy_no,p1.post_name,app_status as app_status_id,m1.keytext as app_status,m2.keytext as post_status, c1.created_at as created_at from cms.applications c1 left join my_master('app_status') m1 on (c1.app_status=m1.keyid::int),main.posts p1 left join my_master('post_status') m2 on (p1.post_status=m2.keyid::int),main.posts_notices as pn where c1.registrationid='${parseInt(params?.authUser.registrationid)}' and c1.post_id=p1.post_id and p1.notice_id=pn.notice_id ORDER BY created_at DESC`
    let rows = await myDB.sqlQry({ sql })
    return { data: rows, message: 'application response' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const posts = async (params, reply) => {
  try {
    const sql=`select pd.module_id, pd.module_type,name,post_forms as forms,icon, 'true' as status from post_modules_data pd,post_module_master pm where pd.module_id=pm.module_id and post_id=${params.post_id} and candidate_tab=1 order by sortno`
    let rows = await myDB.sqlQry({ sql })
    return { data: rows, message: 'application response' }
  } catch (e) {
    handleServerError(reply, e)
  }
}
