import { includes, toString, has, startsWith } from 'lodash'
import { prisma, paramSqlQry } from '../prismaClient'
import { myValue } from '../coreUtils'
import { formlogs } from './formHistroy'
import {
  getFieldAttributes,
  dbSerializeData,
  uniqFieldsMatched,
} from './dbSerialzation'
import { redisGet, redisSet } from '../redisClient'

const conv_TypeCast = (fieldtype, key, i) => {
  let castType = ''
  switch (fieldtype) {
    case 'BigInt':
    case 'Int':
    case 'SmallInt':
    case 'Float':
    case 'Decimal':
      castType = fieldtype
      break
    case 'Date':
    case 'DateTime':
      castType = 'date'
      break
    case 'Json':
    case 'JsonB':
      return `${key}::Text = $${i + 1}`
    default:
      return `${key} = $${i + 1}`
  }
  if (castType != '') {
    return `${key} = $${i + 1}::${castType}`
  }
}
export const sqlCond = ({
  field,
  params,
  op = '=',
  column = '',
  required = false,
}: {
  field: string
  params: {}
  op?: string
  column?: string
  required?: boolean
}) => {
  try {
    let d = has(params, field) ? params[field] : ''
    if (myValue.isEmpty(d)) {
      if (required) throw new Error(`${field} is required!`)
      return ''
    }
    if (myValue.isEmpty(column)) column = field
    if (Array.isArray(d)) return ` and ${column} in ['${d.join("','")}']`
    if (!(typeof d === 'bigint' || typeof d === 'number')) {
      if (d.indexOf('%') !== -1 && op === '=') {
        op = 'ilike'
      }
      return ` and ${column} ${op} '${d}'`
    } else {
      return ` and ${column} ${op} ${d}`
    }
  } catch (e) {
    throw e
  }
}

export const whereCond = ({
  params,
  fieldsattr = {},
  withWhere = '',
  prefix = '',
}: {
  params: any
  fieldsattr?: {}
  withWhere?: string
  prefix?: string
}) => {
  const conds = whereParams({ params, fieldsattr, prefix })
  return paramSqlQry(conds['cond'], conds['values'])
}

export const whereParams = ({
  params,
  fieldsattr = {},
  withWhere = '',
  prefix = '',
}: {
  params: any
  fieldsattr?: {}
  withWhere?: string
  prefix?: string
}) => {
  const paramsItem = Array.isArray(params) ? params : [params]
  let conds = [] as any
  let values = [] as any
  let ii = 0
  prefix = prefix.trim() === '' ? '' : `${prefix.trim()}.`
  paramsItem.forEach((item, i) => {
    const keys = Object.keys(item)
    for (const key of keys) {
      // getting field attribute
      const field_info = fieldsattr[key] ? fieldsattr[key] : ''
      if (Array.isArray(item[key])) {
        conds.push(`${prefix}${key} in ['${item[key].join("','")}']`)
        // values.push(item[key])
      } else {
        if (!myValue.isNil(item[key])) {
          const f = conv_TypeCast(field_info, key, ii)
          conds.push(`${prefix}${f}`)
          values.push(item[key])
          ii = ii + 1
        }
      }
    }
  })

  conds = conds.join(' and ')
  if (conds.length === 0) {
    return {
      cond: '',
      values: '',
    }
  }

  return {
    cond: `${withWhere} ${conds}`,
    values: values,
  }
}

export const updateValues = (array) => {
  const arrayItem = Array.isArray(array) ? array : [array]

  let fields = [] as any

  arrayItem.forEach((item) => {
    const keys = Object.keys(item)
    for (const key of keys) {
      if (myValue.isNil(item[key])) {
        fields.push(`${key} = null`)
        continue
      }
      if (Array.isArray(item[key])) {
        fields.push(`${key} = ${toString(item[key])}`)
      } else {
        fields.push(`${key} = '${item[key]}'`)
      }
    }
  })
  fields = fields.join(' , ')
  return fields
}

