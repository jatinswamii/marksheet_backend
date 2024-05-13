import { FastifyReply } from 'fastify'
import { keys, map, filter, isEmpty, toString, isNil } from 'lodash'
import { handleServerError } from '../../helpers/server/serverErrors'
import { getFormHtml } from '../../utils/getFormHtml'

const getSchemaContent = (col) => {
  switch (col?.formid) {
    case 'candidate_profile':
      return `
      <table cellpadding="0" cellspacing="0" style="text-align:center; width:100%">
         <thead>
            <tr>
               <th  style="border:1px solid #d8e8f8;padding:4px 8px">
                 Post Name: Deputy Center Intelligence Officer
               </th>
            </tr>
            <tr>
               <th  style="border:1px solid #d8e8f8;padding:4px 8px">
               Registration id : dhpckinw
               </th>
            </tr>
         </thead>
      </table>
      <table cellpadding="0" cellspacing="0" style="text-align:center;  width:100%">
         <thead>
            <tr>
               <th style="color:#154979; ">Advertisement No.</th>
               <th style="color:#154979; ">Vacancy No.</th>
               <th style="color:#154979; ">Application No.</th>
            </tr>
         </thead>
         <tbody>
            <tr>
              <td style="border:1px solid #d8e8f8; width:33.3333%; padding:4px 8px">22/2024</td>
              <td style="border:1px solid #d8e8f8; width:33.3333%; padding:4px 8px">23112201425</td>
              <td style="border:1px solid #d8e8f8; width:33.3333%; padding:4px 8px">19916016971</td>
            </tr>
         </tbody>
      </table>`

    default:
      return col.filter(item => !isEmpty(item?.data?.toString()))
        .map(
          (colItem) => `<table cellpadding="0" cellspacing="0" style="width:100%;  font-size:0.825rem">
         <tr>
            <td style="border:1px solid #d8e8f8; border-top-width:0.5px; width:40%; padding:4px 8px"><strong>${colItem?.title}</strong></td>
            <td style="border:1px solid #d8e8f8;  border-top-width:0.5px; width:60%;  padding:4px 8px">${colItem?.data}</td>
         </tr>
         </table>`,
        )
        .join('')
  }
}

const handleColumns = (keys,data) => {
  return map(keys, (item) => {
    return {
      ...item,
      data: toString(data?.[item?.formid]?.[item?.field]),
    }
  })
}

const getLayout = (schema, data) => {
  let schemas = []

  for (const [key, value] of Object.entries(schema) as any) {
    schemas.push({
      title: value?.title,
      columns: handleColumns(value?.columns, data).sort((a, b) => a.sortno - b.sortno)
    })
  }

  return schemas
    ?.map(
      (schema) =>
        `<div style="margin-bottom:15px"><table cellpadding="5" cellspacing="0"  style="width:100%; font-size:1rem;">
      <thead>
         <tr>
            <th style="background:#154979; color:#ffffff;">${schema?.title}</th>
         </tr>
      </thead>
   </table>${getSchemaContent(schema?.columns)}</div>
   `,
    )
    .join('')
}

export const getPreviewHtml = async (params, reply: FastifyReply) => {

  try {
    return getFormHtml(getLayout(params?.schemas, params?.forms))
  } catch (e) {
    handleServerError(reply, e.toString())
  }
}