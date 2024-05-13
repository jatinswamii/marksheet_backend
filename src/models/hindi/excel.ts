import { handleServerError } from '../../helpers/server/serverErrors'
import ExcelJS from 'exceljs'
import path from 'path'
import { sendNotification } from '../../models/notification/sendNotification'
import { getShortlistedCandidate } from '../../models/formio/shortlisted_candidate/shortlisted_candidate_model'

export const sends = async (params, reply) => {
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sheet 1')

    const rows = await getShortlistedCandidate(params, reply)

    worksheet.addRow(['OTR ID', 'Candidate Name'])

    rows.forEach((row) => {
      worksheet.addRow([row.registrationid.toString(), row.candidate_name])
    })
    const fileName = `excel_${Date.now()}.xlsx`
    const filePath = path.join(__dirname, '..', '..', 'db', fileName)
    await workbook.xlsx.writeFile(filePath)

    try {
      await sendNotification({
        via: 'email',
        recipients: [{ 'itsshobhitgoel@gmail.com': {} }],
        message: {},
        templateid: 'send_to_hindi_department',
        commonData: {},
        subject: '',
        attachments: [
          { name: 'd.xlsx', path: filePath, contentType: 'application/xlsx' },
        ],
        reply: reply,
      })
    } catch (error) {
      console.error('Error sending email:', error)
    }

    return { data: '', message: 'Mail has been sent' }
  } catch (e) {
    handleServerError(reply, e)
  }
}
