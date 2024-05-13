import { myDB } from '../../utils/db/dbHelper'
import { myValue, utils } from '../../utils/coreUtils'
import { has } from 'lodash'
import { myjsonStringify } from '../../helpers/server/serverResponse'
const ipInt = require('ip-to-int')

export const formlogs = async (params) => {
  try {
    let dd={}
    if (params?.action==='u') {
        const fieldsattr=has(params,'fieldsattr') ? params['fieldsattr']:{}
        dd=utils.jsonOneLevelDiff({
            old_obj:params?.old_data,
            new_obj:params?.new_data,
            fieldsattr
        })
        if (Object.keys(dd).length===0) return
    }
    const uid=params?.authUser?.registrationid?params?.authUser?.registrationid:params?.authUser?.uid

    const data = {
      formid: params?.formid,
      formpkeyid: params?.formpkeyid,
      action: params?.action,
      uid,
      data: JSON.stringify(dd),
      ip: ipInt(params?.ip).toInt(),
    }

    await myDB.insert({
      table: 'logs.form_history',
      data,
    })
    
  } catch (e) {
    return e
  }
  return true
}


