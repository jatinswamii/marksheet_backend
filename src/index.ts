import fastify, { FastifyListenOptions } from 'fastify'
import { v4 as uuidv4 } from 'uuid'
import fastifyCompress from '@fastify/compress'
import fastifyCookie from '@fastify/cookie'

// import RedisStore from "@mgcrea/fastify-session-redis-store";
import fastifySession from '@fastify/session'
import * as routes from './routes'

import loadConfig from './config'
import { redisInit } from './utils/redisClient'

const init = require('./utils/logger')
const logger = init('upsc_backend')

// import  { loggerMiddleWare } from '../src/middleware/logger'

loadConfig()

const RedisStore = require('connect-redis').default

const port = parseInt(process.env.API_PORT)

const redis = redisInit()

const store = new RedisStore({
  client: redis,
})

const startServer = async () => {
  try {
    const server = fastify({
      ajv: {
        customOptions: { allErrors: true },
        plugins: [require('ajv-merge-patch'), require('ajv-errors')],
      },
      requestIdHeader: 'x-service-request-id',
      requestIdLogLabel: 'requestId',
      genReqId: function () {
        return `${uuidv4()}`
      },
    })

    server.register(fastifyCompress, {
      zlibOptions: {
        level: 6, // default is typically 6, max is 9, min is 0
      },
      global: true,
      threshold: 163840000,
      removeContentLengthHeader: false
    })

    // server.register(loggerMiddleWare);

    server.register(require('@fastify/jwt'), {
      secret: 'fastify',
      sign: {
        algorithm: 'HS256',
        expiresIn: parseInt(process.env.SESSION_EXPIRED_SECONDS),
      },
    })

    server.register(fastifyCookie, {
      secret: Buffer.from(process.env.SECURE_SESSION_SECRET, 'hex'), // for cookies signature
      parseOptions: {},
    })

    server.register(fastifySession, {
      store,
      secret: 'a secret with minimum length of 32 characters',
      saveUninitialized: false,
      cookieName: 'myCokkie',
      cookie: { secure: false, sameSite: true, path: '/', maxAge: parseInt(process.env.SESSION_EXPIRED_SECONDS) },
      rolling: false,
    })

    server.register(require('@fastify/csrf-protection'))

    server.register(require('@fastify/formbody'))

    server.register(require('@fastify/cors'), {
      origin: process.env.WHITELISTED_ORIGIN.split(","),
      methods: ['POST', 'GET'],
      credentials: true,
    })

    server.register(require('@fastify/multipart'), {
      limits: {
        fieldNameSize: 100,
        fieldSize: 100,
        fields: 10,
        fileSize: 1 * 1024 * 1024,
        files: 1,
        headerPairs: 2000,
        parts: 1000,
      },
      preservePath: true,
    })

    server.register(require('fastify-file-upload'))

    server.register(require('@fastify/helmet'))

    server.register(routes.apiRouter, { prefix: '/api' })
    server.register(routes.baseRouter, { prefix: '/' })
 
    server.addHook('onError', (request, reply, error: any, done) => {
      logger.error('Error', error)
      done()
    })

 

    server.get('/', (request, reply) => {
      reply.send({ name: 'fastify-typescript' })
    })

    if (process.env.NODE_ENV === 'production') {
      for (const signal of ['SIGINT', 'SIGTERM']) {
        process.on(signal, () =>
          server.close().then((err) => {
            console.log(`close application on ${signal}`)
            process.exit(err ? 1 : 0)
          }),
        )
      }
    }

    const options: FastifyListenOptions = {
      port,
      host: process.env.API_HOST,
    }

    logger.info(`Server is running at ${options.port} ${options.host}`)
    await server.listen(options)
    server.addresses()
  } catch (e) {
    console.log(e)
  }
}

startServer()
