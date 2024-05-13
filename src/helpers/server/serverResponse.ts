import { FastifyReply } from 'fastify'
import { map, toString, isObject, has } from 'lodash'
import { STANDARD } from '../../config/systemConstants'

const handleResponseValue = (data) => {
  // if (!(has(data,'registrationid') || has(data,'cdid') || has(data,'app_id'))) return data
  if (data === null) return data
  if (Array.isArray(data)) return data
  if (typeof data !== 'object') {
    if (typeof data === 'bigint') return toString(data)
    return data
  }
  const keys = Object.entries(data)
  if (keys.length === 0) return data
  let _data = {}
  for (const [key, value] of keys) {
    switch (typeof value) {
      case 'bigint':
        _data[key] = toString(value)
        break
      case 'object':
        _data[key] = handleResponseValue(value)
        break
      default:
        _data[key] = value
        break
    }
  }
  return _data
}

export function myjsonStringify(data) {
  if (Array.isArray(data)) {
    return map(data, (item) => {
      return handleResponseValue(item)
    })
  } else {
    return handleResponseValue(data)
  }
}

export function handleServerResponse(reply: FastifyReply, payload: any) {
  if (has(payload, 'data')) {
    payload.data = myjsonStringify(payload.data)
    // if(Array.isArray(payload.data)) {
    //   payload.data=map(payload.data, (item) => handleResponseValue(item))
    // }
    // else {
    //   payload.data=handleResponseValue(payload.data)
    // }
  } else {
    payload = myjsonStringify(payload)
    // payload=handleResponseValue(payload)
  }
  // const newString = JSON.stringify(payload)
  // const encryptedData = AES.encrypt(newString, process.env.AES_KEY).toString()
  reply.status(STANDARD.SUCCESS).send(payload)
  
}
