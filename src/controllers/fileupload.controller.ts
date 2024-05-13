import { FastifyReply } from 'fastify'
import { has } from 'lodash'
import { fromBuffer } from 'file-type'
import { toString } from 'lodash'
import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'

const pump = util.promisify(pipeline)
const path = require('path');

import { handleServerError } from '../helpers/server/serverErrors'
import { myuuid } from '../utils/myuuid'


const allowedTypes = [
  'gif',
  'jpeg',
  'png',
  'vnd.ms-excel',
  'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'plain',
  'pdf',
  'msword',
  'vnd.openxmlformats-officedocument.wordprocessingml.document',
]

async function writeFileToFolder(fileName, folder, file) {
  if (has(file, 'data')) {
    await pump([file.data], fs.createWriteStream(`${folder}/${fileName}`))
  }
}

async function deleteFileToFolder(fileName, folder, file, reply) {
  await fs.unlink(`${folder}/${fileName}`, (e) => handleServerError(reply, e))
}

export const uploadFile = async (
  file: any,
  folderPath: string,
  field_name: string = '',
  reply: FastifyReply,
) => {
  field_name = field_name || file?.name

  // Check if the folder exists.
  const folderExists = fs.existsSync(folderPath)

  if (!folderExists) {
    fs.mkdirSync(folderPath, { recursive: true })
  }
  try {
    const fileName = `${field_name}_${myuuid(
      'abcdefghijklmnopqrstuvwxyz1234567890',
      8,
    )}.${file?.mimetype?.split('/')?.[1]}`

    try {
      // Check if the user has permission to write to the folder.
      fs.access(folderPath, fs.constants.W_OK, (err) => {
        if (err) {
        
          return
        }

        // The file exists, the folder exists, and the user has permission to write to the folder.
        // Copy the file to the folder.
        // fs.copyFileSync(fileName, folderPath + fileName)

        writeFileToFolder(fileName, folderPath, file)
      })

      return fileName
    } catch (e) {
      handleServerError(e, 'Unable to upload file')
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}



export const deleteFile = async (
  file: any,
  folderPath: string,
  field_name: string = '',
  reply: FastifyReply,
) => {
  field_name = field_name || file?.name

  // Check if the folder exists.
  const folderExists = fs.existsSync(folderPath)

  if (!folderExists) {
    fs.mkdirSync(folderPath, { recursive: true })
  }

  try {
    const fileName = `${field_name}_${myuuid(
      'abcdefghijklmnopqrstuvwxyz1234567890',
      8,
    )}.${file?.mime?.split('/')?.[1]}`

    try {
      // Check if the user has permission to write to the folder.
      fs.access(folderPath, fs.constants.W_OK, (err) => {
        if (err) {
          console.log(
            'The user does not have permission to write to the folder.',
          )
          return
        }

        // The file exists, the folder exists, and the user has permission to write to the folder.
        // Copy the file to the folder.
        // fs.copyFileSync(fileName, folderPath + fileName)

        deleteFileToFolder(fileName, folderPath, file, reply)
      })

      return fileName
    } catch (e) {
      handleServerError(e, 'Unable to upload file')
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}
