import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'

export const upsert = async (params, reply) => {

  console.log(params?.data)
  
  try {
    let expertData

    expertData = {
      ...params?.data,
      expertid: params?.data.mobile,
    }

    delete expertData['registrationid']

    await myDB.upsert({
      table: 'cms.temp_expert_data',
      data: expertData,
      where: { expertid: parseInt(params?.data.mobile) },
    })

    return { data: [expertData] }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const get = async (params, reply) => {
  try {
    const data = await myDB.tableQry({
      table: `cms.temp_expert_data`,
      where: {
        expertid: parseInt(params?.data?.expertid),
      },
    })
    return data
  } catch (e) {
    handleServerError(reply, e)
  }
}
export const list = async (params, reply) => {
  try {
    if (params?.formId === 'expert_admin_table_online') {
  
      const data = await myDB.tableQry({
        table: `cms.temp_expert_data`,
        where: {
          is_submited: 1,
          mode: 'online',
          level_1_approval: 1,
          level_2_approval: 1,
        },
      })
      return data
    } else if (
      params?.formId === 'expert_admin_table_offline' ||
      params?.formId === 'expert_additional_biodata' ||
      params?.formId === 'expert_admin_ta-da' ||
      params?.formId === 'expert_meeting_room' ||
      params?.formId === 'expert_alloted_beds'
    ) {
      const data = await myDB.tableQry({
        table: `cms.temp_expert_data`,
        where: {
          mode: 'offline',
          level_1_approval: 1,
          level_2_approval: 1,
          is_submited: 1,
        },
      })
      return data
    } else {
      const data = await myDB.tableQry({
        table: `cms.temp_expert_data`,
        where: { level_2_approval: 0, is_submited: 1 },
      })
      return data
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}
