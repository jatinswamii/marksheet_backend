import { handleServerError } from '../../../helpers/server/serverErrors'
import { exitInvalidPkeys } from '../../../helpers/formio/formio.common'
import { myDB } from '../../../utils/db/dbHelper'
import { myValue } from '../../../utils/coreUtils'

export const exam_stream_rules=async (params) => {
  try {
    let { exam_id, exam_stream_rule_id } = params
    let _wcond=''
    if (!myValue.isEmpty(exam_stream_rule_id)) {
      _wcond = ` and r.exam_stream_rule_id = '${exam_stream_rule_id}'`
    }
    const exam_stream_qry=`select * from master_exam_streams where exam_id=${exam_id}`
    const sql=`select r.* from master_exam_stream_rule r,(${exam_stream_qry}) s  where r.exam_stream_id=s.exam_stream_id ${_wcond}`
    return await myDB.sqlQry({ sql })
  } catch (e) {
    throw e
  }
}

export const get = async (params, reply) => {
  try {
    exitInvalidPkeys(params,reply)
    let rows= await exam_stream_rules({...params?.data})
    return { data: rows, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}


export const list = async (params, reply) => {
  try {
    let rows= await exam_stream_rules({...params?.data})
    return { data: rows, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_exam_stream_id = async(params,reply)=>{
  try {
    const { exam_id } = params
    const sql = `select exam_stream_id value,exam_stream label from master_exam_streams where exam_id=${exam_id} order by exam_stream`
    return await myDB.sqlQry({ sql })
  } catch (e) {
    handleServerError(reply, e)
  }
}


// export const selectqry_subjects=async(params,reply)=>{
//   try {
//     const res = await getMastersTreeData(["qualification","subject"])
//     return { data: res}
//   } catch (e) {
//     handleServerError(reply, e)
//   }
// }
// export const select_subjects = async(params,reply)=>{
//   try {
//     const res = await getMastersTreeData(["qualification","subject"])
//     return { data: res}
//   } catch (e) {
//     handleServerError(reply, e)
//   }
// }