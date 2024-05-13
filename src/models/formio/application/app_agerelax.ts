import { myDB } from '../../../utils/db/dbHelper'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { myValue } from '../../../utils/coreUtils'

export const list = async (params, reply) => {
  try {
    let { post_id } = params?.data
    if (myValue.isEmpty(post_id)) throw new Error('Post ID is not found')
    post_id=parseInt(post_id)
    const post_agerelax = `select * from main.post_agerelax where post_id=${post_id}`
    let sql=`select m1.agerelax_group,string_agg(agerelax_category, ',') as agerelax_categories from master_agerelax m1 left join (${post_agerelax}) m2 on (m1.agerelax_catid=m2.agerelax_catid) where COALESCE(m2.age_relax,m1.age_relax) > 0 group by  m1.agerelax_group HAVING count(*) >0`
    const rows = await myDB.sqlQry({ sql })
    if (rows.length >0) throw new Error('Agerelax is not found')
    for (const [i, row] of Object.entries(rows)) {
      if (row["agerelax_group"]==="ph") {
        sql=`select module_data->'pm_phsuitablities'->'phsuitability' as phsuitability  from main.post_modules_data where module_id=1 and module_data?'pm_phsuitablities' and post_id=${post_id}`
        const md= await myDB.sqlQry({ sql })
        if (md.length >0) {
          rows[i]["ph"]=md[0]["phsuitability"]
        }
      }
    };
    return { data: rows, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}
