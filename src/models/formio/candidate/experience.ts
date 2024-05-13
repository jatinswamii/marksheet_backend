import { myValue } from 'utils/coreUtils'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'
import { get_subjects} from '../common/other_masters'


// export const select_employment_type = async (params, reply) => {
//   try {
//     const { post_id,module_id,module_type } = params
//     let sql = `select  m.keyid as value,m.keytext as label from my_master('resultype_score') m where m.parent_keyid='${result_type}' order by m.sortno,m.keytext`
//     if (!myValue.isEmpty(post_id)) {
    
//     }
//     const rows = await myDB.sqlQry({ 
//       sql,
//       cache:1,
//       cacheKey:`my_master:resultype_score:${result_type}`
//     })
//     return {
//       data: rows,
//       message: 'ok',
//     }
//   } catch (e) {
//     handleServerError(reply, e)
//   }
// }
