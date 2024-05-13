import { myDB } from '../../../utils/db/dbHelper'
import { handleServerError } from '../../../helpers/server/serverErrors'

export const upsert = async (params, reply) => {
  let res = []
  try {
    res = await myDB.upsert({
      table: 'cms.candidate_daf_parent_info',
      data: {
        registrationid: params?.authUser?.registrationid,
        ...params?.upsert_payload,
      },
      where: {
        registrationid: params?.authUser?.registrationid,
      },
    })

    return { data: res, message: 'Data updated successfully' }
  } catch (e) {
    handleServerError(reply, e)
  }
}