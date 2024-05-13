import { toString } from 'lodash';
import { FastifyReply, errorCodes } from 'fastify'
const statusCodes = require('http').STATUS_CODES

export const ERROR_MESSAGE = {
  INVALID_USER: 'Invalid Credentials',
  INVALID_PASSWORD: 'Invalid Credentials',
  INVALID_CAPTCHA: 'Invalid captcha',
  USER_EXISTS: 'User exists',
}

export const ERRORS = {
  invalidToken: new Error('Token is invalid.'),
  userExists: new Error('User already exists'),
  userNotExists: new Error('Invalid Credentials'),
  userCredError: new Error('Invalid credential'),
  tokenError: new Error('Invalid Token'),
}

export function handleServerError(reply: FastifyReply, error: any) {
  let statusCode,message;
  if (typeof error ==='string') { 
    statusCode=400,
    message=error
  }
  else {
    statusCode=error?.statusCode || 500
    message=toString(error)
  }

  reply
  ?.status(302)
  ?.send({
    data: {
      error,
      message: error?.meta?.code ? 'Something went wrong': error?.meta?.message,
    }
  })
  
  throw Error(error)
}

export function handleValidationError<T>(
  func: (...args: any[]) => T,
  ...args: any[]
): T | undefined {
  try {
    return func(...args)
  } catch (error) {
    if (error instanceof errorCodes.FST_ERR_VALIDATION) {
      // Custom handling for FST_ERR_VALIDATION
      console.log(`Custom handling for FST_ERR_VALIDATION: ${error.message}`)
      // Additional actions, logging, or error recovery can be performed here
    } else {
      // Re-throw other errors not related to FST_ERR_VALIDATION
      throw error
    }
  }
}
