import { handleServerError } from '../../../helpers/server/serverErrors'
import { prisma } from '../../../utils/prismaClient'
import { isEmpty } from 'lodash'

export const get = async (params, reply) => {
  console.log(params)
  try {
    const finalSubmitted = await prisma.temp_expert_qualification.findMany({
      where: {
        qualification: {
          in: ['phd', 'D_sc'],
        },
        expertid: params?.registrationid,
      },
      select: {
        qualification: true,
      },
    })

    return { data: { is_having_ph_dsc: isEmpty(finalSubmitted) }, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}
