import { utils } from '../../../utils/coreUtils'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'
import { prisma } from '../../../utils/prismaClient'

export const getShortlistedCandidate = async (params, reply) => {
  const posts = await prisma.posts.findMany({
    where: {
      exam_year: parseInt(params?.initData?.exam_year),
      exam_id:parseInt(params?.initData?.exam_code)
    },
    select: {
      post_id: true
    }
  })



  const shortlistedCand = await prisma.applications.findMany({
    where: {
      post_id: {
        in: posts.map(item => item.post_id)
      },
      app_status: 10,
    },
    select: {
      registrationid: true,
    },
  })

  const rows = await prisma.candidate_master.findMany({
    where: {
      registrationid: {
        in: shortlistedCand.map((item) => item?.registrationid),
      },
    },
    select: {
      candidate_name: true,
      registrationid: true,
      cand_hindi: true,
    },
  })
  return rows
}
export const list = async (params, reply) => {
  try {

    const rows = await getShortlistedCandidate(params, reply)

    return { data: rows }
    
  } catch (e) {
    handleServerError(reply, e)
  }
}
