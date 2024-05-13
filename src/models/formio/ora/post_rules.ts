import { handleServerError } from '../../../helpers/server/serverErrors'

import { exitInvalidPkeys } from '../../../helpers/formio/formio.common'
import { post } from '../../../helpers/my/postQry'
import { myDB } from '../../../utils/db/dbHelper'

export const get = async (params, reply) => {
  try {
    exitInvalidPkeys(params, reply)
    let rows = await post.rules({ post_editable: 1, ...params?.data })
    rows = await post.addReadOnly({ params: params?.data, rows, reply })
    return { data: rows, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const list = async (params, reply) => {
  try {
    let rows = await post.rules({ post_editable: 1, ...params?.data })
    rows = await post.addReadOnly({ params: params?.data, rows, reply })
    return { data: rows, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const upsert = async (params, reply) => {
  const payload = {
    rule_id: `${params?.data?.rule_group}_${params?.data?.rule_name?.toLowerCase().replace(/\s+/g, '-')}`,
    age_relax: params?.data?.age_relax,
    exp_relax: params?.data?.exp_relax,
    no_of_attempts: params?.data?.no_of_attempts,
    fee_exempt: params?.data?.fee_exempt,
    post_id: params?.data?.post_id,
  }

  const master_payload = {
    rule_id: `${params?.data?.rule_group}_${params?.data?.rule_name?.toLowerCase().replace(/\s+/g, '-')}`,
    age_relax: params?.data?.age_relax,
    exp_relax: params?.data?.exp_relax,
    no_of_attempts: params?.data?.no_of_attempts,
    fee_exempt: params?.data?.fee_exempt,
    rule_group: params?.data?.rule_group,
    rule_name: params?.data?.rule_name,
  }

  try {
    await myDB.upsert({
      table: 'master_rules',
      data: master_payload,
      where: {
        rule_id: master_payload.rule_id,
      },
    })

    const row = await myDB.upsert({
      table: params?.fd.dbtable,
      data: payload,
      where: {
        post_id: params?.initData?.post_id,
      },
    })

    return { data: row, message: 'Data upsert successfully' }
  } catch (e) {

    console.log(e)

    handleServerError(reply, e)
  }
}

export const del = async (params, reply) => {

  try {
    await myDB.delete({
      table: 'master_rules',
      where: { rule_id: params?.initData?.rule_id },
    })

    const rows = await myDB.delete({
      table: params?.fd?.dbtable,
      where: { post_id: params?.initData?.post_id },
    })

    return { data: rows, message: 'Item has been removed' }
  } catch (e) {
    handleServerError(reply, e)
  }
}
