import { myDB,sqlCond } from '../../../utils/db/dbHelper'
import { myValue, utils } from '../../../utils/coreUtils'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { keydata, masters } from '../../../helpers/my/mastersQry'
import { cms } from '../../../helpers/my/candidateQry'
import { post } from '../../../helpers/my/postQry'
import { formFieldMapper } from '../../../helpers/my/formMapper'
import { postModule } from '../../../config/appConstants'
import { has } from 'lodash'

export const appModuleCond=(params,reply)=>{
  try {
    let cond = ''
    cond += sqlCond({ field: 'post_id', params,required:true })
    cond += sqlCond({ field: 'module_id', params,required:true })
    cond += sqlCond({ field: 'module_type', params,required:true })
    return cond
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_qid = async (params, reply) => {
  try {
    let cond = appModuleCond(params,reply)
    const sql = `select qid value,question label from main.post_modules_questions where qid::text in (select(jsonb_object_keys(module_data->'pm_exp_questions')) from main.post_modules_data where module_data?'pm_exp_questions' ${cond});`
    let rows = await myDB.sqlQry({ sql })
    return {
      data: rows,
      message: 'ok',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_foe = async (params, reply) => {
  try {
    const { qid } = params
    let cond = appModuleCond(params,reply)
    const sql = `select keyid as value,keytext as label  from my_master('fieldofexperience') where keyid in (select(jsonb_object_keys(module_data->'pm_exp_questions'->'${qid}')) from main.post_modules_data where module_data->'pm_exp_questions'?'${qid}' ${cond});`
    let rows = await myDB.sqlQry({ sql })
    return {
      data: rows,
      message: 'ok',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}


export const select_koe = async (params, reply) => {
  try {
    const { post_module_id, qid, foe } = params
    let cond = appModuleCond(params,reply)
    const sql = `select module_data->'pm_exp_questions'->'${qid}'->'${foe}' koes from main.post_modules_data where module_data->'pm_exp_questions'->'${qid}'?'${foe}' ${cond};`
    let rows = await myDB.sqlQry({ sql })
    let items = []
    if (rows.length > 0) {
      rows[0]['koes'].forEach((item, i) => {
        items.push({ value: item, label: item })
      })
    }
    return {
      data: items,
      message: 'ok',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_cdid = async (params, reply) => {
  try {
    const { module_id, post_id } = params
    const { registrationid } = params?.request?.authUser
    const modules = await masters.postModules()
    if (!has(modules, module_id)) throw 'Module ID is not found!'
    let { dbtable, formid } = modules[module_id]

    switch(formid) {
      case 'application_experience':
        formid='candidate_experience'
        dbtable='cms.candidate_experiences'
        break
    }

    const rows = await cms.postLinkData({
      dbtable,
      params: { post_id, registrationid },
      allrecords: true,
    })
    let items = []
    rows.forEach(async (row, i) => {
      if (row.postlinked === true) return
      const label = await formFieldMapper({ formid, row })
      items.push({ value: row?.cdid, label: label })
    })
    return {
      data: items,
      message: 'ok',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_center1 = async (params, reply) => {
  try {
    const { post_id,post_type } = params
    const { registrationid } = params?.request?.authUser
    //const ip = await parsePostId(post_id)
    const pmd = await post.modulesIDwise({ registrationid, post_id , post_type})
    let centers = pmd?.[postModule.Center]?.module_data?.pm_centers?.centers
    let cond = ''
    let cacheKey = 'centers'
    if (!myValue.isEmpty(centers)) {
      centers = centers.join("','")
      cacheKey = `${cacheKey}:${post_id}`
      cond = `and center_id in ('${centers}')`
    } 
    let sql = `select center_id as value,cenname as label from master_centers where active=1 ${cond} order by cenname`
    const rows = await myDB.sqlQry({
      sql,
      cache: 30,
      cacheKey,
    })
    return {
      data: rows,
      message: 'ok',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_center2 = async (params, reply) => {
  try {
    const { post_id,post_type } = params
    return await select_center1(params,reply)
  } catch (e) {
    handleServerError(reply, e)
  }
}

