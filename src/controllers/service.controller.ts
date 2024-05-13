import { FastifyReply } from 'fastify'
import { has, lowerCase } from 'lodash'

import { ERROR_MESSAGE, handleServerError } from '../helpers/server/serverErrors'
import { handleServerResponse } from '../helpers/server/serverResponse'
import { myValue } from '../utils/coreUtils'
import { ISessionRequest } from 'interfaces'
import { ERROR400 } from '../config/systemConstants'

export const service = async (
  request: any,
  reply: FastifyReply,
) => {
  if (has(request.body, 'captcha')) {
    if (request.session.captcha !== request.body.captcha) {
      handleServerError(reply, {
        statusCode: ERROR400,
        message: ERROR_MESSAGE.INVALID_CAPTCHA,
      })
    }
  }


  try {
    const body = request.body
    let initData = body?.initData || {}
    let data = body?.data || {}
    let params = body?.params || {}
    if (myValue.isMultiPart(request)) {
      initData = typeof initData === 'string' ? JSON.parse(initData) : initData
      data = typeof data === 'string' ? JSON.parse(data) : data
      params = typeof params === 'string' ? JSON.parse(params) : params
    }
    let customModel = require(`../models/${body?.path}/${body?.section}`)    
    let resp
    switch(lowerCase(body?.section)) {
      case 'captcha':
        resp = await customModel[request?.body?.action](
          request,
          reply,
        )
        break
      default:
        resp = await customModel[request?.body?.action](
          Object.assign(
            { ...params },
            { ...initData, ...data },
            { ...request.authUser },
            { ...request.ip },
            {...request.body },
            { request },
          ),
          reply,
        )
        break
    }
   
    if (resp) {
      if (!has(resp, 'data')) {
        resp = {
          data: resp,
          message: 'ok',
        }
      }
      handleServerResponse(reply, resp)
    }
  } catch (e) {
    handleServerError(reply, e)
  }

}
