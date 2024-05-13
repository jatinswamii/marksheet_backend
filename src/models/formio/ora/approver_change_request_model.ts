import { map, includes, filter, keys } from 'lodash'
import { myDB } from '../../../utils/db/dbHelper'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { sendNotification } from '../../../models/notification/sendNotification'
import { getColumns } from '../../../helpers/formio/getColumns'
import { arrayToHtml } from '../../../utils/arrayToHtml'

const getChangedData = (obj, otrSchema) => {
  const mappedCols = map(
    filter(
      map(otrSchema, ({ field, title }) => {
        return { field, title }
      }),
      (item) => includes(keys(obj), item.field),
    ),
    (item) => {
      return {
        ...item,
        data: obj[item.field],
      }
    },
  )
  return mappedCols
}

export const list = async (params, reply) => {
  try {
    const { status } = params?.data
    const sql = `select * from cms.candidate_change_request where status='${status}';`
    let res = await myDB.sqlQry({ sql })

    const otrSchema = await getColumns('otr_form')
    res = map(res, (item) => {
      return {
        ...item,
        candidate_registrationid: item?.registrationid,
        changed_data: arrayToHtml(getChangedData(item.changed_data, otrSchema)),
        isreadonly: includes(['A', 'C', 'R'], status),
      }
    })


    return { data: res, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const get = async (params, reply) => {
  try {
    const { status, creqid } = params?.data
    const sql = `select * from cms.candidate_change_request where status='${status}' and creqid='${creqid}';`
    let res = await myDB.sqlQry({ sql })

    res = {
      ...res?.[0],
      candidate_registrationid: res?.[0]?.registrationid,
      changed_data: JSON.stringify(res?.[0].changed_data),
    }

    return { data: [res], message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const upsert = async (params, reply) => {
  try {
    const res = await myDB.update({
      table: 'cms.candidate_change_request',
      where: params.initData,
      data: {
        registrationid: params?.data?.candidate_registrationid,
        status: params.data.approved_status,
        approver_id: params?.authUser?.registrationid,
        approver_remark: params?.data['Remark'],
      },
    })
    return res
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const afterUpdate = async (params, reply) => {
  try {
    if (params?.data?.approved_status === 'A') {
      const sql = `select * from cms.candidate_master where registrationid='${params?.data?.candidate_registrationid}';`
      const candidate = await myDB.sqlQry({ sql })

      const data = JSON.parse(params?.data?.changed_data)

      delete data.sdocument

      const recpeintId = candidate?.[0]?.email

      await myDB.update({
        table: 'cms.candidate_master',
        data,
        where: { registrationid: params?.data?.candidate_registrationid },
      })

      const res = await sendNotification({
        via: 'email',
        recipients: [{ [recpeintId]: {} }],
        message: {},
        templateid: 'approved_change_request',
        commonData: {
          ...params?.data,
          candidateName: candidate?.[0]?.candidate_name,
        },
        subject: 'Change Request Status ✅ ',
        reply: reply,
      })

      return { data: res, message: 'Mail has been sent' }
    }

    if (params?.data?.approved_status === 'R') {
      const sql = `select * from cms.candidate_master where registrationid='${params?.data?.candidate_registrationid}';`
      const candidate = await myDB.sqlQry({ sql })
      const recpeintId = candidate?.[0]?.email
      const res = await sendNotification({
        via: 'email',
        recipients: [{ [recpeintId]: {} }],
        message: {},
        templateid: 'declined_change_request',
        commonData: {
          candidateName: candidate?.[0]?.candidate_name,
          ...params?.data,
        },
        subject: 'Change Request Status 🛑',
        reply: reply,
      })
      return { data: res, message: 'Mail has been sent' }
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}