const raw_qry: any = async ({
  sql,
  values = [],
  singlestatement = true,
  qryexe = false,
  cache = 0,
  cacheKey = '',
}: {
  sql: string
  values?: any
  singlestatement?: boolean
  qryexe?: boolean
  cache?: number
  cacheKey?: string
}): Promise<any> => {
  try {
    if (singlestatement) {
      const sqls = sql
        .split('\n')
        .filter((line) => line.indexOf('--') !== 0)
        .join('\n')
        .replace(/(\r\n|\n|\r)/gm, ' ') // remove newlines
        .replace(/\s+/g, ' ') // excess white space
        .split(';')
      sql = sqls[0].trim()
    }
    if (qryexe) return await prisma.$executeRawUnsafe(sql, ...values)
    else {
      let d
      if (cacheKey === '' && cache !== 0) {
        cacheKey = sql
        if (values.length > 0) cacheKey += JSON.stringify(values)
      }
      if (cache !== 0) {
        d = await redisGet(cacheKey)
        if (!myValue.isNil(d)) return d
      }
      d = await prisma.$queryRawUnsafe(sql, ...values)
      if (cache !== 0) {
        await redisSet(cacheKey, d, cache)
      }
      return d
    }
  } catch (e) {
    throw e
  }
}
const insertValues = ({
  table,
  rows,
  fields = [],
  safeinsert = true,
  fieldsattr = {},
  dbSerialize = false,
}: {
  table: string
  rows: any
  fields?: []
  safeinsert?: boolean
  fieldsattr?: {}
  dbSerialize?: boolean
}) => {
  fields =
    Array.isArray(fields) && !myValue.isEmpty(fields)
      ? fields
      : (Object.keys(rows[0]) as [])
  let rs = []
  rows.forEach((row: any) => {
    if (dbSerialize) row = dbSerializeData(table, row, fieldsattr)
    let values = []

    fields.forEach((field) => {
      let v = null
      if (has(row, field)) {
        if (safeinsert) row[field] = myValue.sqlSafe(row[field])
        v = `'${toString(row[field])}'`
      }
      values.push(v)
    })

    rs.push(values)
  })
  return rs
}

