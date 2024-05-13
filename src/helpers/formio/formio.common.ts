import { handleServerError } from '../server/serverErrors'
import { trim, includes, has, toString } from 'lodash'
import { myValue, utils } from '../../utils/coreUtils'
import { inc } from 'ramda'

const path = require('path')

export const myKeyCond = (params, reply) => {
  if (includes(['schema'], params?.action)) {
    return params
  }
  let {
    data,
    fd: { pkeys, pkeyid },
  } = params
  if (params['authUser']?.registrationid) {
    data['registrationid'] = params['authUser']?.registrationid
  }
  params['cond'] = {}
  params['ekeys'] = []
  //IF record has ID (pkeyid) than only this condition required
  if (!myValue.isEmpty(pkeyid)) {
    if (!myValue.isEmpty(data[pkeyid])) {
      params['cond'][pkeyid] = data[pkeyid]
      if (!params?.['data']?.[pkeyid]) params['data'][pkeyid] = data[pkeyid]
    } else params['ekeys'].push(pkeyid)
  }

  params['pkeyvalidation'] =
    Object.keys(params['cond']).length > 0 ? true : false

  let ekeys = []
  params["pkeys"]={}
  if (!myValue.isEmpty(pkeys)) {
    pkeys.split(',').map((pkey) => {
      if (myValue.isEmpty(data[pkey])) {
        ekeys.push(pkey)
        return
      }
      if (!params['pkeyvalidation']) params['cond'][pkey] = data[pkey]
      if (!params?.['data']?.[pkey]) params['data'][pkey] = data[pkey]
      params["pkeys"][pkey]=data[pkey]
    })
  }
  if (params['pkeyvalidation'] || ekeys.length === 0)
    params['pkeyvalidation'] = true
  params['ekeys'] = params['ekeys'].concat(ekeys)
  if (Object.keys(params["pkeys"]).length===0) params["pkeys"]=params['cond']
  return params
}

export const exitInvalidPkeys = (params, reply) => {
  if (!params['pkeyvalidation'] || Object.keys(params['cond']).length === 0) {
    handleServerError(
      reply,
      `Key data is not found (${params['ekeys'].join(',')})`,
    )
  }
}

export const getColumnfromSchema = (fschema, field) => {
  for(let section of fschema?.sections) {
    for(let column of section?.columns) {
      if (column?.field===field) return column
    }
  }
  return {}
}

export const removeColumnsfromSchema = (fschema, cols) => {
  fschema?.sections.forEach((section, i) => {
    if (has(section, 'columns')) {
      section.columns = section.columns.filter((column) => {
        if (!includes(cols, column.field)) return column
      })
      fschema.sections[i] = section
    }
  })
  return fschema
}

export const mergeColumnsValuesInSchema = (fschema, mergecolumns) => {
  const cols = Object.keys(mergecolumns)
  fschema?.sections.forEach((section, i) => {
    if (has(section, 'columns')) {
      section.columns = section.columns.filter((column) => {
        if (includes(cols, column.field))
          column = Object.assign(column, mergecolumns[column.field])
        return column
      })
      fschema.sections[i] = section
    }
  })
  return fschema
}

export const getFormCustomModel = (fd) => {
  let customModel = {} as any
  try {
    if (myValue.isEmpty(trim(fd?.formid))) return {}
    customModel = myValue.isEmpty(trim(fd?.model))
      ? `${fd.formid}_model`
      : fd.model

    const module = myValue.isEmpty(fd?.module) ? 'common' : fd?.module

    let modelPath = path.join(
      '../../models/formio',
      toString(module),
      toString(customModel),
    )

    customModel = require(modelPath)
  } catch (e) {
    //if (process.env.NODE_ENV==='development') console.log(e)
    customModel = {}
  }
  return customModel
}


