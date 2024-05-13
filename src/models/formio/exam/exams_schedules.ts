import { myDB } from '../../../utils/db/dbHelper'
import { handleServerError } from '../../../helpers/server/serverErrors'

export const list = async (params, reply) => {
  const { exam_code, exam_year } = params?.data
  let cond = ` and lower(e.exam_code)='${exam_code}' and e.exam_year=${exam_year}`
  try {
    
    const exam_subject_qry=`select e.exam_code,e.exam_year,s.exam_subject_id,s.subject_name from main.exams e,main.exams_subjects s where lower(e.exam_code)=lower(s.exam_code) ${cond}`;
    const sql=`select es.*,o.subject_name,o.exam_subject_id from (${exam_subject_qry}) o left join main.exams_schedules es on (o.exam_code=es.exam_code and o.exam_year=es.exam_year and o.exam_subject_id=es.exam_subject_id)`;
    const res = await myDB.sqlQry({sql})
    return { data: res, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}
