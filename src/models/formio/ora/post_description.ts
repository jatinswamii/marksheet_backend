import { handleServerError } from '../../../helpers/server/serverErrors'
import {post} from '../../../helpers/my/postQry'

export const afterGet = async (params, reply,rows) => {
  try {
    rows=await post.addReadOnly({params:params?.data,rows,reply})
    return { data: rows, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}


export const afterList = async (params, reply,rows) => {
  try {
    rows=await post.addReadOnly({params:params?.data,rows,reply})
    return { data: rows, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}
