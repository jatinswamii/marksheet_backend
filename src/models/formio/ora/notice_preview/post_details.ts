import { handleServerError } from '../../../../helpers/server/serverErrors'
import { postData } from './postQry'

export const post_details = async (params, reply) => {
  try {
    const pd = await postData.all_info({post_id: params.post_id}, reply)
    
    return { data: pd, message: ''}
  } catch (e) {
    handleServerError(reply, e)
  }
}