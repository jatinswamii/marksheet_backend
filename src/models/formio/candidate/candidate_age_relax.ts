import {
  groupBy,
  values,
  map,
  filter,
  flatten,
} from 'lodash'
import { handleServerError } from '../../../helpers/server/serverErrors'

import { post } from '../../../helpers/my/postQry'
import { myDB } from '../../../utils/db/dbHelper'

export const afterSchema = async (params, reply) => {

  const post_rules = await post.rules({ post_id: params?.data?.post_id })

  let hint = ''

  const age_relax = groupBy(values(post_rules), 'rule_group')

  const candidate_consent = await myDB.sqlQry({ sql: `select consent from cms.candidate_consent where registrationid='${params?.authUser?.registrationid}' and post_id='${params?.data?.post_id}'`})

  const ageRelax = map(
    filter(age_relax['agerelax'], (item) => item?.rule_id === candidate_consent?.[0]?.consent),
    (item) => {
      return {
        value: item?.rule_id,
        label: `${item?.rule_name} (${item.age_relax} years)`,
      }
    },
  )

  try {
    params['fschema'] = {
      ...params?.['fschema'],
      sections: [
        {
          columns: flatten(
            params?.['fschema']?.sections?.map((item) => {
              return item?.columns?.map((col) => {
                return {
                  ...col,
                  options: {
                    data: ageRelax,
                  },
                }
              })
            }),
          ),
        },
      ],
      hint: hint,
    }

    return params
  } catch (e) {
    handleServerError(reply, e)
  }
}
