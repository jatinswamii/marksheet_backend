import { FastifyInstance } from 'fastify'
import * as schemas from './schema'
import * as controllers from '../controllers'
import { validAuthentication,validateFormIO, validateService } from '../helpers/server/preHandlers'


export const apiRouter = async (fastify: FastifyInstance) => {
  fastify.decorateRequest('authUser', '')
  fastify.decorateRequest('params', '')
  //fastify.addHook('onRequest', fastify.csrfProtection)
  fastify.route({
    method: 'POST',
    url: '/formio',
    schema: schemas.formSchema,
    preHandler: [validateFormIO],
    handler: controllers.formio,
  })

  fastify.route({
    method: 'POST',
    url: '/service',
    schema: schemas.serviceSchema,
    preHandler: [validateService],
    handler: controllers.service,
  })
  

//   fastify.route({
//     method: 'POST',
//     url: '/uploadfile',
//     schema: serviceSchema,
//     preHandler: [validAuthentication],
//     handler: controllers.uploadFile,
//   })
}

