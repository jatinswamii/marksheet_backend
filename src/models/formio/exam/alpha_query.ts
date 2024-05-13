import { handleServerError } from '../../../helpers/server/serverErrors'
import { prisma } from '../../../utils/prismaClient'

export const list = async (params, reply) => {

  let res = []
  try {
    if(params?.data?.candidate_detail !== 'all') {
      res = await prisma.candidate_master.findMany({
        where: {
          [`${params?.data?.candidate_detail}`]: {
            contains: params?.data?.[params?.data?.candidate_detail],
            mode: 'insensitive',
          },
        },
      }) 
    } else {
      res = await prisma.candidate_master.findMany() 
    }

    return { data: res, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}
