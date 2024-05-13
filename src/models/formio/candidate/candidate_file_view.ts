import { toString } from 'lodash'
const fs = require('fs')
const path = require('path')

import { fromBuffer } from 'file-type'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'

async function fileToBase64(filePath) {
  const fileBuffer = await fs.readFileSync(filePath)

  return fileBuffer
}

const getModulePath = (registrationid, params) => {
  const { module } = params

  switch (module) {
    case 'ora':
      return path.join(
        __dirname,
        '../../../../',
        process.env.BASE_PATH,
        'ora',
        params?.fieldValue,
      )
    default:
      return path.join(
        __dirname,
        '../../../../',
        process.env.BASE_PATH,
        registrationid?.slice(0, 2),
        registrationid,
        params?.fieldValue,
      )
  }
}
export const get = async (params, reply) => {
  const registrationid =
    toString(params?.request?.authUser?.registrationid) || ''

  const fileBuffer = await fileToBase64(getModulePath(registrationid, params))

  try {
    reply
      .status(200)
      .send({ data: { file: fileBuffer, type: await fromBuffer(fileBuffer) } })
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
