import { FastifyInstance } from 'fastify'
import * as schemas from './schema'
import * as controllers from '../controllers'
import { validAuthentication } from '../helpers/server/preHandlers'

export const baseRouter = async (fastify: FastifyInstance) => {
  fastify.decorateRequest('authUser', '')
  //fastify.addHook('onRequest', fastify.csrfProtection)
  fastify.route({
    method: 'POST',
    url: '/login',
    schema: schemas.loginSchema,
    handler: controllers.login,
  })

  fastify.route({
    method: 'POST',
    url: '/logout',
    handler: controllers.logOut,
  })

  fastify.route({
    method: 'POST',
    url: '/refresh-token',
    // schema: schemas.loginSchema,
    preHandler: [validAuthentication],
    handler: controllers.refreshToken,
  })

  // generate a token
  fastify.route({
    method: 'POST',
    url: '/csrf',
    handler: async (req: any, reply: any) => {
      const token = await reply.generateCsrf()
      return { token }
    },
  })
}
