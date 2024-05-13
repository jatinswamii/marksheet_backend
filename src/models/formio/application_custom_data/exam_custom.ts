import { myDB } from '../../../utils/db/dbHelper'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { prisma } from '../../../utils/prismaClient'

export const upsert = async (params, reply) => {
  let res = []
  try {
    res = await myDB.upsert({
      table: 'cms.application_custom_data',
      data: {
        post_id: params?.data?.post_id,
        registrationid: params?.data?.registrationid,
        formid: params?.formId,
        form_data: JSON.stringify(params?.upsert_payload),
      },
      where: {
        post_id: params?.data?.post_id,
        registrationid: params?.data?.registrationid,
      },
    })

    return { data: res, message: 'Data updated successfully' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const get = async (params, reply) => {
  let res = []
  try {
    res = await myDB.tableQry({
      table: 'cms.application_custom_data',
      where: { post_id: params?.initData?.post_id },
    })

    return { data: [res?.[0].form_data], message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}
