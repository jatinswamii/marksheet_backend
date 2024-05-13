import { sendNotification } from '../models/notification/sendNotification'
import moment from 'moment'

const puppeteer = require('puppeteer')
// const fs = require('fs')
const path = require('path')

export async function printPDF(
  data: string,
  filePath: string,
  registrationid: string,
  recpeintId: string,
  reply: any,
) {
  // Create a browser instance
  let browser

  try {
    browser = await puppeteer.launch()
  } catch (e) {
    console.info(
      'Unable to launch browser mode in sandbox mode. Lauching Chrome without sandbox.',
    )
    browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  }

  // Create a new page
  const page = await browser.newPage()

  const fpath = path.join(__dirname, '../../', process.env.BASE_PATH, filePath)

  //Get HTML content from HTML file
  await page.setContent(
    `<html><body style="font-family:arial">${data}</body></html>`,
    { waitUntil: 'domcontentloaded' },
  )
  // To reflect CSS used for screens instead of print
  await page.emulateMediaType('screen')
  // Downlaod the PDF
  const pdf = await page.pdf({
    path: fpath,
    margin: { top: '50px', right: '50px', bottom: '50px', left: '50px' },
    printBackground: true,
    format: 'A4',
  })

  await sendNotification({
    via: 'email',
    recipients: [{ [recpeintId]: {} }],
    message: {},
    templateid: 'application_filled',
    subject: 'Application has been submitted',
    reply: reply,
    commonData: {
      html: data,
    },
    attachments: [
      {
        filename: `application_${moment().valueOf()}.pdf`,
        path: fpath,
        contentType: 'application/pdf',
      },
    ],
  })

  // Close the browser instance
  await browser.close()
  return 'ok'
}
