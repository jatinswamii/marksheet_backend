import { utils } from '../../../utils/coreUtils'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'
import { prisma } from '../../../utils/prismaClient'
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
      table: 'cms.temp_expert_research_experience',
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
      
  const expertId = parseInt(expId)
    const data = await myDB.tableQry({
      table: `cms.temp_expert_research_experience`,
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
      table: `cms.temp_expert_research_experience`,
      where: {
        cdid: parseInt(params?.data?.cdid),
      },
    })

    return data
  } catch (e) {
    handleServerError(reply, e)
  }
}
