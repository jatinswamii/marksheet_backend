import { handleServerError } from '../../helpers/server/serverErrors'
import { myDB } from '../../utils/db/dbHelper'

export const expertApproved = async (params, reply) => {
  try {
    let expertData

    expertData = {
      ...params?.params,
    }

    await myDB.upsert({
      table: 'cms.temp_expert_data',
      data: expertData,
      where: { expertid: parseInt(params?.recpeintId) },
    })

    return { data: [expertData] }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const expertDelete = async (params, reply) => {
  try {
    let expertData

    expertData = {
      ...params?.params,
    }

    await myDB.delete({
      table: 'cms.temp_expert_data',
      where: { expertid: parseInt(params?.recpeintId) },
    })

    return { data: [expertData] }
  } catch (e) {
    handleServerError(reply, e)
  }
}