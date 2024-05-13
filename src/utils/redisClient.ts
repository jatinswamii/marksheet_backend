import { myjsonStringify } from '../helpers/server/serverResponse'
import moment from 'moment'
const Redis = require('ioredis')
const crypto = require('crypto')
import { myValue } from './coreUtils'
let redis

export const redisInit = () => {
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT || 6379,
    db: process.env.REDIS_DB || 0,
    retryStrategy: function (times) {
      return process.env.REDIS_RECONNECT_MILISECONDS
    },
  })
  redis.on('ready', () => {
    if (process.env.NODE_ENV === 'development') console.log('Redis is READY')
  })
  redis.on('error', (error) => {
    if (process.env.NODE_ENV === 'development') console.log(error)
  })

  return redis
}

export const strToHash = (str) => {
  if (!str.toLowerCase().includes('select ')) return str
  return crypto.createHash('sha256').update(str).digest('hex')
}

export const redisGet = async (key) => {
  let resp = null
  if (myValue.isEmpty(key)) return resp
  if (process.env.REDIS_ACTIVE === 'N') {
    return resp
  }

  key = strToHash(key)

  if (redis.status !== 'ready') {
    redisInit()
    return resp
  }

  await redis.hget(key, 'data', (err, result) => {
    resp = result ? JSON.parse(result) : null
  })
  
  return resp
}

export const redisSet = async (key, data, ttl) => {
  if (myValue.isEmpty(key)) return
  if (process.env.REDIS_ACTIVE === 'N') {
    return
  }
  // if (!(ttl===1 || ttl >100)) {
  //   return 
  // }
  if (redis.status !== 'ready') {
    redisInit()
    // return
  }
  key = strToHash(key)

  if (typeof data === 'object') data = JSON.stringify(myjsonStringify(data))
  const pipeline = redis.pipeline()
  pipeline.hset(key, 'data', data)
  if (ttl > -1) {
    if (ttl < 60) {
      ttl = moment(
        moment().add(ttl, 'days').format('YYYY-MM-DD') + ' 00:00:00',
      ).unix()
      pipeline.expireat(key, ttl)
    } else {
      pipeline.expire(key, ttl)
    }
  }
  await pipeline.exec()
}
export const redisKeyDel = async (key) => {
  if (myValue.isEmpty(key)) return
  if (process.env.REDIS_ACTIVE === 'N') {
    return
  }
  await redis.del(key, function(err, response) {
    if (response == 1) {
       console.log("Deleted Successfully!")
    } else{
     console.log("Cannot delete")
    }
 })
}
// like *:approver_change_request or fschema:* or post_*:1
export const redisDel = async (KeyPattern) => {
  if (myValue.isEmpty(KeyPattern)) return
  if (process.env.REDIS_ACTIVE === 'N') {
    return
  }
  if (KeyPattern === '') return
  const keys = await redis.keys(KeyPattern);
  // console.log("Client Delete====>",keys)
  // const stream = redis.scanStream({
  //   match: KeyPattern,
  // })
  for(const key of keys) {
    await redis.del(key);
  }
  // keys.forEach(key => {
  //   await redis.del(key);
  // });
  // await stream.on('data', async (keys) => {
  //   // `keys` is an array of strings representing key names
  //   if (keys.length) {
  //     var pipeline = redis.pipeline()
  //     keys.forEach(function (key) {
  //       pipeline.del(key)
  //     })
  //     await pipeline.exec()
  //   }
  // })
}
