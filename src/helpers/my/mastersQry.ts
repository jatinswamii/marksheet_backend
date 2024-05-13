import { isEmpty, has, toString, isEqual, lowerCase, includes } from 'lodash'
import { myDB } from '../../utils/db/dbHelper'
import { myValue, utils } from '../../utils/coreUtils'
import { postModule } from '../../config/appConstants'
import { redisGet, redisSet } from '../../utils/redisClient'
//Note: If vacancy for only Gen category than no relax in age/fee to any category
export const keydata = async ({ cacheKey, sql, keyid }) => {
  try {
    let data = await redisGet(cacheKey)
    if (!myValue.isNil(data)) return data
    const rows = await myDB.sqlQry({ sql })
    data = {}
    rows.forEach((row, i) => {
      data[row[keyid]] = row
    })
    await redisSet(cacheKey, data, 1)
    return data
  } catch (e) {
    throw e
  }
}
export const masters = {
  postModules: async () => {
    try {
      return await keydata({
        cacheKey: `post_module_master`,
        sql: `select pm.*,f.dbtable,f.formid,f.pkeys,f.pkeyid,f.title,f.model from main.post_module_master pm left join my_forms f on (pm.candidate_formid=f.formid)`,
        keyid: 'module_id',
      })
    } catch (e) {
      throw e
    }
  },
  postmoduleByID: async (module_id) => {
    try {
      const pm = await masters.postModules()
      if (has(pm, module_id)) return pm[module_id]
      throw `Module ID is not found [${module_id}]`
    } catch (e) {
      throw e
    }
  },
  postmoduleByName: async (module_name) => {
    try {
      if (has(postModule, module_name))
        return await masters.postmoduleByID(postModule[module_name])
      throw new Error(`Module Name is not found [${module_name}]`)
    } catch (e) {
      throw e
    }
  },
  my: async (masterid) => {
    try {
      return await keydata({
        cacheKey: `my_master:${masterid}`,
        sql: `select * from my_master('${masterid}') order by sortno`,
        keyid: 'keyid',
      })
    } catch (e) {
      throw e
    }
  },
  master_rules: async () => {
    try {
      return await keydata({
        cacheKey: `master_rules`,
        sql: `select * from master_rules`,
        keyid: 'rule_categroy',
      })
    } catch (e) {
      throw e
    }
  },
  master_exams: async () => {
    try {
      return await keydata({
        cacheKey: `master_exams`,
        sql: `select * from master_exams`,
        keyid: 'exam_id',
      })
    } catch (e) {
      throw e
    }
  },
  my_forms: async () => {
    try {
      return await keydata({
        cacheKey: `my_forms`,
        sql: `select * from my_forms`,
        keyid: 'formid',
      })
    } catch (e) {
      throw e
    }
  },
  master_exam_streams: async (exam_id) => {
    try {
      const sql=`select * from master_exam_streams where exam_id=${exam_id}`
      return await myDB.sqlQry({
        sql,
        cache:1,
        cacheKey: `master_exam_streams:${exam_id}`
      })
    } catch (e) {
      throw e
    }
  },
}
