import path from 'path'
import envSchema from 'env-schema'

export default function loadConfig(): void {
  const result = require('dotenv').config({
    path: path.join(__dirname, '..', '..', '.env'),
  })

  if (result.error) {
    throw new Error(result.error)
  }

  const schema = {
    type: 'object',
    required: [
      'PORT',
      'API_HOST',
      'API_PORT',
      'DATABASE_URL',
      'REDIS_HOST',
      'REDIS_PORT',
      'REDIS_DB',
      'REDIS_PASSWORD',
      'REDIS_ACTIVE',
      'APP_JWT_SECRET',
      'AES_KEY',
      'BASE_PATH',
      'SESSION_EXPIRED_SECONDS',
      'OTP_EXPIRED_MINUTES',
      'SECURE_SESSION_SECRET',
      'WHITELISTED_ORIGIN'
    ],
    properties: {
      PORT: {
        type: 'number',
        default: 3001,
      },
      NODE_ENV: {
        type: 'string',
        enum: ['development', 'testing', 'production'],
      },
      API_HOST: {
        type: 'string',
      },
      API_PORT: {
        type: 'string',
      },
      DATABASE_URL: {
        type: 'string',
      },
      REDIS_ACTIVE: {
        type: 'string',
      },
      REDIS_HOST: {
        type: 'string',
      },
      REDIS_PORT: {
        type: 'number',
      },
      REDIS_DB: {
        type: 'number',
      },
      REDIS_PASSWORD: {
        type: 'string',
      },
      APP_JWT_SECRET: {
        type: 'string',
      },
      AES_KEY: {
        type: 'string',
      },
      BASE_PATH: {
        type: 'string',
      },
      REDIS_RECONNECT_MILISECONDS: {
        type: 'string',
      },
      SESSION_EXPIRED_SECONDS: {
        type: 'string',
      },
      OTP_EXPIRED_MINUTES: {
        type: 'string'
      },
      SECURE_SESSION_SECRET:{
        type: 'string'
      }
    },
  }

  envSchema({
    data: result.parsed,
    schema: schema,
    dotenv: true,
  })
}
