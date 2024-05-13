import { handleServerError } from '../../../helpers/server/serverErrors'

export const afterUpdate = async (params, reply) => {
  try {
    // await ocr(params, reply)
    return {}
  } catch (e) {
    handleServerError(reply, e)
  }
}


