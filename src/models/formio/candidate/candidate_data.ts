import { myDB, sqlCond } from '../../../utils/db/dbHelper'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { myValue, utils } from '../../../utils/coreUtils'
import { toString, has, uniq, includes } from 'lodash'
import { exitInvalidPkeys } from '../../../helpers/formio/formio.common'
import { cms } from '../../../helpers/my/candidateQry'
import { masters } from '../../../helpers/my/mastersQry'
import { post } from '../../../helpers/my/postQry'
import { redisDel } from '../../../utils/redisClient'
const path = require('path')

export const custom_form_data = (data_rows) => {
  let rows = []
  data_rows.forEach(function (row, i) {
    rows.push(JSON.parse(row['form_data']))
  })
  return rows
}

export const list = async (params, reply) => {
  const {
    formId,
    data: { registrationid,post_id },
  } = params
  if (myValue.isEmpty(registrationid)) {
    handleServerError(reply, new Error('Registrationid is not found!'))
  }
  if (!myValue.isEmpty(post_id)) {
    if (['candidate_qualification'].includes(formId)) {
      let pd={}
      pd['postinfo'] = await post.info({post_id})
      if (pd['postinfo']?.post_type==='o')
        pd['pmd'] = await post.modulesIDwise(pd['postinfo'])
      return await cms.candidate_qualification({ registrationid,post_id},pd)
    }
  }
  
  try {
    const res = await myDB.tableQry({
      table: params['dbtable'],
      where: { registrationid: registrationid },
      fieldsattr: params?.fieldsattr,
      dbSerialize: true,
    })
    if (params['dbtable'] === 'candidate_custom_forms') {
      return custom_form_data(res)
    }
    return res
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const get = async (params, reply) => {
  exitInvalidPkeys(params, reply)
  // let {
  //   data: { post_id,registrationid,cdid },
  // } = params
  try {
    return await cms.postLinkData({
      dbtable: params['dbtable'],
      params: { ...params?.data, cond: params?.cond },
    })
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const upsert = async (params, reply) => {
  exitInvalidPkeys(params, reply)
  let {
    upsert_payload,
    data: { post_id, cdid, registrationid },
  } = params
  try {
    let _cdid = cdid
    let _linkposts = []
    let action = '-'
    const rc = await getCandidateData(params, reply)
    let row={}
    switch (rc.status) {
      case 'nodata':
        action = 'i'
        break
      case 'linked':
      case 'notlinked':
        row = rc.rows[0]
        _cdid = row['cdid']
        _linkposts = row['linkposts']
        const matched = utils.Json1matched({
          json1: upsert_payload,
          json2: row,
        })
        if (!matched) {
          if (rc.status === 'linked') {
            action = 'i'
            await unlinkposts(params, row, reply)
          } else action = 'u'
        } else {
          if (!myValue.isEmpty(post_id)) {
            if (!includes(row['linkposts'], post_id)) {
              action = 'u'
              upsert_payload = {}
            }
          }
        }
        break
    }
    let cacheKey = ''
    // if (!myValue.isEmpty(post_id)) {
    //   cacheKey=`${params['dbtable']}:post_id:${post_id},registrationid:${upsert_payload['registrationid']}`
    // }
    switch (action) {
      case 'i':
        if (!myValue.isEmpty(post_id)) {
          upsert_payload['linkposts'] = [post_id]
        }
        await redisDel(cacheKey)
        return await myDB.insert({
          table: params['dbtable'],
          data: upsert_payload,
          fieldsattr: params?.fieldsattr,
          dbSerialize: true,
        })
      case 'u':
        if (!myValue.isEmpty(post_id)) {
          _linkposts.push(post_id)
          upsert_payload['linkposts'] = uniq(_linkposts)
        }
        if (myValue.isEmpty(_cdid)) {
          throw new Error('keyid is not found! [cdid]')
        }

        await redisDel(cacheKey)

        const res= await myDB.update({
          table: params['dbtable'],
          data: upsert_payload,
          where: { cdid: _cdid, registrationid: registrationid },
          fieldsattr: params?.fieldsattr,
          dbSerialize: true,
          log: {
            formid:params['formId'],
            ip:params?.ip,
            authUser:params?.authUser,
            old_data:row
          }
        })
        return res
    }
    return {
      data: {},
      message: "Same value record can't be updated",
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const del = async (params, reply) => {
  exitInvalidPkeys(params, reply)
  const {
    data: { post_id, cdid, registrationid },
  } = params
  let message = ''
  try {
    if (cdid || registrationid) {
      const rc = await getCandidateData(params, reply)
      switch (rc.status) {
        case 'nodata':
          message = 'Record is not found!'
          break
        case 'linked':
        case 'notlinked':
          const row = rc.rows[0]
          const _cdid = row['cdid']
          if (rc.status === 'notlinked') {
            return await myDB.delete({
              table: params['dbtable'],
              where: { cdid: _cdid, registrationid: registrationid },
              fieldsattr: params?.fieldsattr,
              dbSerialize: true,
            })
          } else {
            const rc = await unlinkposts(params, row, reply)
            if (rc) return rc
            message =
              "Record can't be deleted,already linked to other application"
          }
          break
      }
    } else message = 'Record is not found!'
    return {
      data: {},
      message: message,
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

const unlinkposts = async (params, row, reply) => {
  try {
    const {
      data: { registrationid, post_id },
    } = params
    if (myValue.isEmpty(post_id)) return false
    if (!includes(row['linkposts'], post_id)) return false
    row['linkposts'] = row['linkposts'].filter(
      (value) => BigInt(value) !== BigInt(post_id),
    )
    const _cdid = row['cdid']
    return await myDB.update({
      table: params['dbtable'],
      data: { linkposts: row['linkposts'] },
      where: { cdid: _cdid, registrationid: registrationid },
      fieldsattr: params?.fieldsattr,
      dbSerialize: true,
    })
  } catch (e) {
    handleServerError(reply, e)
  }
  return false
}

export const application_linkposts = async (params, vd) => {
  try {
    const { post_id } = params
    const { forms, pd } = vd
    const setLinkPosts = `set linkposts=array_to_json(ARRAY(select distinct JSONB_ARRAY_ELEMENTS_TEXT(COALESCE(linkposts,'[]'::jsonb) || '[${post_id}]'::jsonb)::int))::jsonb`
    let sql
    const my_forms=await masters.my_forms()
    for (let module_id in pd['pmd']) {
      const module = pd['pmd'][module_id]
      let formid = module['candidate_formid']
      if (myValue.isEmpty(formid)) continue
        // throw `Module ID ${module_id}, candidate_formid is not empty 12`
      if (formid.includes('candidate_')) {
        if (!has(my_forms,formid)) continue
        const dbtable=my_forms[formid]?.dbtable
        const fdata = forms?.[formid]
        if (!myValue.isEmpty(fdata)) {
          if (Array.isArray(fdata)) {
            for (const [i, d] of Object.entries(fdata)) {
              if (!myValue.isEmpty(d?.cdid)) {
                sql=`update ${dbtable} ${setLinkPosts} where cdid=${d?.cdid}`
                await myDB.sqlQry({sql})
              }
            }
          } else {
            if (!myValue.isEmpty(fdata?.cdid)) {
              sql=`update ${dbtable} ${setLinkPosts} where cdid=${fdata?.cdid}`
              await myDB.sqlQry({sql})
            }
          }
        }
      }
    }
  } catch (e) {
    throw e
  }
}

export const getCandidateData = async (params, reply) => {
  try {
    const {
      data: { post_id },
    } = params
    const rows = await get(params, reply)
    if (rows.length === 0) return { rows: rows, status: 'nodata' }
    else {
      const row = rows[0]
      let linkposts = (rows[0].linkposts = row.linkposts || [])
      if (Array.isArray(linkposts)) {
        if (post_id)
          linkposts = linkposts.filter(
            (value) => BigInt(value) !== BigInt(post_id),
          )
        if (linkposts.length > 0) {
          return { rows: rows, status: 'linked' }
        }
      }
      return { rows: rows, status: 'notlinked' }
    }
  } catch (e) {
    throw e
  }
}

const ismultiEntryForms = (formid) => {
  return ['candidate_experience', 'candidate_qualification'].includes(formid)
}

export const afterSchema = async (params, reply) => {
  try {
    return await formModel('afterSchema', params, reply)
  } catch (e) {
    return params
  }
}
export const beforeSchema = async (params, reply) => {
  try {
    return await formModel('beforeSchema', params, reply)
  } catch (e) {

    return params
  }
}

export const formModel = async (method, params, reply) => {
  let { formId, fd } = params
  let modelPath = path.join(
    '../../../models/formio',
    toString(fd?.module),
    toString(formId),
  )
  let customModel = {}
  try {
    customModel = require(modelPath)
    
  } catch (e) {
    customModel = {}
  }
  if (has(customModel, method)) {
    return await customModel[method](params, reply)
  }
  return params
}

