import { myDB } from '../utils/db/dbHelper'
import { split, uniq, join } from 'lodash'
import { treeOptions } from './parentChilds'

let menuJson = (data, parentid) => {
  let node = []
  data
    .filter((n) => n.parentid === parentid)
    .forEach((n) => {
      let opt = {
        icon: n.icon,
        to: n.pageurl,
        label: n.text,
        component: n.component,
      }
      let children = menuJson(data, n.id)
      if (children.length > 0) opt['content'] = children
      node.push(opt)
    })
  return node
}

export const menuTreeOptions = async (cond = '', type = 'options') => {
  let sql = `select  m1.component,m1.icon,m1.pageurl,m1.sortno,concat(m1.parent_id,'.',menuid) as id, m1.menuid as keyid,trim(m1.title) as text, case when m1.parent_id='main' then '.' else concat((select m2.parent_id from my_menu m2 where m2.menuid=m1.parent_id),'.',m1.parent_id) end parentid from my_menu m1 where active=1 ${cond} order by m1.parent_id,m1.title`
  let rows = await myDB.sqlQry({ sql })
  let res = {}
  if (type === 'menuJson') {
    res = await menuJson(rows, '.')
  } else {
    res = await treeOptions(rows, '.')
  }

  return res
}

export const myMenulist = async (registrationid) => {
  let sql = `select menuid from my_menu where menuid in (select jsonb_array_elements_text(mymenus) from my_menu_group_permissions where group_permissionid::text=(select group_permissionid from my_users where registrationid='${registrationid}'))`
  const rows = await myDB.sqlQry({ sql })
  let menus = []
  for await (const row of rows) {
    sql = `select * from my_menu_parents('${row['menuid']}')`
    const drows = await myDB.sqlQry({ sql })
    if (drows.length > 0) {
      const _menus = split(drows[0]['path'], ',')
      menus = menus.concat(_menus)
    }
  }
  menus = uniq(menus)
  let res = {}
  if (menus.length > 0) {
    let cond = ` and menuid in ('${join(menus, "','")}')`
    res = await menuTreeOptions(cond, 'menuJson')
  }
  return res
}
