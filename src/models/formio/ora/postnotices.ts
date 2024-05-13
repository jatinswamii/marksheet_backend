import { myDB, sqlCond, whereCond } from '../../../utils/db/dbHelper'
import { handleServerError } from '../../../helpers/server/serverErrors'
import moment from 'moment'
import { myValue, utils } from '../../../utils/coreUtils'
import { exitInvalidPkeys } from '../../../helpers/formio/formio.common'
import { redisDel } from '../../../utils//redisClient'
import { forEach } from 'lodash'

export const get = async (params, reply) => {
  exitInvalidPkeys(params, reply)
  try {
    const cond = whereCond({ params: params['cond'] })
    let readonly = ''
    if (params?.formId !== 'post_notices_approval') {
      readonly = ',COALESCE(n.approval,0) as readonly'
    }
    const sql = `select n.* ${readonly} from main.posts_notices n where ${cond}`
    const rows = await myDB.sqlQry({ sql })
    return { data: rows }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const list = async (params, reply) => {
  try {
    const {
      data: { year },
    } = params
    let cond = ''
    cond += sqlCond({
      field: 'notice_type',
      params: params?.data,
      required: true,
    })
    cond += year ? ` and  EXTRACT(YEAR FROM notice_date) = '${year}'` : ''
    let readonly = ''
    if (params?.formId !== 'post_notices_approval') {
      readonly = ',COALESCE(n.approval,0) as readonly'
    }
    const sql = `select n.* ${readonly} from main.posts_notices n where active='1' ${cond} order by notice_id desc`
    const res = await myDB.sqlQry({ sql })
    return { data: res, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const beforeUpdate = async (params, reply) => {
  let {
    data: { year, notice_id },
  } = params
  // let year = params.data?.year
  if (myValue.isEmpty(year)) {
    const issue_date = utils.getValidDate(params.data?.issue_date)
    if (myValue.isEmpty(issue_date)) throw new Error('Issue date is not found')
    params.data.year = moment(issue_date).format('YYYY')
  }
  if (!myValue.isEmpty(year) && !myValue.isEmpty(notice_id)) {
    const sql = `select post_id from main.posts where notice_id=${notice_id}`
    const rows = await myDB.sqlQry({ sql })
    await redisDel(`postnotice_*:${notice_id}`)
    for (const row of rows) {
      await redisDel(`post_*:${row['post_id']}`)
    }
  }
  return params
}

export const del = async (params, reply) => {
  exitInvalidPkeys(params, reply)
  try {
    await myDB.update({
      table: params?.fd?.dbtable,
      where: { notice_id: params?.initData?.notice_id},
      data: { active: 0 }
    })

    return { data: [], message: `Post has been deleted` }

  } catch (e) {
    handleServerError(reply, e)
  }
}
