import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'
import { myValue } from '../../../utils/coreUtils'


export const select_district_code = async (params, reply) => {
  try {
    let { state_code } = params
    if (myValue.isEmpty(state_code)) throw Error('State code is not found!')
    const sql = `select districtid as value,districtname as label from master_districts where state_code='${state_code}' order by districtname`
    return await myDB.sqlQry({ sql })
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_mail_district_code = async (params, reply) => {
  let { mail_state_code } = params
  params['state_code'] = mail_state_code
  return await select_district_code(params, reply)
}

export const select_pa_district = async (params, reply) => {
  let { pa_state } = params
  params['state_code'] = pa_state
  return await select_district_code(params, reply)
}

export const select_ma_district = async (params, reply) => {
  let { ma_state } = params
  params['state_code'] = ma_state
  return await select_district_code(params, reply)
}

export const get_subjects = async (params, reply) => {
  try {
    const { qual_code } = params
    const sql = `select  m.keyid as value,m.keytext as label from my_master('subject') m where m.parent_keyid='${qual_code}' order by m.sortno,m.keytext`
    let rows= await myDB.sqlQry({ 
      sql,
      cache:1,
      cacheKey:`my_master:subject:${qual_code}`
    })
    rows.push({"value":"9999","label":"Other"})
    return rows
  } catch (e) {
    handleServerError(reply, e)
  }
}
export const select_phcategory = async (params, reply) => {
  try {
    const { phtype } = params
    let _cond=`m.parent_keyid='${phtype}'`
    if (phtype==='6') _cond=`m.parent_keyid in ('1','2','3','5')`
    const sql = `select  m.keyid as value,m.keytext as label from my_master('ph_category') m where ${_cond} order by m.sortno,m.keytext`
    return await myDB.sqlQry({ 
      sql,
      cache:1,
      cacheKey:`my_master:phcategory:${phtype}`
    })
  } catch (e) {
    handleServerError(reply, e)
  }
}
export const select_assistive_device = async (params, reply) => {
  try {
    const { ph_percent_type } = params
    let _cond=``
    if (ph_percent_type==='0') _cond=` where m.type ='1'`
    const sql = `select  m.keyid as value,m.keytext as label from my_master('assistive_device') m  ${_cond} order by m.sortno,m.keytext`
    return await myDB.sqlQry({ 
      sql,
      cache:1,
      cacheKey:`my_master:assistive_device:${ph_percent_type}`
    })
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_venue_id = async (params, reply) => {
  try {
    const { center_id } = params
    const sql = `select  m.venue_id as value,m.venu_name as label from vms.master_venue m  where center_id='${center_id}' order by m.venu_name`
    return await myDB.sqlQry({ 
      sql,
      cache:1,
      cacheKey:`master_venue:${center_id}`
    })
  } catch (e) {
    handleServerError(reply, e)
  }
}


