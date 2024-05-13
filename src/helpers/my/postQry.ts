import { data } from './../../models/formio/candidate/application';
import { has } from 'lodash'
import { myDB, sqlCond } from '../../utils/db/dbHelper'
import { myValue, utils } from '../../utils/coreUtils'
import { keydata, masters } from './mastersQry'
import { redisGet, redisSet } from '../../utils/redisClient'
import { handleServerError } from '../../helpers/server/serverErrors'

export const post = {
  info: async (params) => {
    try {
      const { post_id } = params
      const issued = `to_char(notice_date,'YYYYMMDDHH24MI') <= to_char(NOW(),'YYYYMMDDHH24MI') as issued`
      const challan_closed = `to_char(close_date - INTERVAL '1 DAY','YYYYMMDDHH24MI') < to_char(NOW(),'YYYYMMDDHH24MI:SS') as challan_closed`
      const revise_closed = `to_char(close_date + INTERVAL '7 DAY','YYYYMMDDHH24MI') < to_char(NOW(),'YYYYMMDDHH24MI:SS') as revise_closed`
      const closed = `to_char(close_date,'YYYYMMDDHH24MI') < to_char(NOW(),'YYYYMMDDHH24MI') as closed`
      let sql = `select p.*,EXTRACT(YEAR FROM issue_date) as year,n.notice_id,to_char(notice_date,'YYYY-MM-DD HH24:MI:SS')  notice_date,to_char(close_date,'YYYY-MM-DD HH24:MI:SS') close_date,calculation_date,${issued},${closed},${challan_closed},${revise_closed},COALESCE(approval,0) as approval from main.posts p,main.posts_notices n where p.notice_id=n.notice_id  and p.post_id=${post_id}`
      const rows = await myDB.sqlQry({
        sql,
        // cache: 15*60,
        // cacheKey: `post_id:${post_id}`,
      })
      if (rows.length === 0) throw new Error('PostId is not found')
      const row = rows[0]
      let status = ''
      if (row['approval'] === 1) {
        if (row['issued']) {
          status = row['closed'] ? 'closed' : 'open'
        } else {
          status = 'ready'
        }
      } else status = 'unapproved'
      row['status'] = status
      
      return row
    } catch (e) {
      throw e
    }
  },
  reviseablePosts: async (params)=>{
    try {
      //const sql=`select post_id from main.posts where notice_id in (select notice_id from main.posts_notices n where to_char(notice_date,'YYYYMMDDHH24MI') <= to_char(NOW(),'YYYYMMDDHH24MI') and (to_char(close_date,'YYYYMMDDHH24MI') < to_char(NOW(),'YYYYMMDDHH24MI') and to_char(close_date + INTERVAL '7 DAY','YYYYMMDDHH24MI') >= to_char(NOW(),'YYYYMMDDHH24MI')) and COALESCE(approval,0)=1) `
      const sql=`select post_id,to_char(close_date + INTERVAL '7 DAY','DD/MM/YYYY') close_date from main.posts p,main.posts_notices n where p.notice_id=n.notice_id and p.notice_id in (select notice_id from main.posts_notices n where to_char(notice_date,'YYYYMMDDHH24MI') <= to_char(NOW(),'YYYYMMDDHH24MI') and ( to_char(close_date + INTERVAL '7 DAY','YYYYMMDDHH24MI') >= to_char(NOW(),'YYYYMMDDHH24MI')) and COALESCE(approval,0)=1) `
      return await myDB.sqlQry({
        sql,
        cache: 1,
        cacheKey: `post_notice_revise`,
      })
    }
    catch(e) {
      throw e
    }
  },
  addReadOnly: async ({ params, rows, reply }) => {
    try {
      const row = await post.info(params)
    

      rows = rows.map((row) => {
        return { ...row, readonly: row?.approval }
      })
      return rows
    } catch (e) {
      handleServerError(reply, e)
    }
  },
  vacancy: async (params) => {
    try {
      const { post_id } = params
      //ORA vacancy allowed to specific Gender/community/ph
      const g_vacancy = `(COALESCE(vacancy_m,0)+COALESCE(vacancy_f,0)+COALESCE(vacancy_o,0))`
      const sql = `select lower(community_code) as community_code,vacancy,vacancy_m,vacancy_f,vacancy_o,${g_vacancy} g_vacancy from main.post_vacancy where COALESCE(vacancy,0) >0 and post_id =${post_id} `
      return await keydata({
        cacheKey: `post_vacancy:${post_id}`,
        sql,
        keyid: 'community_code',
      })
    } catch (e) {
      throw e
    }
  },
  post_qlevel_experience: async (params) => {
    try {
      const { post_id } = params
      let sql = `select * from main.post_qlevel_experience where post_id=${post_id}`
      return await keydata({
        cacheKey: `post_qlevel_experience:${post_id}`,
        sql,
        keyid: 'qlevel',
      })
    } catch (e) {
      throw e
    }
  },
  modules: async (params) => {
    //post_module_data
    try {
      let { post_id, post_type } = params
      post_type = post_type === 's' ? 'soap' : 'ora'
      const post_module_data = `select pd.post_module_id,pd.module_id,pd.module_type,pd.module_data,pd.message,pd.warning,pd.specializations from main.post_modules_data pd where post_id=${post_id}`
      const select_fields = `pm.module_id,pm.name,pm.custom,pm.sortno,pm.app_group,pm.candidate_formid,pm.${post_type}_app,COALESCE(pd.module_type,pm.module_type) module_type,pd.module_data,pd.message,pd.warning,pd.specializations`
      let sql = `select ${select_fields} from main.post_module_master pm  left join (${post_module_data}) pd on (pm.module_id=pd.module_id) where (pm.${post_type}_app in ('R','A') or COALESCE(pd.module_id,0)!=0) order by pm.sortno`
      return await myDB.sqlQry({
        sql,
        cache: 1,
        cacheKey: `post_modules_data:${post_id}`,
      })
    } catch (e) {
      throw e
    }
  },
  modulesIDwise: async (params) => {
    const rows = await post.modules(params)
    let data = {}
    rows.forEach((row) => (data[row['module_id']] = row))
    return data
  },
  rules: async (params) => {
    try {
      let { exam_id, post_id, post_editable, rule_id } = params
      let post_rules
      post_rules = `select * from main.post_rules where post_id=${post_id}`

      let _wcond = ''
      if (!myValue.isEmpty(rule_id)) {
        _wcond = ` where m1.rule_id = '${rule_id}'`
      }
      let fields = [
        'age_relax',
        'no_of_attempts',
        'fee_exempt',
        'active',
        'rules_exception',
        'exp_relax'
      ] as any

      fields = fields
        .map((field) => `CASE WHEN coalesce(m2.rule_id,'') !='' THEN m2.${field} ELSE m1.${field} END ${field}`)
        .join(',')

      fields =`m1.rule_id,m1.rule_group,m1.rule_name,m1.criteria,${fields}`

      let sql = `select ${fields} from master_rules m1 left join (${post_rules}) m2 on (m1.rule_id=m2.rule_id) ${_wcond}`
      if (!myValue.isEmpty(post_editable)) {
        return await myDB.sqlQry({ sql })
      }
      return await keydata({
        cacheKey: `post_rules:${post_id}`,
        sql,
        keyid: 'rule_id',
      })

    } catch (e) {
      throw e
    }
  },
  exam_stream_rules: async (params) => {
    try {
      let { post_id, post_editable, exam_stream_rule_id } = params
      let post_rules = `select * from main.post_exam_stream_rules where post_id=${post_id}`
      let _wcond = ''
      if (!myValue.isEmpty(exam_stream_rule_id)) {
        _wcond = ` and r.exam_stream_rule_id = '${exam_stream_rule_id}'`
      }
      const exam_stream_qry = `select * from master_exam_streams where exam_id=(select exam_id from main.posts where post_id=${post_id})`
      const mqry = `select exam_stream,r.* from master_exam_stream_rule r,(${exam_stream_qry}) s  where r.exam_stream_id=s.exam_stream_id ${_wcond}`
      let fields = [
        'age_min_gen',
        'age_max_gen',
        'qualification_core_level',
        'eq_qual_codes',
        'foe_codes',
        'subjects',
        'is_ph_allowed',
        'excluded_community',
        'nationality',
        'active'
      ] as any
      fields = fields
        .map((field) => `CASE WHEN coalesce(m2.exam_stream_rule_id,0) >0 THEN m2.${field} ELSE m1.${field} END ${field}`)
        .join(',')
      let sql = `select m1.exam_stream_rule_id,m1.exam_stream_id,m1.exam_stream,m1.gender,m1.marital,m1.additionaltype,${fields} from (${mqry}) m1 left join (${post_rules}) m2 on (m1.exam_stream_rule_id=m2.exam_stream_rule_id)`
      if (!myValue.isEmpty(post_editable)) {
        return await myDB.sqlQry({ sql })
      }
      return await keydata({
        cacheKey: `post_exam_stream_rules:${post_id}`,
        sql,
        keyid: 'exam_stream_rule_id',
      })
    } catch (e) {
      throw e
    }
  },
  alldata: async (post_id) => {
    try {
      let pd = {}
      const cacheKey = `post_alldata:${post_id}`
      pd = await redisGet(cacheKey)
      if (myValue.isNil(pd)) {
        pd = {}
        pd['post_id'] = post_id
        pd['postinfo'] = await post.info({ post_id })
        pd['post_exam_info'] =  await post.exam_info({ exam_id: pd['postinfo']?.exam_id })
        pd['vacancy'] = await post.vacancy({ post_id })
        const post_type = pd['postinfo']?.post_type
        pd['pmd'] = await post.modulesIDwise({ post_id, post_type })
        pd['postrules'] = await post.rules(pd)
        if (pd['postinfo'].post_type === 'o') {
          pd['post_qlevel_experience'] = await post.post_qlevel_experience({
            post_id,
          })
        } else {
          pd['exam_stream_rules'] = await post.exam_stream_rules({ post_id })
        }
        await redisSet(cacheKey, pd, 1)
      }
      else {
        pd['postinfo'] = await post.info({ post_id })
      }
      
      pd['pm'] = await masters.postModules()
      
      return pd
    } catch (e) {
      throw e
    }
  },
  ifc_module_data: (pmd, module_id, formid, field) => {
    try {
      let md = pmd?.[module_id]?.module_data
      if (has(md, formid)) md = md[formid]
      if (has(md, field)) md = md[field]
      return md
    } catch (e) {
      throw e
    }
  },
  exam_info: async ({exam_id}) => {
    try {
      const row = await myDB.sqlQry({ sql: `select exam_code from master_exams WHERE exam_id=${exam_id}`})
      return row?.[0]
    }catch(e){
      throw e
    }
  },
}
