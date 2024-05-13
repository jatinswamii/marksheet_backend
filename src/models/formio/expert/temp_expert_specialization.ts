import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'
import { myuuid } from '../../../utils/myuuid'

export const upsert = async (params, reply) => {
  try {
    const expertData = {
      ...params?.data,
      cdid: params?.initData?.cdid || myuuid('123456789', 8),
    }
    const step = parseInt(params?.data.step) + 1
    delete expertData['registrationid']
    delete expertData['step']
    const rowData = await myDB.upsert({
      table: 'cms.temp_expert_specialization',
      data: expertData,
      where: { cdid: expertData?.cdid },
    })
    return { data: [Object.assign(expertData, { step: step })] }
  } catch (e) {
    handleServerError(reply, e)
  }
}
export const list = async (params, reply) => {
  try {
    const expId =
      params?.data?.mode === 'offline'
        ? params?.data?.expertid
        : params?.authUser?.registrationid

    const expertId = parseInt(expId) // Parse expertid to an integer if needed

    const data = await myDB.tableQry({
      table: `cms.temp_expert_specialization`,
      where: {
        expertid: expertId,
      },
    })

    return data
  } catch (e) {
    handleServerError(reply, e)
  }
}
export const get = async (params, reply) => {
  try {
    const data = await myDB.tableQry({
      table: `cms.temp_expert_specialization`,
      where: {
        cdid: parseInt(params?.data?.cdid),
      },
    })

    return data
  } catch (e) {
    handleServerError(reply, e)
  }
}
