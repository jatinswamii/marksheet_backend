import { Prisma } from '@prisma/client'
import moment from 'moment'
import { every, has, remove } from 'lodash'
import map from 'lodash/map'
import round from 'lodash/round'
import { myValue, utils } from '../coreUtils'
import { toString } from 'lodash'

const modeltableName = (tableName) => {
  const _table = tableName.split('.')
  if (_table.length > 1) return _table[1]
  return tableName
}

export const getUniqFields = (tableName: string) => {
  tableName = modeltableName(tableName)
  const modalUniqfields = Prisma.dmmf.datamodel.models.find((model) => {
    return model.name === tableName
  })?.uniqueFields
  return modalUniqfields
}

export const uniqFieldsMatched = (tableName, pkeys) => {
  const ukeys = getUniqFields(tableName) as any
  if (typeof pkeys === 'string') pkeys = pkeys.split(',')
  for (const ukey in ukeys) {
    const match = every(ukey, (key) => pkeys.includes(key))
    if (match) return true
  }
  return false
}

export const getFieldAttributes = (tableName: string) => {
  let fieldattrs = {}
  tableName = modeltableName(tableName)
  try {
    const modalfields = Prisma.dmmf.datamodel.models.find((model) => {
      return model.name === tableName
    })?.fields

    const mappedFieldTypes = map(modalfields, ({ type, name }) => {
      fieldattrs[name] = type
    })
  } catch (e) {}
  return fieldattrs
}

export const serializeField = (type, value): any => {
  switch (type) {
    case 'BigInt':
      return BigInt(value)
    case 'Int':
    case 'SmallInt':
    case 'Integer':
    case 'Numeric':
      return parseInt(value) //|| null
    case 'Float':
      return parseFloat(value) //|| null
    case 'Decimal':
      value = parseFloat(value) //|| null
      if (value === null) return null
      return round(value, 2)
    case 'Json':
    case 'JsonB':
      if (typeof value === 'object') return JSON.stringify(value)
      else {
        if (myValue.isEmpty(value)) return JSON.stringify("")
        return  value
      }   
    case 'Date':
    case 'DateTime':
      if (utils.isValidIsoDate(value)) return value
      if (value.length === 10) {
        return utils.getValidDate(value)
      }
      return moment(value, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
    case 'String':
      value=myValue.sqlSafe(toString(value))
      return value
  }
  return myValue.sqlSafe(toString(value))
}

export const dbSerializeData = (table: string, data: any, fieldsattr?: {}) => {
  if (Object.keys(fieldsattr).length === 0)
    fieldsattr = getFieldAttributes(table)
  for (const [field, type] of Object.entries(fieldsattr)) {
    if (!has(data, field)) continue
    if (myValue.isNil(data[field])) {
      data[field]='null'
      continue
    }
    const value = serializeField(type, data[field])
    if (myValue.isNil(value)) delete data[field]
    else data[field] = value
  }
  return data
}
