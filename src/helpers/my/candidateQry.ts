import {
  intersection,
  uniq,
  has,
  lowerCase,
  includes,
  orderBy,
  filter,
} from 'lodash'
import { myDB, sqlCond, whereCond } from '../../utils/db/dbHelper'
import { myValue, utils } from '../../utils/coreUtils'
import { masters } from './mastersQry'
import { postModule } from '../../config/appConstants'

export const cms = {
  findCandidate: async(params)=>{
    try {
      let cond = ''
      cond += sqlCond({ field: 'candidate_name', params })
      cond += sqlCond({ field: 'post_id', params})
      cond += sqlCond({ field: 'registrationid', params })
      if (myValue.isEmpty(cond)) throw ("Valid input data is not found app_id/post_id/registrationid")
      cond += sqlCond({ field: 'app_status', params })
      const sql = `select * from cms.applications where '1' ${cond}`
      const rows = await myDB.sqlQry({ sql })
      return rows
    } catch (e) {
      throw e
    }
  },
  candidate_master: async (registrationid) => {
    try {
      registrationid = utils.parseInt({
        value: registrationid,
        defaultValue: 0,
      })
      let sql = `select * from cms.candidate_master c where c.registrationid=${registrationid}`
      const rows = await myDB.sqlQry({
        sql,
        cache: 60 * 60,
        cacheKey: `candidate_master:${registrationid}`,
      })
      if (rows.length === 0)
        throw new Error('candidate registrationid is not found')
      const row = rows[0]
      return row
    } catch (e) {
      throw e
    }
  },
  postLinkData: async ({
    dbtable,
    params,
    allrecords = false,
  }: {
    dbtable: string
    params: any
    allrecords?: boolean
  }) => {
    try {
      let _cond = [] as any
      let { registrationid, cdid, post_id, cond } = params
      registrationid = utils.parseInt({ value: registrationid })
      post_id = utils.parseInt({ value: post_id })
      cdid = utils.parseInt({ value: cdid })
      // can be cahed by {tablename}:cdid or registrationid
      let cacheKey = ''
      if (registrationid > 0) {
        _cond.push(`registrationid = ${registrationid}`)
        // if (post_id > 0) {
        //   cacheKey = `${dbtable}:post_id:${post_id},registrationid:${registrationid}`
        // }
      }
      if (cdid > 0) {
        _cond.push(`cdid = ${cdid}`)
      }
      if (_cond.length === 0) throw Error('registrationid/cdid is empty')

      // let data = await redisGet(cacheKey)
      // if (!myValue.isNil(data)) return data
      _cond = _cond.join(' and ')
      if (!myValue.isEmpty(cond)) {
        if (has(cond, 'registrationid')) delete cond['registrationid']
        if (has(cond, 'post_id')) delete cond['post_id']
        if (has(cond, 'cdid')) delete cond['cdid']
        cond = whereCond({params:cond})
        if (!myValue.isEmpty(cond)) _cond = `${_cond} and ${cond}`
      }

      let limit = ''
      if (!allrecords) limit = ' limit 1'
      const sql = `select *,COALESCE(linkposts@>'[${post_id}]',false) as postlinked from ${dbtable} where ${_cond} order by postlinked desc,cdid desc ${limit}`
      let rows = await myDB.sqlQry({ sql })
      if (dbtable === 'candidate_custom_forms') {
        let _rows = []
        rows.forEach(function (row, i) {
          _rows.push(JSON.parse(row['form_data']))
        })
        rows = _rows
      }
      //await redisSet(cacheKey, rows, 60 * 60)
      return rows
    } catch (e) {
      throw new Error(e)
    }
  },
  candidate_formid: async (method, params, pd) => {
    try {
      if (method in cms) {
        return await cms[method](params, pd)
      } else {
        throw 'ERROR!==============> functions Incomplete'
      }
    } catch (e) {
      throw e
    }
  },
  candidate_profile: async (params, pd) => {
    try {
      const { registrationid } = params
      return await cms.candidate_master(registrationid)
    } catch (e) {
      throw e
    }
  },
  candidate_photo_signature:async(params,pd)=>{
    let rows = await cms.postLinkData({
      dbtable: 'cms.candidate_photo_signature',
      params,
    })
    if (rows.length === 0) return {}
    return rows
  },
  candidate_community: async (params, pd) => {
    try {
      let rows = await cms.postLinkData({
        dbtable: 'cms.candidate_community',
        params,
      })
      if (rows.length === 0) return {}
      let community = rows[0]
      community['valid'] = 'Y'

      const community_code=lowerCase(community?.community_code)
      const creamy=utils.parseInt({value:community?.creamy})
      if (community_code==='obc' && creamy === 1) community['valid'] = 'N'
      
      return community
    } catch (e) {
      throw e
    }
  },
  candidate_ph: async (params, pd) => {
    try {
      const { pmd } = pd
      let rows = await cms.postLinkData({
        dbtable: 'cms.candidate_ph',
        params,
      })
      if (rows.length === 0) return {}
      let ph = rows[0]
      
      const physicallychallenged=ph?.physicallychallenged
      if (physicallychallenged==='0') return ph
      let phcategory = ph?.phcategory
      const phpercentage=utils.parseInt({value:ph?.ph_percent})
      if (myValue.isEmpty(phcategory)) return ph
      
      
      
      const phc = await masters.my('ph_category')
      phcategory=phcategory.split(',')
      //let phtypes = []
      // phcategory.forEach((id) => {
      //   phtypes.push(phc[id]?.parent_keyid)
      // })
      // ph['phtypes'] = uniq(phtypes)
      ph['valid'] = 'N'
      if (phcategory.length > 0 && phpercentage >= 40) {
        const scribe=utils.parseInt({value:ph?.scribe})
        const own_scribe=utils.parseInt({value:ph?.own_scribe})
        ph['valid'] = 'Y'
        if (!myValue.isNil(pmd)) {
          const phs =
            pmd?.[postModule.Ph]?.module_data?.pm_phsuitablities?.phsuitability
          if (Array.isArray(phs)) {
            if (!includes(phs,'all')) {
              const c = intersection(phs, phcategory)
              if (c.length === 0) ph['valid'] = 'N'
            }
          }
        }
        if (ph['valid']==='Y' && scribe===1 && own_scribe===1) {
          ph['addformrequired'] = 'candidate_ph_scribe_detail'
        }
      }
      return ph
    } catch (e) {
      throw e
    }
  },
  candidate_add_agerelax: async (params, pd,type='post') => {
    try {
      let { postrules } = pd
      if (myValue.isEmpty(postrules)) return {}
      postrules=Object.keys(postrules).map(key => (postrules[key]))
      const ageRelaxMaster = await masters.my('agerelax')
      postrules=filter(postrules, (row) => {
        const key=row?.rule_id
        if (!has(ageRelaxMaster,key)) return false
        if (type==='post') {
          if (ageRelaxMaster?.[key]?.type !== type) return false
          return utils.parseInt({value:row.age_relax}) > 0 
        }
        else {
          if (key === type) return true
        }
      })
      postrules = orderBy(postrules, ['age_relax'], ['desc'])
      
    

      for (const key in postrules) {
        const row = postrules[key]
        const age_relax = utils.parseInt({ value: row['age_relax'] })

        if (age_relax > 0) {
          let rs = await cms.postLinkData({
            dbtable: 'cms.candidate_add_agerelax',
            params: { ...params, cond: { rule_id: postrules[key]['rule_id'] } },
          })

          if (rs.length > 0) {
            rs = rs[0]
            rs['rule_category'] = key
            rs['valid'] = 'Y'
            return rs
          }
        }
      }
      return {}
    } catch (e) {
      throw e
    }
  },
  candidate_custom_form: async (params, pd, module_id) => {
    if(module_id && module_id.length > 4){
      try {
        const formid = `ifc-form-${module_id?.padStart(4, '0')}`
        let rows = await cms.postLinkData({
          dbtable: 'cms.candidate_qualifications',
          params: { ...params, cond: { formid: formid } },
        })
        if (rows.length === 0) return {}
        return rows[0]
      } catch (e) {
        throw e
      }
    }

    return {}

  },
  candidate_qualification: async (params, pd) => {
    try {
      let rows = await cms.postLinkData({
        dbtable: 'cms.candidate_qualifications',
        params,
        allrecords: true,
      })
      if (rows.length === 0) return []
      const qs = await masters.my('qual_equivalent')
      rows = rows.map((row) => {
        row['level'] = qs[row['equi_qualification']]['atype']
        return row
      })
      const { pmd } = pd
      const qm = pmd?.[postModule.Qualification]?.module_data?.pm_qualifications
      if (!myValue.isEmpty(qm)) {
        let subjects = [],qkeys = []
        qkeys = Object.keys(qm)
        qkeys.forEach((key) => {
          subjects = subjects.concat(qm[key])
        })
        subjects = uniq(subjects)
        rows = rows.filter((row) => {
          if (subjects.length > 0) return includes(subjects, row['branch_code'])
          return includes(qkeys, row['qual_code'])
        })
      }
      if (rows.length > 0) 
        rows = orderBy(rows, ['level'], ['desc'])
      return rows
    } catch (e) {
      throw e
    }
  },
  candidate_prof_registrations: async (params, pd) => {
    try {
      const { pmd } = pd
      let rows = await cms.postLinkData({
        dbtable: 'cms.candidate_experiences',
        params,
        allrecords: true,
      })
      if (rows.length === 0) return []
      const md =
            pmd?.[postModule.Prof_Registration]?.module_data?.pm_prof_registrations?.p_regs
      rows = rows.filter((row) => {
        if (md.length > 0) return includes(md, row['mc_code'])
        return false
      })
      if (rows.length === 0) return rows
    } catch (e) {
      throw e
    }
  },
  candidate_gate: async (params, pd) => {
    try {
      let rows = await cms.postLinkData({
        dbtable: 'cms.candidate_experiences',
        params,
      })
      if (rows.length === 0) return []
    } catch (e) {
      throw e
    }
  },
  application_experience: async (params, pd) => {
    try {
      const { post_id, registrationid } = params
      const { postinfo } = pd
      let sql = `select a.qid,a.foe,a.foe_other,a.koe,c.* from cms.application_experiences a,cms.candidate_experiences c where a.cdid=c.cdid and c.registrationid=${registrationid} and a.post_id=${post_id}`
      let rows = await myDB.sqlQry({
        sql,
      })
      if (rows.length === 0) return []
      rows.forEach(function (row) {
        if (utils.parseInt({ value: row['left_org'] }) === 0)
          row['to_dt'] = postinfo['calculation_date']
        if (myValue.isEmpty(row['to_dt']))
          row['to_dt'] = postinfo['calculation_date']
        else {
          if (row['to_dt'] > postinfo['calculation_date'])
            row['to_dt'] = postinfo['calculation_date']
        }
        row['days'] = utils.dateDiff(row['to_dt'], row['from_dt'], 'days')
      })
      return rows
    } catch (e) {
      throw e
    }
  },
  application_centers: async (params, pd) => {
    try {
      const { post_id, registrationid } = params
      let sql = `select * from cms.application_centers where registrationid=${registrationid} and post_id=${post_id}`
      let rows = await myDB.sqlQry({
        sql,
      })
      if (rows.length === 0) return {}
      return rows
    } catch (e) {
      throw e
    }
  },
  application_streams: async (params, pd) => {
    try {
      const { post_id, registrationid } = params
      let sql = `select * from cms.application_streams where registrationid=${registrationid} and post_id=${post_id}`
      let rows = await myDB.sqlQry({
        sql,
      })
      if (rows.length === 0) return {}
      return rows
    } catch (e) {
      throw e
    }
  },
  application_custom_data: async (params, pd) => {
    try {
      const { formid,post_id, registrationid } = params
      let sql = `select * from cms.application_custom_data where registrationid=${registrationid} and post_id=${post_id} and formid='${formid}'`
      let rows = await myDB.sqlQry({
        sql,
      })

      if (rows.length === 0) return {}
      return rows[0]?.form_data
    } catch (e) {
      throw e
    }
  },
  application_declaration: async (params, pd) => {
    try {
      return {}
      // const { post_id, registrationid } = params
      // let sql = `select * from cms.application_centers where registrationid=${registrationid} and post_id=${post_id}`
      // let rows = await myDB.sqlQry({
      //   sql,
      // })
      // if (rows.length === 0) return {}
      // return rows
    } catch (e) {
      throw e
    }
  },
  application_miscellaneous: async (params, pd) => {
    try {
      return {}
      // const { post_id, registrationid } = params
      // let sql = `select * from cms.application_centers where registrationid=${registrationid} and post_id=${post_id}`
      // let rows = await myDB.sqlQry({
      //   sql,
      // })
      // if (rows.length === 0) return {}
      // return rows
    } catch (e) {
      throw e
    }
  },
  application_payment: async (params) => {
    try {
      const { post_id, registrationid } = params
      const sql = `select * from cms.application_payment  where registrationid=${registrationid} and post_id=${post_id}`;
      const rows = await myDB.sqlQry({ sql })
      if (rows.length === 0) return false
      return rows[0]
    } catch (e) {
      throw e
    }
  },
}


