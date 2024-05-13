import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'

export const upsert = async (params, reply) => {
  delete params?.data?.module_id
  delete params?.data?.module_type
  delete params?.data?.challan_status 
  
  try {
    await myDB.upsert({
      table: params?.fd?.dbtable,
      data: params?.data,
      where: { post_id: params?.data?.post_id },
    })
    return {
      message: 'We capture your transaction details successfully'
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}
