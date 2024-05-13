import { FastifyRequest } from 'fastify'


export interface IUserRequest extends FastifyRequest {
  body: any
  authUser: any
}

export interface IUserAuthToken {
  id: number
  email: string
}

export interface IGetPresign {
  fileName: string
}

export interface IPutPresign {
  userId: number
  fileName: string
}

export interface ISessionRequest extends FastifyRequest {
  body: any
  authUser: any
  session: any
  params: any
}
