import { myDB } from '../../utils/db/dbHelper'
import { myValue, utils } from '../../utils/coreUtils'
import { cms } from './candidateQry'
import { balanceQualificationLevels } from './applicationChecks'
import { post } from './postQry'
import { has, includes } from 'lodash'
import { applicationStatus } from '../../config/appConstants'

export const cmsValidate = {
  candidate_daf: async (registrationid) => {
    try {
      let rc = await cms.candidate_master(registrationid)
      if (
        myValue.isEmpty(rc?.photo_id_type) ||
        myValue.isEmpty(rc?.photo_id_no)
      ) {
        return 'Detail Profile Data is not found'
      }
      return ''
    } catch (e) {
      throw e
    }
  },
  candidate_community: async (registrationid) => {
    try {
      let rows = await cms.postLinkData({
        dbtable: 'cms.candidate_community',
        params: { registrationid },
      })
      if (rows.length === 0) return 'Community is not Found!'
      return ''
    } catch (e) {
      throw e
    }
  },
  candidate_address: async (registrationid) => {
    try {
      let rows = await cms.postLinkData({
        dbtable: 'cms.candidate_address',
        params: { registrationid },
      })
      if (rows.length === 0) return 'Address is not Found!'
      return ''
    } catch (e) {
      throw e
    }
  },
  candidate_photo_signature: async (registrationid) => {
    try {
      let rows = await cms.postLinkData({
        dbtable: 'cms.candidate_photo_signature',
        params: { registrationid },
      })
      if (rows.length === 0) return 'Profile Photo Signature is not Found!'
      return ''
    } catch (e) {
      throw e
    }
  },
  candidate_ph: async (registrationid) => {
    try {
      let rows = await cms.postLinkData({
        dbtable: 'cms.candidate_ph',
        params: { registrationid },
      })
      if (rows.length === 0) return 'Physical Disabilities confirmation!'
      return ''
    } catch (e) {
      throw e
    }
  },
  candidate_qualification: async (registrationid) => {
    try {
      let rows = await cms.candidate_qualification({ registrationid },{})
      if (rows.length === 0) return 'Qualification is not Found!'
      return await balanceQualificationLevels(rows)
    } catch (e) {
      throw e
    }
  },
  all:async(registrationid)=>{
    let data=[]
    const validations=["candidate_daf","candidate_community","candidate_ph","candidate_qualification","candidate_address","candidate_photo_signature"]
    //const pages=["candidate_daf","candidate_community","candidate_ph","candidate_qualification"]
    for (const validation of validations) {
        if (has(cmsValidate,validation)) {
            const rc=await cmsValidate[validation](registrationid)
            if (!myValue.isEmpty(rc)) {
                data.push({
                    message:rc,
                    status:'danger',
                    formid:validation
                })
            }
        }
    }
    const _data=await cmsValidate.reviseApplications(registrationid)
    data=[...data, ..._data]
    return data
  },
  reviseApplications: async (registrationid) => {
    try {
      let data=[]
      const sql = `select a.app_id,a.post_id,p.post_name from cms.applications a, main.posts p where a.post_id=p.post_id and  app_status in (${applicationStatus.revise},${applicationStatus.withdrawal}) and registrationid=${registrationid}`
      const rows = await myDB.sqlQry({ sql })
      if (rows.length >0) {
        const prows=await post.reviseablePosts({})
        const posts={}
        for(const row of prows) {
          posts[row['post_id']]=row['close_date']
        }
        for(const row of rows) {
          if (has(posts,row['post_id'])) {
            data.push({
              message:`Application ID:${row['app_id']},${row['post_name']} Note: Final Submit On/Before ${posts[row['post_id']]}!`,
              status:'danger',
              formid:`application`
            })
          }
        }
      }
      return data
    } catch (e) {
      throw e
    }
  }
}
