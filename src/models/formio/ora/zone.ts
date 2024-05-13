import { myDB } from '../../../utils/db/dbHelper'
import { handleServerError } from '../../../helpers/server/serverErrors'

export const upsert = async (params, reply) => {
  let res = []
  try {
    res = await myDB.upsert({
      table: 'public.zone',
      data: {
        cdid: params?.formId,
        ...params?.upsert_payload,
      },
      where: {
        cdid: params?.formId,
      },
    })

    return { data: res, message: 'Data updated successfully' }
  } catch (e) {
    handleServerError(reply, e)
  }
}