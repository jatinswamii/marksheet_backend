import { FastifyReply } from 'fastify'

import { trim, has } from 'lodash'
import { myValue, utils } from '../utils/coreUtils'
import { myDB } from '../utils/db/dbHelper'
import { ISessionRequest } from '../interfaces'
import {
  ERROR_MESSAGE,
  handleServerError,
} from '../helpers/server/serverErrors'
import { handleServerResponse } from '../helpers/server/serverResponse'
import { myKeyCond, getFormCustomModel } from '../helpers/formio/formio.common'

import {
  get,
  upsert,
  list,
  del,
  schema,
} from '../helpers/formio/formio.helpers'
import { getFieldAttributes, dbSerializeData } from '../utils/db/dbSerialzation'
import { redisGet, redisSet } from '../utils/redisClient'
import { ERROR400 } from '../config/systemConstants'

const path = require('path')

export const myform = async (
  params,
  reply,
  isMultiPart: boolean = false,
  request,
) => {
  try {
    let cacheKey = ''
    if (params?.action === 'schema') {
      const _keys = {
        ...params['data'],
        ...params['initData'],
      }
      let keys = ''
      for (var key in _keys) keys += _keys[key]
      if (!myValue.isEmpty(keys)) keys = `:${keys}`
      // cacheKey=`fschema:${params.formId}:${keys}`
      // const d= await redisGet(cacheKey)
      // if (!myValue.isNil(d)) return d
    }

    if (myValue.isEmpty(params.formId)) throw new Error('FormID is empty!')
    if (myValue.isEmpty(params.action)) throw new Error('Action is empty!')
    let fd = await myDB.tableQry({
      table: 'my_forms',
      where: {
        formid: params?.formId,
        active: 1,
      },
      cache: 1,
      cacheKey: `my_forms:${params?.formId}`,
    })
    if (fd.length === 0) throw new Error('Form is not found')
    fd = fd[0]

    params['fd'] = fd
    params['initData'] = isMultiPart
      ? JSON.parse(params['initData'])
      : params['initData']

    params['dbtable'] = myValue.isEmpty(trim(fd?.dbtable))
      ? params?.formId
      : fd.dbtable
    const fieldsattr = getFieldAttributes(params['dbtable'])
    params = Object.assign(params, { fieldsattr })
    params['data'] = params['data'] || {}
    if (params['initData']) {
      params['data'] = {
        ...params['data'],
        ...params['initData'],
      }
    }
    params['data'] = dbSerializeData(
      params['dbtable'],
      params['data'],
      fieldsattr,
    )
    if (has(params, 'data.captcha')) {
      if (request.session.captcha !== request.body.captcha) {
        handleServerResponse(reply, {
          data: {
            statusCode: ERROR400,
            message: ERROR_MESSAGE.INVALID_CAPTCHA,
          },
        })
      }
    }
    params = myKeyCond(params, reply)

    let customModel = getFormCustomModel(fd)

    let res = {}
    
    switch (params?.action) {
      case 'get':
        res = await get(params, reply, customModel)
        break
      case 'list':
        res = await list(params, reply, customModel)
        break
      case 'upsert':
        res = await upsert(params, reply, customModel)
        break
      case 'del':
        res = await del(params, reply, customModel)
        break
      case 'schema':
        res = await schema(params, reply, customModel)
        //if (cacheKey !='') await redisSet(cacheKey,res,1)
        break
    }
    return res
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const formio = async (request: ISessionRequest, reply: FastifyReply) => {
  let params = request?.body

  const isMultiPart = myValue.isMultiPart(request)
  params = isMultiPart ? utils.formDataToJSON(params) : params
  params['ip'] = request?.ip
  params['authUser'] = request?.authUser
  let res = {} as any

  if (params?.action === 'schema' && params?.formId instanceof Array) {
    const formIds = params.formId

    for (let formId of formIds) {
      params.formId = formId
      const fdata = (await myform(params, reply, isMultiPart, request)) as any
      res[params.formId] = fdata?.data?.[0]
    }
    res = { data: res }
  } else {
    res = await myform(params, reply, isMultiPart, request)
  }

  if (params?.isInternal) {
    return res
  }

  handleServerResponse(reply, res)
}
