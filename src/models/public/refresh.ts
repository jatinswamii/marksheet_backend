import { handleServerError } from '../../helpers/server/serverErrors'
import { handleServerResponse } from '../../helpers/server/serverResponse';


export const token = async (request: any, reply: any) => {
  try {
    const token = await reply.generateCsrf()
    return { token, session: 'demo' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const getClientInfo = async (request: any, reply: any) => {
  try {
    handleServerResponse(reply, {
      data: [{ ip: request?.request?.ip, ips: request?.request?.ips }],
      message: 'success',
    })
  } catch (e) {
    handleServerError(reply, e)
  }
}
