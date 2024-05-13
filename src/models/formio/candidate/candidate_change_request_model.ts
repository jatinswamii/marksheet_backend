import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'
import { has,includes, map, filter, isEqual, isEmpty, toString } from 'lodash'
import { myform } from '../../../controllers/formio.controller'
import { myValue, utils } from '../../../utils/coreUtils'
import { myjsonStringify } from '../../../helpers/server/serverResponse'
import { getFieldAttributes } from '../../../utils/db/dbSerialzation'

export const afterSchema = async (params, reply) => {
  try {
    const _params = {
      formId: params?.initData?.formid,
      action: 'schema',
      initData: {},
    }
    let fschema = await myform(_params, {}, false, {}) as any
    if (!has(fschema, 'data')) throw `${params?.initData?.formid} schema is not found!`
    let sections = fschema.data[0]?.sections
    const hidecols = [
      'securityquestionid1',
      'securityanswer1',
      'securityquestionid2',
      'securityanswer2',
      'password',
      'captcha',
    ]
    const showcols = ['registrationid']
    let _sections=[] as any
    for (let [k1, section] of Object.entries(sections) as any) {
      if (section?.sectionid !== 'security') {
        for (let [k2, column] of Object.entries(section?.['columns'])) {
          if (includes(['email', 'mobile'], column['field'])) {
            column['readonly'] = 1
            column['component'] = 'input'
            sections[k1]['columns'][k2] = column
          }
          if (includes(hidecols, column['field'])) {
            column['formview'] = 0
            column['active'] = 0
          } else if (includes(showcols, column['field'])) {
            column['formview'] = 1
            column['active'] = 1
            column['readonly'] = 1
          }
        }
        _sections.push(section)
      }
    }

    // const initFormData = await myform(
    //   { action: 'schema', formId: params?.initData?.formid },
    //   reply,
    // ) as any
    
    // const columns = filter(
    //   fschema?.data?.[0]?.sections
    //     .map((item) =>
    //       item.columns.map((col) => {
    //         return {
    //           ...col,
    //           component: includes(['verify-input'], col?.component)
    //             ? 'input'
    //             : col?.component,
    //           readonly: includes(['verify-input'], col?.component)
    //             ? 1
    //             : col?.readonly,
    //           listview: 0,
    //         }
    //       }),
    //     )
    //     .flat(Infinity),
    //   ({ field }) =>
    //     !includes(
    //       [
    //         'captcha',
    //         'password',
    //         'securityanswer2',
    //         'securityquestionid2',
    //         'securityquestionid1',
    //         'securityanswer1',
    //       ],
    //       field,
    //     ),
    // )

    return {
      ...params,
      fschema: {
        ...params?.fschema,
        sections:_sections,
      },
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const get = async (params, reply) => {
  try {
    const sql = `select * from my_forms where formid='${params?.initData?.formid}';`
    const fd = await myDB.sqlQry({ sql })

    const res = await myDB.tableQry({
      table: fd?.[0]?.dbtable,
      where: { registrationid: params?.data?.registrationid },
    })

    return { data: res, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const upsert = async (params, reply) => {
  let reqChangedData = {} as any

  const fileInputCOls = map(
    params.cols.filter((col) => isEqual(col?.component, 'fileinput')),
    (col) => col?.field,
  )
  const DatePickerCols = map(
    params.cols.filter((col) => isEqual(col?.component, 'datepicker')),
    (col) => col?.field,
  )

  for (const [key, value] of Object.entries(params)) {
    const file = params?.[key]

    if (includes(fileInputCOls, key) && file) {
      params.data[key] = params?.upsert_payload[key]
    }
  }

  for (const [key, value] of Object.entries(params?.data)) {
    if (!includes(['candidate_remark', 'formid', 'registrationid'], key)) {
      reqChangedData = Object.assign(reqChangedData, { [key]: value })
    }
  }
  const candidateData = await get(params, reply)
  delete reqChangedData.changed_data
  
  //const changedData = ObjectsDiff(candidateData?.data?.[0], reqChangedData)

  let fieldsattr=has(params,'fieldsattr')?params['fieldsattr']:getFieldAttributes('cms.candidate_master')

  const changedData = utils.jsonOneLevelDiff({old_obj:candidateData?.data?.[0], new_obj:reqChangedData,fieldsattr})

  const previousReq = await list(params, reply)

  const isOpenRequest = previousReq?.data?.filter((item) => item.status === 'O')

  if (!isEmpty(isOpenRequest)) {
    return { data: previousReq?.data, message: 'You have open req' }
  }
  const data = await myDB.upsert({
    table: params?.fd?.dbtable,
    where: params?.initData,
    data: {
      registrationid: params?.authUser?.registrationid,
      formid: params?.initData?.formid,
      changed_data: JSON.stringify(changedData),
      status: 'O',
      candidate_remark: params?.data?.candidate_remark,
      sdocument: params?.data?.sdocument,
    },
    fieldsattr:getFieldAttributes(params?.fd?.dbtable)
  })

  try {
    return { data, message: 'Change Request has been created' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const list = async (params, reply) => {
  try {
    const sql = `select * from cms.candidate_change_request where registrationid='${params?.authUser?.registrationid}';`
    let res = await myDB.sqlQry({ sql })

    res = map(res, (item) => {
      return { ...item, isreadonly: !includes(['O'], item?.status) }
    })

    return { data: res, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}
