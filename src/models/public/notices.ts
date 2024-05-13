import { handleServerError } from '../../helpers/server/serverErrors'
import { myDB, sqlCond } from '../../utils/db/dbHelper'
import { myValue, utils } from '../../utils/coreUtils'
import { has } from 'lodash'
const active_notice = `to_char(notice_date,'YYYYMMDDHH24MI') <= to_char(NOW(),'YYYYMMDDHH24MI') and to_char(close_date,'YYYYMMDDHH24MI') >= to_char(NOW(),'YYYYMMDDHH24MI') and COALESCE(approval,0)=1`

export const posts = async (params, reply) => {
  try {
    const { notice_type } = params
    if (myValue.isEmpty(notice_type))
      return { message: 'Notice Type is not found!' }
    let sql = `select notice_id,notice_date, issue_date,close_date as close_dt,CONCAT(n.advt_no,'/',n.year) as adv_no,notice_doc_hi,notice_doc_en from main.posts_notices n where ${active_notice} and notice_type='${notice_type}'`
    const notices = await myDB.sqlQry({ sql })

    for (let key in notices) {
      const notice = notices[key]
      let sql = `select p.post_id,p.vacancy_no,post_name from main.posts p where p.notice_id=${notice['notice_id']} order by post_id`
      notices[key]['posts'] = await myDB.sqlQry({
        sql,
        cacheKey: `postnotice_public:${notice['notice_id']}`,
        cache: 1,
      })
    }
    return {
      data: notices,
      message: 'ok',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const post = async (params, reply) => {
  try {
    const { post_id } = params
    if (myValue.isEmpty(post_id)) throw Error('Post ID is not found!')
    const ministry = `COALESCE((select keytext from my_master('ministry') where keyid=p.ministry_code::text),'') as ministry`
    const organisation = `COALESCE((select keytext from my_master('organisation') where keyid=p.org_code::text),'') as organisation`
    const department = `COALESCE((select keytext from my_master('department') where keyid=p.dept_code::text),'') as department`
    let sql = `select pd.*,p.*,${ministry},${department},${organisation} from main.posts_notices n,main.posts p left join main.post_description pd on (p.post_id=pd.post_id) where p.notice_id=n.notice_id and p.post_id=${post_id}::int and ${active_notice}`
    let data = {}
    data['post'] = await myDB.sqlQry({
      sql,
      cacheKey: `post_description:${post_id}`,
      cache: 30,
    })
    sql = `select pv.post_id,community_code,coalesce(vacancy,0) vacancy,coalesce(vacancy_m,0) vacancy_m,coalesce(vacancy_f,0) vacancy_f,coalesce(vacancy_o,0) vacancy_o from main.post_vacancy pv,(select * from main.posts where post_id=${post_id}) p where p.post_id=pv.post_id order by p.post_id,pv.community_code`
    data['vacancy'] = await myDB.sqlQry({
      sql,
      cacheKey: `post_vacancy:${post_id}`,
      cache: 30,
    })
    // post Modules data phsuitablities, agerelax
    return {
      data,
      message: 'ok',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}
