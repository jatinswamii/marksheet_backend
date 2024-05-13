import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB,whereCond } from '../../../utils/db/dbHelper'
import { myValue, utils } from '../../../utils/coreUtils'
import { exitInvalidPkeys } from '../../../helpers/formio/formio.common'
import { masters } from '../../../helpers/my/mastersQry'
import { post } from '../../../helpers/my/postQry'
import { has,toString } from 'lodash'

export const getData=async(params,reply)=>{
  try {
    const cond=whereCond({params:params['cond'],prefix:'p'})
    let lastpart='order by p.post_id'
    const sql=`select p.*,COALESCE(n.approval,0) as readonly from main.posts p,main.posts_notices n where p.notice_id=n.notice_id and ${cond} ${lastpart}`
    return await myDB.sqlQry({sql})
  } catch (e) {
    handleServerError(reply, e)
  }
}
export const get =async (params,reply)=>{
  exitInvalidPkeys(params, reply)
    try {
      return { data: await getData(params,reply) }
    } catch (e) {
      handleServerError(reply, e)
    }
}

export const list =async (params,reply)=>{
  try {
    return { data: await getData(params,reply) }
  } catch (e) {
    handleServerError(reply, e)
  }
}
export const upsert = async (params, reply) => {
  try {
    let { formId, data:_data,upsert_payload: data } = params
    let sno, sql
    if (formId === 'posts_soap') {
      data['exam_section'] = 0
      data.serialno = 0
      //Soap posts
      if (myValue.isEmpty(data?.exam_id))
        throw new Error('Post exam_id is empty!')
      const exams = await masters.master_exams()
      if (!has(exams, _data?.exam_id)) throw new Error('Exam code is not found!')
      sno = _data?.exam_id
      data.post_name = exams[_data.exam_id].exam_name
    } else {
      sno = data?.serialno
      if (myValue.isEmpty(data?.exam_section))
        throw new Error('Post exam_section is empty!')
    }
    sql = `select to_char("notice_date", 'YYMMDD') notice_date,EXTRACT(YEAR FROM notice_date) as year  from main.posts_notices where notice_id='${data?.notice_id}'`
    const notice = await myDB.sqlQry({ sql })
    if (notice.length !== 1) throw new Error('Post notice id is not found!')

    data.vacancy_no = `${notice[0]['notice_date']}${
      data?.exam_section
    }${utils.leftZeroPad(sno, 2)}`
    if (formId === 'posts_soap') data.exam_year = notice[0]['year']
    exitInvalidPkeys(params, reply)

    let res = await myDB.upsert({
      table: params['dbtable'],
      where: params['cond'],
      // pkeys: Object.keys(params['cond']) as [],
      data,
      log:{
        formid:params['formId'],
        ip:params?.ip,
        authUser:params?.authUser,
      }
    })
    
    // if (myValue.isEmpty(data.vacancy_no)) {
    //   delete data?.vacancy_no
    //   res = await myDB.insert({
    //     table: params['dbtable'],
    //     data: data,
    //   })
    // } else {
    //   res = await myDB.update({
    //     table: params['dbtable'],
    //     data: data,
    //     where: params['cond'],
    //   })
    // }
    return res
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_dept_code = async (params, reply) => {
  try {
    const { ministry_code } = params
    const sql = `select  m.keyid as value,m.keytext as label from my_master('department') m where m.parent_keyid='${ministry_code}' order by m.sortno,m.keytext`
    return await myDB.sqlQry({ sql })
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_org_code = async (params, reply) => {
  try {
    const { dept_code } = params
    const sql = `select  m.keyid as value,m.keytext as label from my_master('organisation') m where m.parent_keyid='${dept_code}' order by m.sortno,m.keytext`
    return await myDB.sqlQry({ sql })
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const alldata=async (params, reply)=>{
  try {
    const { post_id } = params
    return await post.alldata(post_id)
  } catch (e) {
    handleServerError(reply, e)
  }
}
