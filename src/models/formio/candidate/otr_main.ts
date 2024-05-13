import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'
import { includes, has } from 'lodash'
import { myform } from '../../../controllers/formio.controller'
import { applicationStatus } from '../../../config/appConstants'

export const afterSchema = async (params, reply) => {
  try {
    const _params = {
      formId: 'otr_form',
      action: 'schema',
      initData: {},
    }
    let fschema = await myform(_params, {}, false, {}) as any
    if (!has(fschema, 'data')) throw 'otr_main schema is not found!'
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
    params.fschema.sections = _sections
    return params
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const locked = async (params, reply) => {
  try {
    const {
      request: {
        authUser: { registrationid },
      },
    } = params
    let locked = false
    const sql = `select app_status from cms.applications where app_status >=${applicationStatus.finalSubmit} and registrationid=${registrationid}`
    const rows = await myDB.sqlQry({ sql })
    if (rows.length > 0) {
      locked = true
    }
    return {
      data: { locked },
      message: 'ok',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}
