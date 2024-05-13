import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'
import { myuuid } from '../../../utils/myuuid'

export const upsert = async (params, reply) => {
  try {
    const data = {
      ...params?.data,
      cdid: myuuid('123456789', 6),
    }

    delete data['registrationid']

    await myDB.upsert({
      table: 'cms.temp_expert_snacks',
      data: data,
      where: { cdid: parseInt(data.cdid) },
    })

    return { data: [data] }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const list = async (params, reply) => {
  try {
    const expertId = parseInt(params?.authUser?.registrationid)
    let data
    console.log(params)
    if (params?.formId === 'expert_meeting_snacks') {
      data = await myDB.tableQry({
        table: `cms.temp_expert_snacks`,
        where: { type: params?.data?.type },
      })
    }else if (params?.formId === 'expert_meal_details') {
      data = await myDB.tableQry({
        table: `cms.temp_expert_snacks`,
        where: { type: params?.data?.type },
      })
    }

    return data
  } catch (e) {
    handleServerError(reply, e)
  }
}
export const get = async (params, reply) => {
  try {
    const data = await myDB.tableQry({
      table: `cms.temp_expert_snacks`,
      where: {
        meeting_place: params?.data?.meeting_place,
      },
    })

    return data
  } catch (e) {
    handleServerError(reply, e)
  }
}
