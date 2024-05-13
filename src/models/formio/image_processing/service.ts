import { round } from 'lodash'
const path = require('path')
import { extractCardDetails } from 'image-ocr'
const { fuzzy } = require('fast-fuzzy')
import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'
import moment from 'moment'

// const { spawnSync } = require('child_process')
// const fs = require('fs')
// const path = require('path')

// import { handleServerError } from '../../../helpers/server/serverErrors'

// export const ocr = async (params, reply) => {

//   try {
//     const idVarificationPath = path.resolve(__dirname, 'src/idVarification.py')

//     const pythonProcess = await spawnSync('python3', [idVarificationPath])

//     let result = pythonProcess.stdout?.toString()?.trim()
//     const error = pythonProcess.stderr?.toString()?.trim()

//     console.log(result)

//     if (result) {
//       result = {}
//       return {
//         data: result.result,
//       }
//     } else {
//       console.log(error)
//     }
//   } catch (e) {
//     handleServerError(reply, e)
//   }
// }


export const ocr = async (params, reply) => {
  try {
    const can = await myDB.sqlQry({
      sql: `select registrationid, photo_id,candidate_name, dob from cms.candidate_master where registrationid='${params?.authUser?.registrationid}'`,
    })
    // Perform OCR on the preprocessed image
    const uploadPath = path.join(
      __dirname,
      '../../../../',
      'uploads',
      can?.[0].registrationid.toString().slice(0, 2),
      can?.[0].registrationid.toString(),
      can?.[0].photo_id,
    )

    const text = await extractCardDetails(uploadPath)

    // Replace single quotes with double quotes to make it a valid JSON string
    const jsonString = text.replace(/'/g, '"')

    // Parse the JSON string into a JavaScript object
    const dataObject = JSON.parse(jsonString)

    // Extract the name from the object

    const extractedWords = {
      cand_name: dataObject.name,
      dob: dataObject.dob,
    }

    const scores = {
      candidate_name_score: round(
        fuzzy(can[0]?.candidate_name, extractedWords?.cand_name || '') * 100,
        0,
      ),
      dob_score: round(
        fuzzy(moment(can[0]?.dob).format('YYYY'), extractedWords?.dob || '') *
          100,
        0,
      ),
    }

    await myDB.upsert({
      table: 'cms.candidate_photo_id_validations',
      data: {
        registrationid: can?.[0].registrationid,
        ...scores,
      },
      where: { registrationid: can?.[0].registrationid },
    })

    return {}
  } catch (e) {
    handleServerError(reply, e)
  }
}
