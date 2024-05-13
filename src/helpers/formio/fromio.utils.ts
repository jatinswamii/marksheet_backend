import {
  filter,
  has,
  includes,
  map,
  concat,
  split,
  isEqual,
  toString,
  trim,
} from 'lodash'

import { getFormCustomModel } from '../../helpers/formio/formio.common'
import { myform } from '../../controllers/formio.controller'
import {
  columnSelectOptions,
  getColumns,
} from '../../helpers/formio/getColumns'
import { myValue, utils } from '../../utils/coreUtils'
import { masterKeyData } from '../my/masterKeyData'
const path = require('path')

export const getFormSchema = async (formid, data) => {
  try {
    const params = {
      formId: formid,
      action: 'schema',
      data,
    }
    return await myform(params, {}, false, {})
  } catch (e) {
    throw e
  }
}

export const mySchemaColumns = async (fschema, data = {}) => {
  try {
    let columns
    if (myValue.isEmpty(fschema?.formid)) return columns
    if (!myValue.isEmpty(fschema?.sections)) {
      fschema?.sections.forEach((section, i) => {
        if (has(section, 'columns')) {
          section.columns = section.columns.filter((column) => {
            columns[column.field] = column
          })
        }
      })
    } else {
      const customModel = getFormCustomModel(fschema)
      columns = await getColumns(fschema?.formid)
      columns = await columnSelectOptions(columns, customModel, { data }, {})
      columns = columns.reduce((rc, column) => {
        rc[column.field] = column
        return rc
      }, {})
    }
    return columns
  } catch (e) {
    throw e
  }
}

export const getModeloptions = async (params, model, field, reply) => {
  try {
    params = { ...params, ...params?.data }
    const action = `select_${field}`
    let modelPath = path.join('../../models/formio', model)
    //console.log("get model options",modelPath)
    const customModel = require(modelPath)
    if (has(customModel, action)) {
      return await customModel[action](params, reply)
    }
  } catch (e) {
    //console.log("error===>",e)
  }
  return []
}

export const mySchemaColumnsOptionKeyData = async (params, columns) => {
  let selectCols = {}
  try {
    for (let [field, column] of Object.entries(columns) as any) {
      switch (column.component) {
        case 'reactselect':
        case 'select-tree':
        case 'tree-list':
        case 'typehead':
        case 'select-tree-list':
        case 'rc-tree':
        case 'rc-select-tree':
        case 'react-select-draggable':
        case 'typehead':
          let options = column?.options?.data
          let model = toString(column?.options?.model)
          if (!myValue.isEmpty(model)) {
            //IF No Child Field
            if (myValue.isEmpty(column?.options?.child_field))
              options = await getModeloptions(params, model, field, {})
          }
          if (!myValue.isEmpty(options)) {
            if (options.length === 1) {
              if (Object.keys(options[0]).length === 0) options = []
            }
          }
          if (!myValue.isEmpty(options)) {
            selectCols[field] = options.reduce((rc, option) => {
              if (!myValue.isNil(rc)) {
                rc[toString(option.value)] = option.label
                return rc
              }
            }, {})
          } else {
            selectCols[field] = await masterKeyData(field)
          }
          break
      }
    }
    return selectCols
  } catch (e) {
    throw e
  }
}

export const formDisplayData = async (params, rows) => {
  try {
    const fschema = params?.fd
    if (myValue.isEmpty(rows)) return rows
    const columns = await mySchemaColumns(fschema)
    const selectCols = await mySchemaColumnsOptionKeyData(params, columns)

    if (Object.keys(selectCols).length == 0) return rows
    return rows.map((row) => {
      for (let [field, value] of Object.entries(row) as any) {
        if (has(selectCols, field)) {
          if (!Array.isArray(value)) value=[value]
          let v=[]
          for (let _v of value) {
            _v=toString(_v) as any
            _v = has(selectCols[field], _v) ? selectCols[field][_v] : _v
            v.push(_v)
          }
          //field's dummy exist than row value in dummy field
          const _field = has(columns, `${field}.dummy`)
            ? `${field}.dummy`
            : field
          row[_field] = v.join(',')
        }
      }
      return row
    })
  } catch (e) {}
  return rows
}
