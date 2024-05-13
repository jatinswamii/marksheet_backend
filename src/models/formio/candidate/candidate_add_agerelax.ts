import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'
import {
  removeColumnsfromSchema,
  mergeColumnsValuesInSchema,
} from '../../../helpers/formio/formio.common'

export const afterSchema = async (params, reply) => {
  try {
    let {
      data: { rule_id },
    } = params
    const _fields = ['type', 'atype']
    let removecolumns = []
    let mergeColumns = {}
    for (let i in _fields) {
      const type = _fields[i]
      const field = `agerelax_${type}`
      if (type !== 'type') rule_id = `${rule_id}_${type}`
      let sql = `select keyid as value,keytext as label from my_master('${rule_id}') order by sortno,keytext`
      let rows = await myDB.sqlQry({ sql })
      if (rows.length === 0) removecolumns.push(field)
      else {
        mergeColumns[field] = {
          options: { data: rows },
        }
      }
    }
    if (Object.keys(mergeColumns).length > 0)
      params.fschema = mergeColumnsValuesInSchema(params.fschema, mergeColumns)
    if (removecolumns.length > 0) 
      params.fschema = removeColumnsfromSchema(params.fschema, removecolumns)
    return params
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_agerelax_atype = async (params, reply) => {
  try {
    const { agerelax_category } = params
    const sql = `select keyid as value,keytext as label from my_master('${agerelax_category}_atype') order by sortno,keytext`
    const rows = await myDB.sqlQry({ sql })
    return {
      data: rows,
      message: 'ok',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}
