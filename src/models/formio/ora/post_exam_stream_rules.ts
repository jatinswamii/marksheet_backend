import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB} from '../../../utils/db/dbHelper'
import { exitInvalidPkeys } from '../../../helpers/formio/formio.common'
import { post } from '../../../helpers/my/postQry'


export const get = async (params, reply) => {
  try {
    exitInvalidPkeys(params, reply)
    let rows = await post.exam_stream_rules({
      post_editable: 1,
      ...params?.data,
    })
    rows = await post.addReadOnly({ params: params?.data, rows, reply })
    return { data: rows, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const list = async (params, reply) => {
  try {
    let rows = await post.exam_stream_rules({
      post_editable: 1,
      active: 1,
      ...params?.data,
    })
    rows = await post.addReadOnly({ params: params?.data, rows, reply })
    return { data: rows.filter(item => item.active === 1), message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const del = async (params, reply) => {
  try {
    await myDB.update({
      table:'master_exam_stream_rule',
      data: { active: 0},
      where: {exam_stream_rule_id: params?.initData?.exam_stream_rule_id},
    })

    return { message: 'Item has been removed' }
  } catch (e) {
    handleServerError(reply, e)
  }
}
