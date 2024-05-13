import { myDB } from '../../../utils/db/dbHelper'
import { handleServerError } from '../../../helpers/server/serverErrors'

export const list = async (params, reply) => {
  const {formId}= params;
  
  const { exam_code, exam_year, rollno } = params?.data
  let cond = ` and lower(e.exam_code)='${exam_code}' and e.exam_year=${exam_year}`
  let results_ssb_marks='main.results_ssb_marks'
  switch(formId) {
    case 'result_ssb_marks1':
    case 'result_ssb_marks2':
      results_ssb_marks=`(select * from main.results_ssb_marks where rollno =${rollno})`
      break
    case 'result_ssb_marks_final':
      break
    case 'result_ssb_marks_unmatched':
        results_ssb_marks=`(select * from main.results_ssb_marks where user1_marks != user2_marks)`
        break
  }

  try {
    const exam_subject_qry=`select e.exam_code,e.exam_year,s.exam_subject_id,s.subject_name from main.exams e,main.exams_subjects s where lower(e.exam_code)=lower(s.exam_code) ${cond}`;
    const sql=`select r.*,o.subject_name,o.exam_subject_id from ${exam_subject_qry} o left join (${results_ssb_marks}) r on (o.exam_code=r.exam_code and o.exam_year=r.exam_year and o.exam_subject_id=r.exam_subject_id) `;
    const res = await myDB.sqlQry({sql})
    return { data: res, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}