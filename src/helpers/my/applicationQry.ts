import {
  has,
  includes,
  sortBy,
  groupBy,
  values,
  reduce,
  isEmpty,
  filter,
  map,
} from 'lodash'
import { myDB, sqlCond } from '../../utils/db/dbHelper'
import { myValue, utils } from '../../utils/coreUtils'
import { myjsonStringify } from '../server/serverResponse'
import { post } from './postQry'
import { cms } from './candidateQry'
import { applicationChecks } from './applicationChecks'
import { masters } from './mastersQry'
import { applicationStatus, postModule } from '../../config/appConstants'
import { app_status_update } from '../../models/formio/candidate/application'
import { sendNotification } from '../../models/notification/sendNotification'

export const application = {
  qry: async (params) => {
    try {
      //const { post_id,app_id,registrationid } = params
      //if (myValue.isEmpty(app_id) && myValue.isEmpty(post_id) && myValue.isEmpty(registrationid)) throw new Error('Required any one key [app_id,post_id,registrationid]')
      let cond = ''
      cond += sqlCond({ field: 'app_id', params })
      cond += sqlCond({ field: 'post_id', params })
      cond += sqlCond({ field: 'registrationid', params })
      if (myValue.isEmpty(cond))
        throw 'Valid input data is not found app_id/post_id/registrationid'
      cond += sqlCond({ field: 'app_status', params })
      const sql = `select * from cms.applications where '1' ${cond}`
      const rows = await myDB.sqlQry({ sql })
      return rows
    } catch (e) {
      throw e
    }
  },
  details: async (params, app_group = '') => {
    try {
      const {
        post_id,
        registrationid
      } = params

 
      // POST ALL Data
      let pd = (await post.alldata(post_id)) as any

      // CANDIDATE PH and CANDIDATE COMMUNITY TODO SANJAY

      const o = groupBy(values(pd?.postrules), 'rule_group')

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

      const candidate_consent = await myDB.sqlQry({ sql: `select consent from cms.candidate_consent where registrationid='${registrationid}' and post_id='${post_id}'`})

      if(!includes(candidate_consent?.[0]?.consent, 'agerelax') && !isEmpty(candidate_consent?.[0]?.consent)){
        removedModules.push('candidate_add_agerelax')
      }

      let formsStatus = {}
      let forms = {}
      
      let modules = sortBy(pd['pmd'], 'sortno')

      let my_forms = await masters.my_forms()

      for (let module of modules) {
        const module_id = module?.module_id
        //const module = pd['pmd'][module_id]
        if (module_id === postModule.ExamStreams) {
          if (pd['postinfo']?.post_type === 's') {
            const rows = await masters.master_exam_streams(
              pd['postinfo']?.exam_id,
            )
            if (rows.length < 2) {
              delete pd['pmd'][module_id]
              continue
            }
          }
        }
        let formid = module['candidate_formid']
        if (module_id === postModule.ExamCustomInfo) {
          if (pd['postinfo']?.post_type === 's') {
            const exams = await masters.master_exams()
            if (has(exams, pd['postinfo']?.exam_id)) {
              formid = `exam_custom_${exams[pd['postinfo']?.exam_id]?.exam_code}`
              if (!has(my_forms, formid)) continue
            }
          }
        }

        //additional form
        let formvisible = false
        switch (formid) {
          case 'candidate_ph_scribe_detail':
            if (has(forms, 'candidate_ph')) {
              if (!myValue.isEmpty(forms['candidate_ph']?.[formid]))
                formvisible = true
            }
            if (!formvisible) continue
            break
        }
        if (myValue.isEmpty(formid))
          throw `Module ID ${module_id}, candidate_formid is not empty`
        forms[formid] = {}
        if (module.custom === 'Y') {
          forms[formid] = await cms.candidate_custom_form(params, pd, module_id)
        } else {
          
          if (module_id === postModule.ExamCustomInfo) {
            forms[formid] = await cms.application_custom_data(
              { ...params, formid },
              pd,
            )
          } else if (has(cms, formid)) {
              forms[formid] = await cms[formid](params, pd)
            } else {
              const dbtable = pd['pm'][module_id]?.dbtable
              if (myValue.isEmpty(dbtable))
                throw `Module ID ${module_id}, ${formid} is not valid`
              let rows = await cms.postLinkData({
                dbtable: pd['pm'][module_id]?.dbtable,
                params,
              })
              if (rows.length === 0) forms[formid] = {}
              else forms[formid] = rows[0]
            }
          }


        
        formsStatus[formid] = 0
        if (Array.isArray(forms[formid])) {
          formsStatus[formid] = forms[formid].length
        } else {
          formsStatus[formid] =
            Object.keys(forms[formid]).length > 0
              ? 1
              : includes(removedModules, formid)
                ? 1
                : 0
        }
      }

      let addformrequired = []
      if (has(forms, 'candidate_ph')) {
        const ph = forms['candidate_ph']
        if (ph?.valid === 'Y') {
          if (!myValue.isEmpty(ph?.addformrequired)) {
            addformrequired.push(ph?.addformrequired)
          }
        }
      }

      pd['formsStatus'] = formsStatus
      pd['forms'] = forms
      pd['addformrequired'] = addformrequired
      return pd
    } catch (e) {
      throw e
    }
  },
  validations: async (params) => {
    try {
      const pd = (await application.details(params)) as any
      const { postinfo } = pd
      let _validations
      if (postinfo?.post_type === 'o') {
        _validations = {
          profile: 'Profile',
          vacancy: 'Vacancy',
          age: 'Age',
          qualification: 'Qualification',
          experience: 'Experience',
          fee: 'Fee',
        }
      } else {
        _validations = {
          age: 'Age',
          profile: 'Profile',
          soap_validations: 'Exam Validations',
          fee: 'Fee',
          examAttempts: 'Exam Attempts',
        }
        const no_of_attempts = utils.parseInt({
          value: postinfo?.no_of_attempts,
        })
        if (no_of_attempts === 0) delete _validations?.examAttempts
      }
      pd['jobcategories'] = await applicationChecks.jobcategories(params, pd)
      pd['rules'] = await applicationChecks.rules(params, pd)
      let fee = -1
      let validations = {} as any
      const optional_forms = ['candidate_add_agerelax', 'application_payment']
      const eligibility_validation = [
        'vacancy',
        'qualification',
        'experience',
        'age',
        'soap_validations',
        'examAttempts',
      ]
      let finalStatus = 1,
        eligibility = 1
      for (let validation in _validations) {
        const resp = await applicationChecks[validation](params, pd)
        if (includes(eligibility_validation, validation)) {
          if (resp?.status !== 'ok') eligibility = 0
        }
        if (resp?.status !== 'ok') finalStatus = 0
        if (has(resp, 'fee')) fee = resp['fee']
        validations[validation] = { title: _validations[validation], ...resp }
      }
      const { formsStatus, forms } = pd
      if (eligibility === 1) {
        for (const [formid, vd] of Object.entries(formsStatus)) {
          if (includes(optional_forms, formid)) continue
          if (vd === 0) {
            finalStatus = 0
            break
          }
        }
      } else finalStatus = 0
      for (const [formid, data] of Object.entries(forms)) {
        forms[formid] = myjsonStringify(data)
      }
      delete pd?.forms
      delete pd?.formstatus

      return {
        app_status: finalStatus + eligibility,
        validations,
        formsStatus,
        forms,
        addformrequired: pd?.addformrequired,
        pd,
      }
    } catch (e) {
      throw e
    }
  },
  critical_revalidate: async () => {
    try {
      const sql = ` select cm.registrationid,cm.candidate_name,cm.mobile,cm.email,a.app_id,post_id,app_status from cms.candidate_critical_cahnge c left join cms.applications a on (a.registrationid=c.registrationid and app_status >=${applicationStatus.finalSubmit}),cms.candidate_master cm where c.registrationid=cm.registrationid order by c.registrationid`
      const rows = await myDB.sqlQry({ sql })
      const updated_regs = []
      const notify_regs = []
      let _row = { registrationid: 0 } as any
      let app_ids = []
      for (let row of rows) {
        if (_row.registrationid != row.registrationid) {
          if (app_ids.length > 0) {
            const message = `Dear ${_row?.candidate_name}, <br> You application(s) status got changed,Please revise your application(s):${app_ids.join(',')}`
            notify_regs.push({ [_row?.email]: { message } })
          }
          _row = row
          app_ids = []
        }
        updated_regs.push(row.registrationid)
        if (utils.parseInt({ value: row?.app_id }) !== 0) {
          let vd = await application.validations(row)
          if (vd?.app_status < 2) {
            app_status_update({
              app_id: row?.app_id,
              app_status: applicationStatus.critical,
            })
            app_ids.push(row?.app_id)
          }
        }
      }
      if (app_ids.length > 0) {
        const message = `Dear ${_row?.candidate_name}, <br> You application(s) status got changed,Please revise your application(s):${app_ids.join(',')}`
        notify_regs.push({ [_row?.email]: { message } })
      }
      await sendNotification({
        via: 'email',
        recipients: notify_regs,
        message: {},
        templateid: 'application_critical',
        subject: 'Application Status Changed!',
        reply: {},
        commonData: {
          candidate_name: _row?.candidate_name,
          app_ids: app_ids.join,
        },
      })
    } catch (e) {
      throw e
    }
  },
}
