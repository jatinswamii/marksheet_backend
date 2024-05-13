import { FastifyReply } from 'fastify'
import { handleServerError } from '../../helpers/server/serverErrors'
import { handleServerResponse } from '../../helpers/server/serverResponse'

const path = require('path')
const svgCaptcha = require('svg-captcha')

const fontPath = path.resolve(__dirname, 'Lora-Bold.ttf')
svgCaptcha.loadFont(fontPath)

export const generate = async (request, reply: FastifyReply) => {
  try {
    const captcha = svgCaptcha.create({
      size: 6,
      ignoreChars: '0oO1iIlL',
      fontSize: 30,
      color: true,
      noise: 5,
    })

    request?.session?.set('captcha', captcha.text)
  
    return {
      data: {
        image: captcha.data,
      },
    }

  } catch (e) {
    handleServerError(reply, e)
  }
}
