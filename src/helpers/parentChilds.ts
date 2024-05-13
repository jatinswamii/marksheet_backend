
import { handleServerError } from './server/serverErrors'
import { handleServerResponse } from './server/serverResponse'
import { myDB } from '../utils/db/dbHelper'
import { isEmpty, split, uniq, join } from 'lodash'
import { myValue } from '../utils/coreUtils'

export let treeOptions = (data, parentid) => {
  let node = []
  data
    .filter((n) => n.parentid === parentid)
    .forEach((n) => {
      let opt = {
        value: n.keyid,
        label: n.text,
        // parent_keyid: n.parentid
      }
      let children = treeOptions(data, n.id)
      if (children.length > 0) opt['children'] = children
      node.push(opt)
    })
  return node
}

export const getMastersTreeData = async (masters) => {
  try {
    masters = masters.join("','")
    if (myValue.isEmpty(masters)) throw('Masters is not found!')
    let sql = `select concat(m1.masterid,'.',m2.keyid) as id,m2.keyid,trim(m2.keytext) as text,m2.parent_keyid,CONCAT(COALESCE(m1.parent_masterid,''),'.',COALESCE(m2.parent_keyid,'')) as parentid from my_masters m1,my_masters_data m2 where m1.masterid=m2.masterid and m1.masterid in ('${masters}') order by m2.masterid,m2.sortno,trim(m2.keytext)`
    let rows = await myDB.sqlQry({ sql })
    return await treeOptions(rows, '.')
  } catch (e) {
    throw(e)
  }
}

export const parentChilds = async (masterid, reply) => {
  try {
    if (isEmpty(masterid)) handleServerResponse(reply, 'Masterid is not found!')
    let sql = `select * from my_master_parents('${masterid}')`
    let rows = await myDB.sqlQry({ sql })
    if (rows.length === 0)
      handleServerResponse(reply, 'Tree data is not found!')
    let masters = rows?.[0]?.['path'].split(',')
    masters.pop()
    const res= await getMastersTreeData(masters)
    handleServerResponse(reply, {
      data: res,
      message: '',
    })
  } catch (e) {
    handleServerError(reply, e)
  }
}


