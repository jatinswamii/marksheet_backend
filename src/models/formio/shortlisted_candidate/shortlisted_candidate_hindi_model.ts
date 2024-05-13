import { utils } from '../../../utils/coreUtils'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'
import { prisma } from '../../../utils/prismaClient'
import { map } from 'lodash'

export const getShortlistedCandidate = async (params, reply) => {
  const posts = await prisma.posts.findMany({
    where: {
      exam_year: parseInt(params?.initData?.exam_year),
      exam_id: parseInt(params?.initData?.exam_code),
    },
    select: {
      post_id: true,
    },
  })

  const shortlistedCand = await prisma.applications.findMany({
    where: {
      post_id: {
        in: posts.map((item) => item.post_id),
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

    return {
      data: map(rows, (item: any) => {
        return {
          ...item,
          cand_registration: item?.registrationid,
          cand_hindi: item?.cand_hindi?.candidate_name,
        }
      }),
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const get = async (params, reply) => {
  try {
    const candidate_data = (await prisma.candidate_master.findMany({
      where: {
        registrationid: params?.data?.cand_registration,
      },
      select: {
        registrationid: true,
        candidate_name: true,
        cand_hindi: true,
      },
    })) as any

    const mappedData = candidate_data.map((item) => {
      return {
        registrationid: item.registrationid.toString(),
        cand_hindi: item?.cand_hindi?.candidate_name,
        cand_registration: item.registrationid.toString(),
        candidate_name: item.candidate_name,
      }
    })

    return { data: mappedData }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const upsert = async (params, reply) => {
  try {
    await prisma.candidate_master.update({
      where: {
        registrationid: params?.data?.cand_registration,
      },
      data: {
        cand_hindi: {
          candidate_name: params?.data?.cand_hindi,
        },
      },
    })

    await myDB.insert({
      table: 'dictionary',
      data: {
        word: params?.data?.cand_hindi,
      },
    })

    return { data: 1, message: 'Data update successfully' }
  } catch (e) {
    handleServerError(reply, e)
  }
}
