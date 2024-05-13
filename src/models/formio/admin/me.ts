import { handleServerError } from '../../../helpers/server/serverErrors'
import { myStaticMenu } from '../../../techDept/menu'
import { myMenulist, menuTreeOptions } from '../../../helpers/menu'
import { myDB } from '../../../utils/db/dbHelper'
import { locked } from '../candidate/otr_main'
import { includes, isEmpty } from 'lodash'

export const select_mymenus = async (params, reply) => {
  try {
    const res = await menuTreeOptions()
    return {
      data: res,
      message: 'ok',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const mymenus = async (params, reply) => {
  try {
    const { email } = params?.request?.authUser

    const resLocked = await locked(params, reply)

    if (resLocked?.data) {
      const res = myStaticMenu(
        email,
        resLocked?.data?.locked as boolean,
        includes(['e'], params?.request?.authUser?.type?.toString()),
      )

      return {
        data: res,
        isLocked: resLocked,
        message: 'ok',
      }
    }

    return { data: [], message: 'ok' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_rule_id = async (params, reply) => {
  try {
    const { rule_group } = params
    if (rule_group === 'ph') {
      return {
        data: [{ value: 'ph', label: 'Physically Challenged (PH)' }],
        message: 'ok',
      }
    }
    let sql = `select lower(keyid) as value,keytext as label from my_master('${rule_group}') order by sortno`
    const rows = await myDB.sqlQry({ sql })
    return {
      data: rows,
      message: 'ok',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}
