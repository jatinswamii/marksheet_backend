import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'
import { appModuleCond } from '../application/modules'
import { myValue } from '../../../utils/coreUtils'
import { getColumnfromSchema,mergeColumnsValuesInSchema } from '../../../helpers/formio/formio.common'
import { post } from '../../../helpers/my/postQry'
//select keyid as value,keytext as label from  my_master('qualification') order by CAST (keyid AS INTEGER),keytext
export const afterSchema = async (params, reply) => {
  try {
    let { data } = params
    let options=await select_qual_code(data, reply)
    let column=getColumnfromSchema(params.fschema,'qual_code')
    options=Object.assign(column['options'],options)
    column["options"] = options
    params.fschema = mergeColumnsValuesInSchema(params.fschema, {'qual_code':column})
    return params
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_qual_code = async (params, reply) => {
  try {
    const { post_id } = params
    let cond =''
    if (!myValue.isEmpty(post_id)) {
      const p=await post.info({post_id})
      if (p?.post_type==='o') {
        cond = appModuleCond(params, reply)
        const pm_sql = `select(jsonb_object_keys(module_data->'pm_qualifications')) from main.post_modules_data where module_data?'pm_qualifications' ${cond}`
        cond=`where keyid in (${pm_sql})`
      }
    }
    const sql = `select keyid as value,keytext as label from  my_master('qualification') ${cond} order by CAST (keyid AS INTEGER),keytext`
    const rows = await myDB.sqlQry({ sql })
    return {
      data: rows,
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_branch_code = async (params, reply) => {
  try {
    const { qual_code, post_id } = params
    let cond=''
    let pm_sql =''
    
    if (!myValue.isEmpty(post_id)) {
      const p=await post.info({post_id})
      if (p?.post_type==='o') {
        cond = appModuleCond(params, reply)
        pm_sql = `select jsonb_array_elements_text(module_data->'pm_qualifications'->'${qual_code}') as branch_code from main.post_modules_data where module_data->'pm_qualifications'?'${qual_code}' ${cond}`
        cond=` and keyid in (${pm_sql})`
      }
    }
    cond=`${cond} and m.parent_keyid='${qual_code}'`
    const sql = `select  m.keyid as value,m.keytext as label from my_master('subject') m where '1' ${cond} order by m.sortno,m.keytext`
    let rows = await myDB.sqlQry({ sql })
    let add_other=true
    if (pm_sql !=='') {
      const orow = await myDB.sqlQry({ sql:`select * from (${pm_sql}) o where branch_code='9999'` })
      if (orow.length ===0) add_other=false
    }
    if (add_other) rows.push({"value":"9999","label":"Other"})
    return {
      data: rows
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}


export const select_scoring_code = async (params, reply) => {
  try {
    const { result_type } = params

    const sql = `select  m.keyid as value,m.keytext as label from my_master('resultype_score') m where m.parent_keyid='${result_type}' order by m.sortno,m.keyid::int`
    const rows = await myDB.sqlQry({
      sql,
      cache: 1,
      cacheKey: `my_master:resultype_score:${result_type}`,
    })
    return {
      data: rows,
      message: 'ok',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}
