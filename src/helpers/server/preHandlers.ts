import { FastifyReply } from 'fastify'
import { has } from 'lodash'
import { ERROR400, ERROR401 } from '../../config/systemConstants'
import * as JWT from 'jsonwebtoken'
import { ERROR_MESSAGE } from './serverErrors'
import { handleServerResponse } from './serverResponse'

export const validateFormIO = async (request: any, reply: FastifyReply) => {
  const formId = request?.body?.formId

  if (!formId) {
    reply.code(ERROR401.statusCode).send(ERROR401)
  }

  if (has(request.body, 'captcha')) {
    if (request.session.captcha !== request.body.captcha) {
      handleServerResponse(reply, {
        data: {
          statusCode: ERROR400,
          message: ERROR_MESSAGE.INVALID_CAPTCHA,
        },
      })
    }
  }
  
  const unauth_forms = [
    'otr_form',
    'candidate_login',
    'admin_login',
    'forgotpassword',
    'expert_login',
    'email_mobile_update'
  ]

  if (!unauth_forms.includes(formId)) {
    validAuthentication(request, reply)
  }
}

export const validateService = async (request: any, reply: FastifyReply) => {
  const body = request?.body
  const myservice = `${body?.path}.${body?.section}.${body?.action}`
  if (!myservice) {
    reply.code(ERROR401.statusCode).send(ERROR401)
  }

  const unauth_service = ['notification.otp.send', 'notification.otp.verify', 'notification.otp.sendGuestOtp', 'notification.otp.sendGuestLogin']

  if (!(body?.path === 'public' || unauth_service.includes(myservice))) {
    validAuthentication(request, reply)
  }
}

export const validAuthentication = async (
  request: any,
  reply: FastifyReply,
) => {
  try {
    const token = request.headers?.['authorization']?.split(' ')[1]
    if (!token) {
      reply.code(ERROR401.statusCode).send(ERROR401)
    }
    const user: any = JWT.verify(token, process.env.APP_JWT_SECRET)
    
    if (!(user.registrationid || user.email)) {
      reply.code(ERROR401.statusCode).send(ERROR401)
    }
    request.authUser = { ...user }
  } catch (e) {
    if (e.message === 'jwt expired') e.message = 'Token Expired!'
    reply.code(ERROR401.statusCode).send(e)
  }
}
