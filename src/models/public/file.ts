import { fromBuffer } from 'file-type'
import { handleServerError } from '../../helpers/server/serverErrors'
import { toString } from 'lodash'

const fs = require('fs')
const path = require('path')

async function fileToBase64(filePath) {
  const fileBuffer = await fs.readFileSync(filePath)

  return fileBuffer
}

export const viewFile = async (params, reply) => {
  const fpath = path.join(
    __dirname,
    '../../../',
    process.env.BASE_PATH,
    params?.fieldValue,
  )

  const fileBuffer = await fileToBase64(fpath)

  try {
    reply
      .status(200)
      .send({ data: { file: fileBuffer, type: await fromBuffer(fileBuffer) } })
  } catch (e) {
    handleServerError(reply, e)
  }
}
