import { masters } from './mastersQry'
export const masterKeyData = async (field) => {
  try {
    let res = {}
    let md = {}
    switch (field) {
      case 'dept_code':
        md = await masters.my('department')
        break
      case 'org_code':
        md = await masters.my('organisation')
        break
      case 'subjects':
      case 'branch_code':
        md = await masters.my('subject')
        break
      case 'scoring_code':
        md = await masters.my('resultype_score')
        break
    }
    for (const [k, d] of Object.entries(md)) {
      res[k] = d['keytext']
    }
    return res
  } catch (e) {
    throw e
  }
}

