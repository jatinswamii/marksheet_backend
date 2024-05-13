import { parentChilds } from '../../../helpers/parentChilds'
import { STANDARD } from '../../../config/systemConstants'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'
import { myValue,utils } from '../../../utils/coreUtils'

let makeTree = (data, parentid) => {
  let node = []
  data
    .filter((n) => n.parentid === parentid)
    .forEach((n) => {
      let opt = {
        value: n.keyid,
        label: n.text,
        // parent_keyid: n.parentid
      }
      let children = makeTree(data, n.id)
      if (children.length > 0) opt['children'] = children
      node.push(opt)
    })
  return node
}

export const select_parent_keyid = async (params, reply) => {
  try {
    const res = await parentChilds(params?.masterid, reply)

    return {
      data: res,
      message: '',
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}

export const select_pincode = async (params, reply) => {
  try {
    const { pincode } = params
    let where = ''
    if (!myValue.isEmpty(pincode)) where = ` where pincode ilike '${pincode}%'`
    const sql = `select pincode as value,concat(pincode,', ',city,', ',district,', ',state) as label from pincodes ${where} order by pincode limit 10`
    return await myDB.sqlQry({
      sql,
    })
  } catch (e) {
    handleServerError(reply, e)
  }
}
export const get_master_autoKeyID=async (masterid)=>{
  try {
    const sql=`select masterid,max(keyid::int) v,count(*) c from my_masters_data where ((keyid)~ '^\d+$') and (lower(keytext) not ilike'other' and keyid not in ('99','999','9999','99999')) and masterid='${masterid}'  group by masterid`
    const d= await myDB.sqlQry({
      sql,
    })
    if (d.length >0) {
      let v=utils.parseInt({value:d[0]['v']})
      return v+1
    }
    return 1
  } catch (e) {
    throw(e)
  }
}

export const beforeUpdate = async (params, reply) => {
  try {
    const { data:{masterid,keyid,mid,parent_keyid} } = params
    if (myValue.isEmpty(mid)) {
      if (myValue.isEmpty(keyid)) {
        const keyid=await get_master_autoKeyID(masterid) 
        params["data"]["keyid"]=keyid
      }
    }
    return params
  } catch (e) {
    handleServerError(reply, e)
  }
}


