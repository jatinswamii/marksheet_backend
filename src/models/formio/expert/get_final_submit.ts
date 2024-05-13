import moment from 'moment'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'

export const get = async (params, reply) => {

  try {
    const finalSubmitted = await myDB.tableQry({
      table: 'cms.temp_expert_data',
      where: { expertid: params?.registrationid, is_submited: 1 },
      selectfields: ['is_submited'],
    })
    return { data: { is_submitted: Boolean(finalSubmitted?.[0]?.is_submited)}, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}
