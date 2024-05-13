import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'

export const select_community_state_code = async (params, reply) => {
  try {
    const { community_code } = params
    const sql = `select  m.keyid as value,m.keytext as label,'select_caste' as data from master_castes c,my_master('state') m where c.state_name=m.keyid and caste_category='${community_code}' group by m.keyid,m.keytext order by m.keytext`
    const rows = await myDB.sqlQry({ 
      sql,
      cache:1,
      cacheKey:`master_castes:${community_code}`
    })
    return {
      data: rows,
      message: 'ok',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_caste_code = async (params, reply) => {
  try {
    const { community_code, community_state_code } = params
    const sql = `select  caste_code as value,caste_name as label from master_castes  where caste_category='${community_code}' and state_name='${community_state_code}' group by caste_code,caste_name order by caste_name `
    let rows = await myDB.sqlQry({ 
      sql,
      cache:1,
      cacheKey:`master_castes:${community_code}:${community_state_code}`
     })
    rows.push({ value: '9999', label: 'Other' })
    return {
      data: rows,
      message: 'ok',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}
