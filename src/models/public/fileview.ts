const fs = require('fs')
const path = require('path')

import { toString } from 'lodash'
import bufferToDataUrl from "buffer-to-data-url"

import { fromBuffer } from 'file-type'
import { handleServerError } from '../../helpers/server/serverErrors'
import { myDB } from '../../utils/db/dbHelper'

async function fileToBase64(filePath) {
  const fileBuffer = await fs.readFileSync(filePath)
  return fileBuffer
}

export const get = async (params, reply) => {
  const fpath = path.join(
    __dirname,
    '../../../',
    process.env.BASE_PATH,
    params?.fieldValue,
  )

  const fileBuffer = await fileToBase64(fpath)


  const result = bufferToDataUrl("application/pdf", fileBuffer)

  try {
    reply
      .status(200)
      .send({ data: { file: fileBuffer, type: await fromBuffer(fileBuffer), fileBuffer: result  } })
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const deleteFile = async (params, reply) => {
  const registrationid = toString(params?.request?.authUser?.registrationid)

  const fpath = path.join(
    __dirname,
    '../../../../',
    process.env.BASE_PATH,
    registrationid?.slice(0, 2),
    registrationid,
    params?.fieldValue,
  )

  // todo delete module util to delete file from any db

  await myDB.update({
    table: 'cms.candidate_master',
    where: { registrationid: params?.request?.authUser.registrationid },
    data: { [params?.field]: '' },
  })

  await fs.unlink(fpath, (e) => {})

  try {
    reply.status(200).send({ data: { message: 'file is deleted' } })
  } catch (e) {
    handleServerError(reply, e)
  }
}
