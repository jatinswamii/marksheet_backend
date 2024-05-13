import { has, isEmpty } from 'lodash'
import { myDB } from '../../../utils/db/dbHelper'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { myValue } from '../../../utils/coreUtils'
import { get_subjects } from '../common/other_masters'
import { exitInvalidPkeys } from '../../../helpers/formio/formio.common'
import {post} from '../../../helpers/my/postQry'

const getModuledata_cond=(cond) =>{
  const {post_id,module_id,module_type}=cond
  return {post_id,module_id,module_type}
}

const getModuleData = async (params, reply) => {
  try {
    let res = await myDB.tableQry({
      table: 'main.post_modules_data',
      where: getModuledata_cond(params['cond']),
    })
    if (res.length === 0) throw 'Post Module is not found'

    const module_data = res?.[0]?.module_data

    return myValue.isEmpty(module_data) ? {} : module_data

  } catch (e) {
    handleServerError(reply, e)
  }
}

const module_formdata = (data, formId) => {
  if (myValue.isEmpty(data)) return {}
  if (has(data,formId)) {
    return myValue.isEmpty(data?.[formId]) ? {} : data?.[formId]
  }
  return {}
}

export const upsert = async (params, reply) => {
  const formId = params?.fd?.formid
  const data = params?.data

  try {
    let module_data = await getModuleData(params, reply)
    let md = module_formdata(module_data, formId)
    delete data?.post_id
    delete data?.module_id
    delete data?.module_type
    delete data?.registrationid
    switch (formId) {
      case 'pm_exp_questions':
        const { qid, foe, koe } = data
        if (has(md, qid)) {
          if (has(md[qid], foe)) {
            md = Object.assign(md, {
              [qid]: { [foe]: koe },
            })
          } else {
            md[qid] = Object.assign(md[qid], {
              [foe]: koe,
            })
          }
        } else {
          md = Object.assign(md, {
            [qid]: { [foe]: koe },
          })
        }
        break
      case 'pm_exp_master':
        md = Object.assign(md, {
          ['experience_category']: data?.experience_category,
          ['employment_type']: data?.employment_type,
        })
        break
      case 'pm_qualifications':
        md = Object.assign(md, {
          [data?.qual_code]: data?.subjects,
        })
        break
      default:
        md = data
        break
    }
    const _module_data = Object.assign(module_data, { [formId]: md })
     const res = await myDB.update({
      table: 'main.post_modules_data',
      data: { module_data: JSON.stringify(_module_data) },
      where: getModuledata_cond(params['cond']),
      log:{
        formid:params['formId'],
        ip:params?.ip,
        authUser:params?.authUser,
        old_data:module_data
      }
    })
    return { data: res, message: 'Successfully saved' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const list = async (params, reply) => {
  const formId = params?.fd?.formid



  try {
    let module_data = await getModuleData(params, reply)
    let md = module_formdata(module_data, formId)
    let rows = []
    switch (formId) {
      case 'pm_exp_questions':
        for (const [qid, foes] of Object.entries(md)) {
          for (const [foe, koe] of Object.entries(foes)) {
            rows.push({
              qid: qid,
              foe: foe,
              koe: koe,
            })
          }
        }
        break
      case 'pm_qualifications':
        for (const [key, values] of Object.entries(md)) {
          rows = rows.concat([{ qual_code: key, subjects: values }])
        }
        break
    }

    if(!isEmpty(rows)){
      rows=await post.addReadOnly({params:params?.data,rows,reply})
    }

    
    return rows
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const del = async (params, reply) => {
  const formId = params?.fd?.formid
  try {
    let module_data = await getModuleData(params, reply)
    let md = module_formdata(module_data, formId)

    const data = params?.data
    switch (formId) {
      case 'pm_exp_questions':
        const { qid, foe, koe } = data
        if (has(md, qid)) {
          if (has(md[qid], foe)) {
            delete md[qid][foe]
            if (Object.keys(md[qid]).length === 0) delete md[qid]
          }
        }
        break
      case 'pm_qualifications':
        const { qual_code } = data

        if (has(md, qual_code)) {
   
          delete md[qual_code]
        }
        break
      default:
        md = {}
        break
    }

    if (Object.keys(md).length === 0) {
      delete module_data?.[formId]
    } else {
      module_data = Object.assign(module_data, { [formId]: md })
    }
    const res = await myDB.update({
      table: 'main.post_modules_data',
      data: { module_data: JSON.stringify(module_data) },
      where: getModuledata_cond(params['cond']),
    })
    return { data: [{ data: '1', message: 'Success'}], message: 'Successfully' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const get = async (params, reply) => {
  const formId = params?.fd?.formid
  exitInvalidPkeys(params,reply)
  try {
    let module_data = await getModuleData(params, reply)
    let md = module_formdata(module_data, formId)
    let rows = []

    switch (formId) {
      case 'pm_exp_questions':
        const { qid, foe } = params?.data
        if (has(md,qid)) {
          if (has(md[qid],foe)) {
            rows.push({
              qid,
              foe,
              koe: md[qid][foe],
            })
          }
        }
        break
      case 'pm_qualifications':
        const { qual_code } = params?.data
        if (has(md, qual_code)) {
          rows.push({
            qual_code,
            subjects: md[qual_code],
          })
        }
        break
      default:
        rows.push(md)
        break
    }
    rows=await post.addReadOnly({params:params?.data,rows,reply})
    return rows
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_subjects = async (params, reply) => {
  try {
    const rows = await get_subjects(params, reply)
    return {
      data: rows,
      message: 'ok',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const getIFCFilter = async (params, reply) => {
  const { post_id } = params

  try {
    const sql = `select pd.module_id, pd.module_type,name,post_forms as forms,icon, 'true' as status from main.post_modules_data pd, main.post_module_master pm where pd.module_id=pm.module_id and pd.post_id=${post_id} and  post_tab=1 order by sortno`
    let rows = await myDB.sqlQry({ sql })
    return {
      data: rows,
      message: 'ok',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}