export const myDB = {
  upsert: async ({
    table,
    data,
    where,
    fields = [],
    safeinsert = false,
    fieldsattr = {},
    dbSerialize = false,
    log = {},
  }: {
    table: string
    data: object
    where: {}
    fields?: []
    safeinsert?: boolean
    fieldsattr?: {}
    dbSerialize?: boolean
    log?: {}
  }): Promise<any> => {
    try {
      const rows = Array.isArray(data) ? data : [data]
      const pkeys = Object.keys(where)

      if (Object.keys(pkeys).length === 0)
        throw new Error(`pkeys can't be empty`)
      if (Object.keys(fieldsattr).length === 0)
        fieldsattr = getFieldAttributes(table)
      if (!uniqFieldsMatched(table, pkeys)) {
        if (rows.length !== 1) {
          throw new Error(`Only single record can be upserted`)
        }

        let drows = await myDB.tableQry({
          table,
          where,
        })
        let res
        if (drows.length === 0) {
          res = await myDB.insert({
            table,
            data: rows,
            fields,
            safeinsert,
            fieldsattr,
            dbSerialize,
          })
        } else {
          if (Object.keys(log).length > 0) {
            log = { ...log, old_data: drows[0] }
          }
          res = await myDB.update({
            table,
            data,
            where,
            safeinsert,
            fieldsattr,
            dbSerialize,
            log,
          })
        }
        return res
      }
      fields =
        Array.isArray(fields) && !myValue.isEmpty(fields)
          ? fields
          : (Object.keys(rows[0]) as [])
      const rs = insertValues({
        table,
        rows,
        fields,
        safeinsert,
        fieldsattr,
        dbSerialize,
      })

      let updatekeys = []
      fields.forEach((field) => {
        if (includes(pkeys, field)) return
        updatekeys.push(`${field}=EXCLUDED.${field}`)
      })
      const upkeys = fields.filter(function (x) {
        return pkeys.indexOf(x) < 0
      })
      const sql = `insert into ${table} (${fields}) values (${rs.join(
        '),(',
      )}) on conflict (${pkeys.join(',')}) do update set ${updatekeys.join(
        ',',
      )}`
      return await raw_qry({ sql, qryexe: true })
    } catch (e) {
      throw e
    }
  },
  insert: async ({
    table,
    data,
    fields = [],
    safeinsert = false,
    fieldsattr = {},
    dbSerialize = false,
  }: {
    table: string
    data: object
    fields?: []
    safeinsert?: boolean
    fieldsattr?: {}
    dbSerialize?: boolean
  }): Promise<any> => {
    try {
      if (dbSerialize) {
        if (Object.keys(fieldsattr).length === 0)
          fieldsattr = getFieldAttributes(table)
      }
      const rows = Array.isArray(data) ? data : [data]
      fields =
        Array.isArray(fields) && !myValue.isEmpty(fields)
          ? fields
          : (Object.keys(rows[0]) as [])
      const rs = insertValues({
        table,
        rows,
        fields,
        safeinsert,
        fieldsattr,
        dbSerialize,
      })
      const sql = `insert into ${table} (${fields}) values (${rs.join('),(')})`
      return await raw_qry({ sql, qryexe: true })
    } catch (e) {
      throw e
    }
  },
  update: async ({
    table,
    data,
    where,
    safeinsert = false,
    fieldsattr = {},
    dbSerialize = true,
    log = {},
  }: {
    table: string
    data: {}
    where: {}
    safeinsert?: boolean
    fieldsattr?: {}
    dbSerialize?: boolean
    log?: {}
  }): Promise<any> => {
    try {
      if (Object.keys(where).length === 0)
        throw new Error(`keycond's can't be empty`)
      if (Object.keys(fieldsattr).length === 0)
        fieldsattr = getFieldAttributes(table)
      if (dbSerialize) {
        data = dbSerializeData(table, data, fieldsattr)
        where = dbSerializeData(table, where, fieldsattr)
      }
      const { cond, values } = whereParams({ params: where, fieldsattr })
      const res = await raw_qry({
        sql: `update ${table} set ${updateValues(data)} where ${cond}`,
        values,
        qryexe: true,
      })
      if (Object.keys(log).length > 0) {
        const formpkeyid = Object.values(where).join(',')
        log = { ...log, new_data: data, action: 'u', fieldsattr, formpkeyid }
        await formlogs(log)
      }
      return res
    } catch (e) {
      throw e
    }
  },
  tableQry: async ({
    table,
    where,
    selectfields = '',
    lastpart = '',
    fieldsattr = {},
    dbSerialize = true,
    qryexe = false,
    cache = 0,
    cacheKey = '',
  }: {
    table: string
    where: {}
    selectfields?: any
    lastpart?: string
    fieldsattr?: {}
    dbSerialize?: boolean
    qryexe?: boolean
    cache?: number
    cacheKey?: string
  }): Promise<any> => {
    try {
      if (Object.keys(fieldsattr).length === 0) {
        fieldsattr = getFieldAttributes(table)
      }
      if (dbSerialize) {
        where = dbSerializeData(table, where, fieldsattr)
      }

      const { cond, values } = whereParams({
        params: where,
        fieldsattr,
        withWhere: 'where',
      })
      if (Array.isArray(selectfields)) selectfields = selectfields.join(',')
      if (myValue.isEmpty(selectfields)) selectfields = '*'
      if (!myValue.isEmpty(lastpart)) lastpart = ` ${lastpart}`
      const sql = `select ${selectfields} from ${table}  ${cond} ${lastpart}`
      return await raw_qry({ sql, values, cache, cacheKey })
    } catch (e) {
      throw e
    }
  },
  delete: async ({
    table,
    where,
    fieldsattr = {},
    dbSerialize = true,
  }: {
    table: string
    where: {}
    fieldsattr?: {}
    dbSerialize?: boolean
  }): Promise<any> => {
    try {
      if (Object.keys(where).length === 0)
        throw new Error(`keycond's can't be empty`)

      if (Object.keys(fieldsattr).length === 0)
        fieldsattr = getFieldAttributes(table)

      if (dbSerialize) {
        where = dbSerializeData(table, where, fieldsattr)
      }

      const { cond, values } = whereParams({ params: where, fieldsattr })
      const sql = `delete from ${table} where ${cond}`
      return await raw_qry({ sql, values, qryexe: true })
    } catch (e) {
      throw e
    }
  },
  sqlQry: async ({
    sql,
    values = [],
    singlestatement = true,
    qryexe = false,
    cache = 0,
    cacheKey = '',
  }: {
    sql: string
    values?: any
    singlestatement?: boolean
    qryexe?: boolean
    cache?: number
    cacheKey?: string
  }): Promise<any> => {
    try {
      return await raw_qry({
        sql,
        values,
        singlestatement,
        qryexe,
        cache,
        cacheKey,
      })
    } catch (e) {
      throw e
    }
  },
}
