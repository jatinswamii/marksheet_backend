import { myDB,sqlCond } from '../../../utils/db/dbHelper'
import { handleServerError } from '../../../helpers/server/serverErrors'
import moment from 'moment'
import { myValue,utils } from '../../../utils/coreUtils'

// export const list = async (params, reply) => {
//   try {
//     let cond=''
//     cond += sqlCond({ field: 'notice_id', params:params?.data,required:true })
//     const sql = `select * from main.posts left join main.post_description where '1' ${cond} order by post_id desc`
//     const rows = await myDB.sqlQry({ sql })
//     let data=[]
//     for (const [i, row] of Object.entries(rows)) {
        
//     }
    
//     for()
//     return { data: res, message: '' }
//   } catch (e) {
//     handleServerError(reply, e)
//   }
// }

