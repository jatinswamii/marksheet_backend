import { myDB } from '../../../utils/db/dbHelper'
import {
  applicationStatus,
  postStatus,
  postModule,
} from '../../../config/appConstants'
import { myValue, utils } from '../../../utils/coreUtils'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { post } from '../../../helpers/my/postQry'
import { application_linkposts } from './candidate_data'
import { application } from '../../../helpers/my/applicationQry'
import {
  has,
  upperFirst,
  values,
  groupBy,
  reduce,
  map,
  filter,
  isEmpty,
  includes,
  uniqBy,
} from 'lodash'
import { formSortColumns } from '../../../helpers/formio/getColumns'
import { masters } from '../../../helpers/my/mastersQry'
import { getPreviewHtml } from '../../../models/public/getForm'
import { send_application_mail } from '../application/application_payment'
import { myuuid } from '../../../utils/myuuid'

export const post_modules = async (params, reply) => {
  try {
    const {
      post_id,
      request: {
        authUser: { registrationid },
      },
    } = params

    const _params = { post_id, registrationid }

    const pd = await post.info({ post_id })

    let vd = await application.validations(_params)

    const o = groupBy(values(vd?.pd?.postrules), 'rule_group')

    const removedModule = reduce(
      o,
      function (result: any, value: any, key: any) {
        const mappedAgeRelax = isEmpty(
          filter(
            map(value, ({ age_relax }) => age_relax),
            (item) => item !== 0,
          ),
        )
        result[key] = mappedAgeRelax
        return result
      },
      {},
    )

    const removedModules = []

    for (const [key, value] of Object.entries(removedModule)) {
      if (value) {
        switch (key) {
          case 'ph':
            removedModules.push('candidate_ph_scribe_detail')
            removedModules.push('candidate_ph')
            break
          case 'community':
            removedModules.push('candidate_community')
            break
          case 'agerelax':
            removedModules.push('candidate_add_agerelax')
          case 'candidate_consent':
            removedModules.push('candidate_consent')
          default:
            removedModules.push('')
        }
      }
    }

    const modules = await post.modules({ post_id, post_type: pd['post_type'] })

    const my_forms = await masters.my_forms()

    const candidate_consent = await myDB.sqlQry({
      sql: `select consent from cms.candidate_consent where registrationid='${registrationid}' and post_id='${post_id}'`,
    })

    for (let i in modules) {
      delete modules[i]['module_data']
      const module_id = modules[i]?.module_id
      if (pd?.post_type === 's') {
        if (module_id === postModule.ExamStreams) {
          const rows = await masters.master_exam_streams(pd?.exam_id)

 
          if (rows.length < 2) {
            delete modules[i]
          }
        }
        if (module_id === postModule.ExamCustomInfo) {
          const exams = await masters.master_exams()
          if (has(exams, pd?.exam_id)) {
            const formid = `exam_custom_${exams[pd?.exam_id]?.exam_code}`
            if (!has(my_forms, formid)) {
              delete modules[i]
              continue
            }
            modules[i]['candidate_formid'] = formid
          }
        }
      }
      if (
        !includes(candidate_consent?.[0]?.consent, 'agerelax') &&
        !isEmpty(candidate_consent?.[0]?.consent)
      ) {
        removedModules.push('candidate_add_agerelax')
      }
    }

    const payment_mode = await myDB.tableQry({
      table: 'cms.application_payment',
      where: { post_id: post_id },
      selectfields: ['paymode'],
    })

    return {
      data: [
        {
          modules: filter(
            modules,
            (module) => !includes(removedModules, module?.candidate_formid),
          ),
          post_name: `${pd.post_name} Closing Date:${utils.get_Istviewdate(
            pd.close_date,
            'datetime',
          )} 
          Post Status: ${upperFirst(pd.status)}`,
          close_date: pd?.close_date,
          challan_closed: pd?.challan_closed,
          revise_closed: pd?.revise_closed,
          post_status: pd.status,
          payment_mode: payment_mode?.[0]?.paymode,
        },
      ],
      message: 'application response',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const data = async (params, reply) => {
  try {
    let {
      post_id,
      request: {
        authUser: { registrationid },
      },
    } = params
    const _params = { post_id, registrationid }
    let vd = await application.validations(_params)
    let rows = await application.qry(_params)
    if (rows.length > 0) {
      vd['application'] = rows[0]
      if (vd['application']?.app_status >= applicationStatus.appFilled) {
        if (vd?.app_status === 2)
          vd['app_status'] = vd['application']?.app_status
      }
    }
    delete vd?.forms
    delete vd?.pd

    return vd
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const appdata = async (params, reply) => {
  try {
    const {
      post_id,
      request: {
        authUser: { registrationid },
      },
    } = params
    const _params = { post_id, registrationid }
    let vd = await application.validations(_params)
    let rows = await application.qry(_params)
    if (rows.length > 0) {
      vd['application'] = rows[0]
    }
    let schemas = {}
    for (let formId in vd?.formsStatus) {
      schemas[formId] = await formSortColumns(formId)
    }
    vd['schemas'] = schemas

    vd['html'] = await getPreviewHtml(vd, reply)

    return vd
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const upsert = async (params, reply) => {
  try {
    const {
      post_id,
      request: {
        authUser: { registrationid },
      },
    } = params
    let _params = { registrationid, post_id }
    let vd = await application.validations(_params)
    const {
      pd: { postinfo },
    } = vd
    let valid_status = utils.parseInt({ value: vd?.app_status })
    let app_status = valid_status
    let app_id = 0
    let rows = await application.qry(_params)
    if (rows.length > 0) {
      app_status = rows[0]?.app_status
      app_id = rows[0]?.app_id
    }
    if (postinfo.status === postStatus.closed) {
      let closed = true
      if (
        app_status === applicationStatus.revise ||
        app_status === applicationStatus.withdrawal
      ) {
        closed = postinfo?.revise_closed
      }
      if (closed)
        return {
          message: "Application already closed, you can't update application",
        }
    }
    if (app_id > 0) {
      if (app_status >= applicationStatus.appFilled) {
        return {
          message: 'Application already submitted',
        }
      }
    } else {
      if (app_status === applicationStatus.notEligible) {
        return { message: "Application can't be created, Not Eligible!" }
      }
    }
    if (valid_status === 2) {
      const fee = utils.parseInt({
        value: vd?.validations?.fee?.fee,
        defaultValue: 1,
      })
      if (fee === 0) {
        app_status = applicationStatus.finalSubmit
        await send_application_mail(params, reply)
      } else {
        //TO Change Payment Status
        const sql = `select transaction_id from cms.application_payment where COALESCE(tran_status,1)=1 and registrationid=${registrationid} and post_id=${post_id}`
        const res = myDB.sqlQry({ sql }) as any
        if (res.length > 0) app_status = applicationStatus.finalSubmit
        else app_status = applicationStatus.appFilled
      }
    }
    if (
      app_status > applicationStatus.eligible &&
      app_status !== applicationStatus.withdrawal
    ) {
      await application_linkposts(params, vd)
    }
    let resp
    if (app_id === 0) {
      const sql = `select application_auto_app_id as app_id from application_auto_app_id(${post_id})`
      let rows = await myDB.sqlQry({ sql })
      if (rows[0].length == 0)
        return { message: 'Application ID generation error!' }
      app_id = rows[0]?.app_id
      resp = await myDB.insert({
        table: 'cms.applications',
        data: { ..._params, app_id, app_status },
        dbSerialize: false,
      })
    } else {
      resp = await myDB.update({
        table: 'cms.applications',
        data: { ..._params, app_status },
        where: { app_id },
        dbSerialize: false,
        log: {
          formid: 'application',
          ip: params?.ip,
          authUser: params?.authUser,
          old_data: rows[0],
        },
      })
    }
    return {
      data: { app_id },
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_streams = async (params, reply) => {
  try {
    const {
      post_id,
      request: {
        authUser: { registrationid },
      },
    } = params
    const pstDetails = await application.details(params)
    let vd = await application.validations({ post_id, registrationid })

    const streams = uniqBy(
      filter(values(vd?.pd?.exam_stream_rules), (item) => {
        
        if(item?.marital === 'A'){
          return vd?.forms?.candidate_qualification.map((item) =>
          item?.equi_qualification.toString(),
        )
        }

        return (
          vd?.forms?.candidate_qualification.map((item) =>
            item?.equi_qualification.toString(),
          ) && item?.marital === vd?.forms?.candidate_profile?.marital
        )
      }),
      'exam_stream_id',
    ).map((item) => item?.exam_stream_id)

    let rows = []
    if (Array.isArray(streams)) {
      if (streams.length > 0) {
        const sql = `select exam_stream_id as value,COALESCE(exam_stream_fullname,exam_stream) as label from master_exam_streams where exam_stream_id in (${streams.join(',')})`
        rows = await myDB.sqlQry({ sql })
      }
    }

    return {
      data: rows,
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const app_status_update = async (params) => {
  try {
    const { registrationid, post_id, app_id, app_status } = params
    if (myValue.isEmpty(app_status)) throw "Application status can't be empty"
    let cond
    if (!myValue.isEmpty(app_id)) {
      cond = `app_id=${app_id}`
    } else {
      cond = `registrationid=${registrationid} and post_id=${post_id}`
    }

    const sql = `update cms.applications set app_status=${app_status} where ${cond}`

    if (app_status?.toString() === applicationStatus.finalSubmit?.toString()) {
      await send_application_mail(params, {})
    }

    return await myDB.sqlQry({ sql, qryexe: true })
  } catch (e) {
    throw e
  }
}

export const update_appstatus = async (params, reply) => {
  try {
    const { registrationid, post_id, app_id, app_status } = params
    if (myValue.isEmpty(app_status)) throw "Application status can't be empty"
    if (
      !(
        app_status === applicationStatus.revise ||
        app_status === applicationStatus.withdrawal
      )
    )
      return {
        message: 'Application Status is not proper!',
      }
    const p = post.info({ post_id })
    if (p['revise_closed'] && p['closed']) {
      return {
        message: "Application status can't be revise/withdrawal!",
      }
    }
    const res = await app_status_update(params)
    return {
      message: 'ok',
    }
  } catch (e) {
    return {
      message: e?.message ? e.message : e,
    }
  }
}

export const update_changed_data = async (params, reply) => {
  await application.critical_revalidate()
}

export const challan_generate = async (params) => {
  const post_info = await myDB.sqlQry({
    sql: `select p.post_name,p.fee, EXTRACT(YEAR FROM issue_date) as year, close_date,
  challan_generation_date from main.posts p,main.posts_notices n where p.notice_id=n.notice_id and p.post_id=${params?.post_id}`,
  })

  const candidate_info = await myDB.tableQry({
    table: 'cms.candidate_master',
    where: { registrationid: params?.registrationid },
    selectfields: ['candidate_name'],
  })


  let ref_id = myuuid('abcdefghijklmnopqustuvwxyz0123456789', 36)

  await myDB.insert({
    table: 'cms.application_payment_status',
    data: {
      post_id: params?.post_id,
      registrationid: params?.registrationid,
      fee: post_info?.[0]?.fee,
      additional_info: `{"mode": "offline_mode_challan_generated"}`,
      id: ref_id,
    }
  })

  const res = await myDB.sqlQry({ sql: `select * from cms.application_payment_status where id='${ref_id}'`})


  return [
    {
      post_info: [
        {
          post_name: post_info?.[0]?.post_name,
          year: post_info?.[0]?.year,
          close_date: post_info?.[0]?.close_date,
          challan_generation_date: res?.[0]?.created_at,
          ref_id: ref_id,
          fee: post_info?.[0]?.fee,
        },
      ],
      candidate_info: {
        name: candidate_info?.[0]?.candidate_name,
        registrationId: params?.registrationid?.toString(),
      },
      concatNameAndNo: utils.concatNameAndNo(
        candidate_info?.[0]?.candidate_name,
        params?.registrationid,
      ),
    },
  ]
}
