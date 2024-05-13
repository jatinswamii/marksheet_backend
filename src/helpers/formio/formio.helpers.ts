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
  isEmpty,
} from 'lodash'
import { handleServerError } from '../server/serverErrors'
import { myDB } from '../../utils/db/dbHelper'
import { getColumns, formioColumns, columnSelectOptions } from './getColumns'
import { uploadFile } from '../../controllers/fileupload.controller'
import { myValue, utils } from '../../utils/coreUtils'
import { exitInvalidPkeys } from './formio.common'
import { formDisplayData } from './fromio.utils'
import { F } from 'ramda'

const getUpsertPayload = async (params: any) => {
  params['cols'] = await getColumns(params?.formId)
  if (myValue.isEmpty(params['cols'])) {
    if (!myValue.isEmpty(params?.fd?.extra_props)) {
      const p = JSON.parse(params?.fd?.extra_props)
      if (!myValue.isEmpty(p?.link_form))
        params['cols'] = await getColumns(p?.link_form)
    }
  }
  let upsertPayload = {}

  const activeCols = map(
    filter(
      params['cols'],
      (col) => utils.parseInt({ value: col?.dbfield, defaultValue: 1 }) !== 0,
      //(col) =>  utils.parseInt({value:col?.dbfield,defaultValue:1 })!== 0 && utils.parseInt({value:col?.active,defaultValue:1 })!== 0 && utils.parseInt({value:col?.formview,defaultValue:1 })!== 0,
    ),
    (item) => item.field,
  )
  const colsWithPKey = concat(activeCols, split(params?.fd?.pkeys, ','))

  for (const [key, value] of Object.entries(params['data'])) {
    if (includes(colsWithPKey, key)) {
      upsertPayload = Object.assign(upsertPayload, { [key]: value })
    }
  }
  const pkeyid = params?.fd?.pkeyid

  if (!myValue.isEmpty(pkeyid)) {
    if (has(upsertPayload, pkeyid)) {
      delete upsertPayload[pkeyid]
    }
  }
  return upsertPayload
}

const handleFolderPath = (params) => {
  const {
    fd: { module },
  } = params

  switch (module) {
    case 'candidate':
      return `./${process.env.BASE_PATH}/${toString(
        params?.authUser?.registrationid,
      )?.slice(0, 2)}/${params?.authUser?.registrationid}/`
    default:
      return `./${process.env.BASE_PATH}/${module}/`
  }
}

const formFileUpload = async (params, reply) => {
  const { cols, upsert_payload } = params

  const fileInputCOls = map(
    cols.filter((col) => ['fileinput', 'webcam'].includes(col?.component)),
    (col) => col?.field,
  )

  for (const [key, _value] of Object.entries(upsert_payload)) {
    const folderPath = handleFolderPath(params)
    const file = params?.[`${key}_file`]

    if (includes(fileInputCOls, key) && file) {
      upsert_payload[key] = await uploadFile(file, folderPath, key, reply)
    } else {
      upsert_payload[key] = toString(upsert_payload[key])
    }
  }

  return upsert_payload
}

export const get = async (params, reply, customModel) => {
  let res = [] as any
  if (customModel['get']) res = await customModel['get'](params, reply)
  else {
    exitInvalidPkeys(params, reply)
    try {
      let selectfields = await formioColumns(params?.formId)
      selectfields = selectfields?.[0].string_agg
      res = await myDB.tableQry({
        table: params['dbtable'],
        where: params['cond'],
        selectfields,
        fieldsattr: params?.fieldsattr,
        dbSerialize: true,
      })
      if (customModel['afterGet']) {
        res = await customModel['afterGet'](params, reply, res)
      }
    } catch (e) {
      handleServerError(reply, e)
    }
  }

  if (has(res, 'data')) {
    return res
  }
  return {
    data: res,
    message: '',
  }
}

