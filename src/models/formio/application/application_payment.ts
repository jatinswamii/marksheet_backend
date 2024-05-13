import { utils } from '../../../utils/coreUtils'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { post } from '../../../helpers/my/postQry'
import { mergeColumnsValuesInSchema } from '../../../helpers/formio/formio.common'
import { applicationStatus } from '../../../config/appConstants'
import { myDB } from '../../../utils/db/dbHelper'
import { app_status_update } from '../candidate/application'
import { getPreviewHtml } from '../../../models/public/getForm'
import { printPDF } from '../../../utils/generateHtml'
import { formSortColumns } from '../../../helpers/formio/getColumns'
import { application } from '../../../helpers/my/applicationQry'

export const afterSchema = async (params, reply) => {
  try {
    let { data } = params
    let columns = {}
    columns['amount'] = {
      defaultvalue: await get_examFee(data, reply),
    }
    params.fschema = mergeColumnsValuesInSchema(params.fschema, columns)
    return params
  } catch (e) {
    return params
  }
}

export const send_application_mail = async(params, reply) => {
  const {
    registrationid,
    post_id,
  } = params

  let vd = await application.validations({ registrationid, post_id })
  let rows = await application.qry({ registrationid, post_id })
  if (rows.length > 0) {
    vd['application'] = rows[0]
  }
  let schemas = {}
  for (let formId in vd?.formsStatus) {
    schemas[formId] = await formSortColumns(formId)
  }
  vd['schemas'] = schemas

  const recpeintId = params?.email || params?.authUser?.email;

  vd['html'] = await getPreviewHtml(vd, reply)
  
  await printPDF(
    vd['html'],
    'application.pdf',
    registrationid,
    recpeintId,
    reply,
  )
  return 'ok'
}

// export const afterUpdate = async (params, reply) => {
//   try {
//     const {
//       data: { registrationid, post_id },
//     } = params

//     return await app_status_update({
//       registrationid,
//       post_id,
//       app_status: applicationStatus.finalSubmit,
//     })
//   } catch (e) {
//     handleServerError(reply, e)
//   }
// }

export const get_examFee = async (params, reply) => {
  try {
    const { post_id } = params
    let fee = 0
    const postinfo = await post.info(params)
    return utils.parseInt({ value: postinfo['fee'], defaultValue: 25 })
  } catch (e) {
    handleServerError(reply, e)
  }
}
