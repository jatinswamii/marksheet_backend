import { handleServerError } from '../../../helpers/server/serverErrors'

export const list = async (params, reply) => {
  try {
    return { data: [] }
  } catch (e) {
    handleServerError(reply, e)
  }
}