export const upsert = async (params, reply, customModel) => {
  if (customModel['beforeUpdate']) {
    try {
      params = await customModel['beforeUpdate'](params, reply)
    } catch (e) {
      handleServerError(reply, e)
    }
  }
  params['upsert_payload'] = await getUpsertPayload(params)
  params['upsert_payload'] = await formFileUpload(params, reply)
  let res = {} as any
  let action = ''
  if (customModel['upsert']) {
    res = await customModel['upsert'](params, reply)
  } else {
    try {
      exitInvalidPkeys(params, reply)
      res = await myDB.upsert({
        table: params['dbtable'],
        where: params['cond'],
        // pkeys: Object.keys(params['cond']) as [],
        data: params['upsert_payload'],
        log: {
          formid: params['formId'],
          ip: params?.ip,
          authUser: params?.authUser,
        },
      })
    } catch (e) {
      handleServerError(reply, e)
    }
  }

  if (customModel['afterUpdate']) {
    params['res'] = res
    res = await customModel['afterUpdate'](params, reply)
  }

  if (has(res, 'data')) {
    return res
  }

  return {
    data: res,
    message: 'Successfully saved!',
  }
}

export const list = async (params, reply, customModel) => {
  let rows = [] as any
  if (customModel['list']) {
    rows = await customModel['list'](params, reply)
  } else {
    try {
      let lastpart = ''
      if (!myValue.isEmpty(params?.fd?.orderby))
        lastpart = `order by ${params?.fd?.orderby}`
      rows = await myDB.tableQry({
        table: params['dbtable'],
        where: params['cond'],
        fieldsattr: params?.fieldsattr,
        lastpart,
        dbSerialize: true,
      })
      if (customModel['afterList']) {
        rows = await customModel['afterList'](params, reply, rows)
      }
    } catch (e) {
      handleServerError(reply, e)
    }
  }
  if (has(rows, 'data')) {
    rows = rows?.data
  }
  rows = await formDisplayData(params, rows)
  return { data: rows }
}

export const del = async (params, reply, customModel) => {
  if (customModel['beforeDelete']) {
    params = customModel['beforeDelete'](params, reply)
  }
  let res = {} as any
  if (customModel['del']) res = await customModel['del'](params, reply)
  else {
    exitInvalidPkeys(params, reply)
    try {
      res = await myDB.delete({
        table: params['dbtable'],
        where: params['cond'],
        fieldsattr: params?.fieldsattr,
      })
    } catch (e) {
      handleServerError(reply, e)
    }
  }

  if (has(res, 'data')) {
    return res
  }

  return {
    data: res,
    message: 'Successfully deleted!',
  }
}

export const schema = async (params, reply, customModel) => {
  if (customModel['beforeSchema']) {
    const rc = await customModel['beforeSchema'](params, reply)
    if (rc) params = rc
    // params = await customModel['beforeSchema'](params, reply)
  }
  try {
    const formSections = await myDB.sqlQry({
      sql: `select * from my_forms_sections where formid='${params?.formId}' order by sortno`,
      cache: 1,
      cacheKey: `my_forms_sections:${params?.formId}`,
    })
    const formColumns = await getColumns(params?.formId)
    let columns = await columnSelectOptions(
      formColumns,
      customModel,
      params,
      reply,
    )
    let emptyCols = []
    params['fschema'] = {
      ...params?.fd,
      sections: formSections?.map((section) => {
        if (section.title === null) {
          return {
            ...section,
            sectionid: trim(section?.sectionid),
            title: 'Others',
            columns: columns.filter((col) => {
              if (col.sectionid === 'NA') {
                return col
              }
            }),
          }
        }
        return {
          ...section,
          sectionid: trim(section?.sectionid),
          columns: columns.filter((col) => {
            if (col.sectionid === section.sectionid) {
              return col
            } else {
              emptyCols.push(col)
            }
          }),
        }
      }),
    }
    if (formSections?.length === 0) {
      params['fschema'].sections = [
        {
          columns: columns,
        },
      ]
    }
    if (customModel['afterSchema']) {
      params = await customModel['afterSchema'](params, reply)
    }
    if (!has(params, 'fschema')) throw Error('Schema is not found')
    const removeFields = ['orderby', 'dbtable']
    removeFields.forEach((attr) => {
      if (has(params.fschema, attr)) {
        delete params.fschema[attr]
      }
    })

    if (!Array.isArray(params.fschema)) params.fschema = [params.fschema]
    return {
      data: params.fschema,
      message: '',
    }
  } catch (err) {
    handleServerError(reply, err)
  }
}
