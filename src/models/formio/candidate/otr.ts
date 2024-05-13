import { isEqual, find, toString, pickBy, identity, isEmpty } from 'lodash'
import moment from 'moment'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'
import { utils } from '../../../utils/coreUtils'
import { sendNotification } from '../../../models/notification/sendNotification'
import { conversation } from '../translation/service'

export const beforeUpdate = async (params, reply) => {
  try {
    return params
  } catch (e) {
    handleServerError(reply, e)
  }
}

const handleGender = (value) => {
  switch(value?.toLowerCase()){
    case 'm':
      return 'Male';
    case 'f':
      return 'Female';
    case 't':
      return 'Transgender'
    default:
      return ''
  }
}

const handleParent = (value) => {
  switch(value?.toLowerCase()){
    case 'm':
      return 'Only Mother';
    case 'f':
      return 'Only Father';
    default:
      return 'Both'
  }
}

const handleRenderHtml = (obj, text, cols) => {
  let rows = []

  const notAllowedFields = [
    'captcha',
    'securityquestionid2',
    'securityquestionid1',
    'securityanswer2',
    'securityanswer1',
    'password',
    'changed_name',
    'cand_hindi',
  ]

  notAllowedFields.forEach((item) => delete obj[item])

  for (let [key, value] of Object.entries(obj)) {
    if (!isEmpty(value?.toString())) {

      if(key === 'dob'){
        value = moment(value).format('DD-MM-YYYY')
      }

      if(key === 'gender'){
        value = handleGender(value)
      }

      if(key === 'single_parent'){
        value = handleParent(value)
      }

      rows.push(`<tr><td width="50%"
      style="
        border: 0.5px solid #e7e7e7;
        padding: 0.4rem;
        line-height: 20px;
        height: 20px;
      ">${find(cols, (item) => isEqual(toString(item?.field), toString(key)))?.title}</td><td width="50%"
      style="
        border: 0.5px solid #e7e7e7;
        padding: 0.4rem;
        line-height: 20px;
        height: 20px;
      ">${value}</td></tr>`)
    }
  }

  return `<div class="container mt-4"> <div class="row d-flex justify-content-center"> <div class="col-md-8"> <div class="alert alert-success" style={{ borderRadius: '0' }}> One Time Registration Submitted Successfully </div> <div style={{ background: '#fff', marginTop: '20px', padding: '15px' }} > <h4 style={{ color: '#154979', fontWeight: 'bold' }}> ${text} </h4> <table style={{ width: '100%' }}> <table style=" width: 100%; "> ${rows.join('')} </table> </div> </div> </div> </div> `
}

export const upsert = async (params, reply) => {
  const candidatePaylaod = {
    ...params?.data,
    securityquestionid1: parseInt(params?.data?.securityquestionid1),
    securityquestionid2: parseInt(params?.data?.securityquestionid2),
    dob: moment(params?.data?.dob).format('YYYY-MM-DD'),
  }

  const hashPass = await utils.genSalt(10, params?.data?.password)

  candidatePaylaod['password'] = hashPass

  delete candidatePaylaod?.otp
  delete candidatePaylaod?.captcha
  delete candidatePaylaod?.registrationid

  try {
    const sql = `select candidate_auto_registrationid as registrationid from candidate_auto_registrationid()`
    let rows = await myDB.sqlQry({ sql })

    candidatePaylaod['registrationid'] = rows?.[0]?.registrationid

    let hindiData = {}

    hindiData['candidate_name'] = candidatePaylaod['candidate_name']
      ? await conversation(candidatePaylaod['candidate_name'] || ' ', reply)
      : ''

    candidatePaylaod['cand_hindi'] = JSON.stringify(hindiData)

    const user = await myDB.insert({
      table: params['dbtable'],
      data: candidatePaylaod,
    })

    if (user) {
      await sendNotification({
        via: utils.get_validVia(candidatePaylaod?.email),
        recipients: [
          {
            [candidatePaylaod?.email]: {
              reg: candidatePaylaod['registrationid'],
            },
          },
        ],
        message: {},
        templateid: 'welcome',
        commonData: pickBy(candidatePaylaod, identity),
        subject: `OTR Application Form Submission (OTR-ID: ${candidatePaylaod['registrationid']})`,
        reply: reply,
      })
      // need to send welcome email
      return {
        data: [
          {
            registationId: handleRenderHtml(candidatePaylaod, ``, params?.cols),
          },
        ],
      }
    }
    return {
      data: [
        {
          registationId: `Your OTR id is ${candidatePaylaod['registrationid']}`,
        },
      ],
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}
