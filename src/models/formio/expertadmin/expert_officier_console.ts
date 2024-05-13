import { formDisplayData } from '../../../helpers/formio/fromio.utils'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'

export const upsert = async (params, reply) => {
  try {
    await myDB.upsert({
      table: 'cms.temp_expert_data',
      data: { assigned_expert: params?.data?.assigned_expert },
      where: { expertid: parseInt(params?.data.mobile) },
    })

    return { data: [] }
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
    const data = await myDB.tableQry({
      table: params?.fd?.dbtable,
      where: { is_submited: 1, level_1_approval: 1, level_2_approval: 0 },
      cache: 1,
      cacheKey: `my_forms_columns:${params?.formId}`,
    })

    const a = await formDisplayData(params, data)
    return a
  } catch (e) {
    handleServerError(reply, e)
  }
}
