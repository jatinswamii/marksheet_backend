const { spawn } = require('child_process')
import { trim } from 'lodash'
const path = require('path')

import { myDB } from '../../../utils/db/dbHelper'
import { handleServerError } from '../../../helpers/server/serverErrors'

function translateToHindi(text) {
  const translationPath = path.resolve(__dirname, 'translate.py')

  return new Promise((resolve, reject) => {
    const python = spawn('python3', [translationPath, text])

    let translatedText = ''
    python.stdout.on('data', (data) => {
      translatedText += data.toString()
    })

    python.stderr.on('data', (data) => {
      reject(data.toString())
    })

    python.on('close', (code) => {
      if (code === 0) {
        resolve(translatedText.trim())
      } else {
        reject(new Error(`Error running Python script (code: ${code})`))
      }
    })
  })
}

export const conversation = async (params, reply) => {
  try {
    const res = (await translateToHindi(params)) as any

    res.split(' ').forEach(async (a) => {
      setTimeout(async () => {
        await myDB.upsert({
          table: 'dictionary',
          data: {
            word: trim(a),
          },
          where: {
            word: trim(a),
          },
        })
      }, 100)
    })

    return res
  } catch (e) {
    handleServerError(reply, e)
  }
}
