import { replace,trim, uniqBy, get,includes } from 'lodash'
import { handleServerError } from '../server/serverErrors'
import { myDB } from '../../utils/db/dbHelper'
import { myValue,getSqlTableCachekey } from '../../utils/coreUtils'
import { keydata } from '../../helpers/my/mastersQry'
export const getColumns = async (formId: string) => {
  try {
    const sql = `select * from my_forms_columns where COALESCE(active,1)!=0 AND formid= '${formId}' order by sortno`
    return await myDB.sqlQry({
      sql,
      cache: 1,
      cacheKey: `my_forms_columns:${formId}`,
    })
  } catch (e) {
    throw e
  }
}
export const getColumnsbyFieldIndex = async (formId: string) => {
  try {
    let columns = (await getColumns(formId)) as any
    return columns.reduce((rc, column) => {
      rc[column.field] = column
      return rc
    }, {})
  } catch (e) {
    throw e
  }
}

export const formioColumns = async (formId: string, cond = []) => {
  const sql = `select string_agg(field,',') from my_forms_columns where COALESCE(active,1)!=0 and COALESCE(dbfield,1)!=0 AND formid= '${formId}'`
  return await myDB.sqlQry({
    sql,
    cache: 1,
    cacheKey: `my_forms_columns_agg:${formId}`,
  })
}

export async function columnSelectOptions(columns, customModel, params, reply) {
  const colOptionsRessults = []

  try {
    for (let col of columns) {
      const { field, component, selectqry } = col
      switch (component) {
        case 'reactselect':
        case 'select-tree':
        case 'tree-list':
        case 'typehead':
        case 'select-tree-list':
        case 'rc-tree':
        case 'rc-select-tree':
        case 'react-select-draggable':
          let results = []
          let sql = selectqry
          if (customModel[`selectqry_${field}`]) {
            const rc = await customModel[`selectqry_${field}`](params, reply)
            if (!myValue.isEmpty(rc)) {
              if (typeof rc ==='string') sql=rc
              else if (!myValue.isEmpty(rc?.data)) {
                results=rc?.data
              }
            }
          }
          else {
            if (includes(sql,'{{')) {
              const { data }=params
              for(const [k,v] of Object.entries(data) as any) {
                if (myValue.isEmpty(v)) continue
                sql=replace(sql, `{{${k}}}`, v)
              }
            }
          }
          if (results.length===0) {
            if (!myValue.isEmpty(trim(sql))) {
              const cacheKey=getSqlTableCachekey(sql)
              const cache=myValue.isEmpty(cacheKey)?0:1
              results = await myDB.sqlQry({
                sql,
                cache,
                cacheKey,
              })
            }
          }
          let data = {}

          if (!myValue.isEmpty(get(col, 'options.data'))) {
            data = get(col, 'options.data')
            delete col['data']
          }
          col = Object.assign(col, {
            options: Object.assign(
              { ...get(col, 'options') },
              {
                data: results.concat(data),
              },
            ),
          })
          delete col.selectqry
          colOptionsRessults.push(col)
      }
      colOptionsRessults.push(col)
    }
  } catch (e) {
    handleServerError(reply, e)
  }

  return uniqBy(colOptionsRessults, 'field')
}

export const formKeyColumns = async (formId) => {
  const sql = `select * from my_forms_columns where COALESCE(active,1)!=0  AND formid= '${formId}'`
  let columns= await keydata({
    cacheKey: `my_forms_keycolumns:${formId}`,
    sql,
    keyid: 'field',
  })
  for(let key in columns) {
    delete columns[key]?.selectqry
    delete columns[key]?.options
    delete columns[key]?.addattrs
  }
  return columns
}
export const formSortColumns = async (formId) => {
  let fd = await myDB.tableQry({
    table: 'my_forms',
    where: {
      formid: formId,
    },
    cache:1,
    cacheKey:`my_forms:${formId}`
  })
  let sql = `select * from my_forms_columns where COALESCE(active,1)!=0  AND formid= '${formId}' order by sortno,title`
  const columns= await myDB.sqlQry({
    sql,
    cache: 1,
    cacheKey: `my_forms_sortcolumns:${formId}`,
  })
  for(let key in columns) {
    delete columns[key]?.selectqry
    delete columns[key]?.options
    delete columns[key]?.addattrs
  }
  return {
    title:fd[0]?.title,
    columns,
  }
}

