import { has } from 'lodash'
import { myValue, utils } from '../../utils/coreUtils'

export const rowFieldMaps = (row, fields) => {
  let rc = [] as any
  for (const [field, title] of Object.entries(fields)) {
    if (has(row, field)) {
      rc.push(`${title}:${row[field]}`)
    }
  }
  return rc.join(',')
}

export const formFieldMapper = async ({ formid, row }) => {
  try {
    if (myValue.isEmpty(row)) return ''
    
    let rc = ''
    switch (formid) {
      case 'candidate_experience':
        const fields = {
          jobcapacity: 'Posts',
          org_inst_name: 'Org. Name',
          dutiesdescription: 'Duties',
          from_dt: 'From Date',
          to_dt: 'To Date',
        }
        if (!myValue.isEmpty(row['from_dt'])) row['from_dt']=utils.get_Istviewdate(row['from_dt'])
        if (!myValue.isEmpty(row['to_dt'])) row['to_dt']=utils.get_Istviewdate(row['to_dt'])
        return rowFieldMaps(row, fields)
    }
  } catch (e) {
    throw e
  }
}
