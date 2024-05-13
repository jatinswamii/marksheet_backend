
import moment from 'moment'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { exitInvalidPkeys } from '../../../helpers/formio/formio.common'
import { myDB, sqlCond } from '../../../utils/db/dbHelper'
import { myValue, utils, isValidDate } from '../../../utils/coreUtils'


export const get = async (params, reply) => {
  try {
    let {
      data: { pass_type, mobile, gatepass_id },
    } = params
    let where=""
    let gp_pass='select * from office.gp_pass'
    if (!myValue.isEmpty(gatepass_id)) {
      where +=` p.gatepass_id=${gatepass_id}`
    }
    else {
      const today=moment().format('YYYY-MM-DD')
      where +=` pass_type='${pass_type}'  and '${today}' between pass_valid_from AND pass_valid_to`
    }
    gp_pass=`select * from office.gp_pass where ${where}`
    const sql = `select p.*,v.* from office.gp_visiters v left join (${gp_pass}) p on (v.mobile=p.mobile) where v.mobile='${mobile}'`
    const rows = await myDB.sqlQry({ sql })
    return { data: rows, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const upsert = async (params, reply) => {
  try {
    exitInvalidPkeys(params, reply)
    let { cond, upsert_payload: data } = params
    let _visiters = [
      'name',
      'gender',
      'photo_id_no',
      'photo_id_type',
      'address',
    ] as any
    const mobile = data['mobile']
    let visiters = Object.keys(data)
      .filter((key) => _visiters.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key]
        return obj
      }, {})
    visiters['mobile'] = mobile
    let gatepass = Object.keys(data)
      .filter((key) => _visiters.includes(key) === false)
      .reduce((obj, key) => {
        obj[key] = data[key]
        return obj
      }, {})
    let res
    res = await myDB.upsert({
      table: 'office.gp_visiters',
      where: { mobile },
      data: visiters,
    })
    if (!myValue.isEmpty(cond['gatepass_id'])) {
      res = await myDB.update({
        table: 'office.gp_pass',
        where: cond,
        data: gatepass,
      })
    } else {
      const {pass_type}=data
      if (pass_type==='m') {
        const vendor_work_id=data?.vendor_work_id
        
        const sql = `select to_char(pass_date, 'YYYY-MM-DD') as pass_date,pass_days from office."gp_work_authority" where active=1 and vendor_work_id =${vendor_work_id}`
        const rows = await myDB.sqlQry({ sql })
        if (rows.length > 0) {
          gatepass['pass_valid_from']=rows[0]['pass_date']
          const days=utils.parseInt({value:rows[0]['pass_days']})
          gatepass['pass_valid_to']=moment(data['pass_valid_from']).add(days, 'days').format('YYYY-MM-DD')
        }
      }
      else {
        gatepass['pass_valid_from']=moment().format('YYYY-MM-DD')
        gatepass['pass_valid_to']=gatepass['pass_valid_from']
      }
      let pad = moment(utils.moment_CurrentTime({ type: 'date' })).format(
        'YYMM',
      ) as any
      pad = parseInt(`${pad}20000`)
      const sql = `select max(gatepass_id) gatepass_id from office.gp_pass where gatepass_id >${pad}`
      const rows = await myDB.sqlQry({ sql })
      let gatepass_id
      if (rows.length > 0)
        gatepass_id = utils.parseInt({ value: rows[0]['gatepass_id'] })
      if (gatepass_id === 0) gatepass_id = pad
      gatepass_id = gatepass_id + 1
      gatepass['gatepass_id'] = gatepass_id
      res = await myDB.insert({
        table: 'office.gp_pass',
        data: gatepass,
      })
      res = { data: { gatepass_id } }
    }
    return res
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const list = async (params, reply) => {
  try {
    let { pass_type, pass_valid_from } = params
    pass_valid_from = isValidDate(pass_valid_from)
    const sql = `select p.*,v.* from office.gp_visiters v left join office.gp_pass p on (v.mobile=p.mobile) where p.pass_type='${pass_type}' and pass_valid_from='${pass_valid_from}' order by gatepass_id`
    const rows = await myDB.sqlQry({ sql })
    return { data: rows, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_mobile = async (params, reply) => {
  try {
    const { mobile } = params
    let where = ''
    if (!myValue.isEmpty(mobile)) where = ` where mobile ilike '${mobile}%'`
    const sql = `select mobile as value,concat(mobile,', ',name,', ',photo_id_no) as label from office.gp_visiters ${where}  order by mobile limit 10`
    return await myDB.sqlQry({
      sql,
    })
  } catch (e) {
    handleServerError(reply, e)
  }
}