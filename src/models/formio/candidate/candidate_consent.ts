import {
  groupBy,
  values,
  isEmpty,
  toString,
  map,
  filter,
  concat,
  flatten,
} from 'lodash'
import { handleServerError } from '../../../helpers/server/serverErrors'

import { post } from '../../../helpers/my/postQry'
import { application } from '../../../helpers/my/applicationQry'
import { myDB } from '../../../utils/db/dbHelper'

export const afterSchema = async (params, reply) => {
  const post_rules = await post.rules({ post_id: params?.data?.post_id })

  let hint = ''
  let candidatePhRelax = []
  let candidateCommunityRelax = []

  const candidate_application = await application.details({
    post_id: params?.data?.post_id,
    registrationid: params?.authUser?.registrationid,
  })

  const age_relax = groupBy(values(post_rules), 'rule_group')

  if (
    isEmpty(toString(candidate_application?.forms?.candidate_community?.cdid))
  ) {
    hint = 'Please fill candidate community'
  } else {
    candidateCommunityRelax = map(
      filter(
        age_relax['community'],
        (item) =>
          item?.rule_id?.toLowerCase() ===
          candidate_application?.forms?.candidate_community?.community_code?.toLowerCase(),
      ),
      (item1) => {
        return {
          label: `${item1?.rule_id} (${item1?.age_relax} years)`,
          value: item1?.rule_name,
          age_relax: item1?.age_relax
        }
      },
    )
  }


  const ageRelax = map(
    filter(age_relax['agerelax'], (item) => item.age_relax > 0),
    (item) => {
      return {
        value: item?.rule_id,
        label: `${item?.rule_name} (${item.age_relax} years) including community (${candidateCommunityRelax?.[0]?.age_relax || 0} years), Total extend of age relaxation of Permissible (in years): ${item?.age_relax + (candidateCommunityRelax?.[0]?.age_relax || 0)} years`,
      }
    },
  )
  
  if (isEmpty(toString(candidate_application?.forms?.candidate_ph?.cdid))) {
    hint = 'Please fill candidate ph'
  } else {
    candidatePhRelax = [
      {
        label: `Physically Challenged (10 years) including community (${candidateCommunityRelax?.[0]?.age_relax || 0 } years), Total extend of age relaxation of Permissible (in years): ${10 + (candidateCommunityRelax?.[0]?.age_relax || 0)} years`,
        value: 'ph',
      },
    ]
  }

  try {
    params['fschema'] = {
      ...params?.['fschema'],
      sections: [
        {
          columns: flatten(
            params?.['fschema']?.sections?.map((item) => {
              return item.columns?.map((col) => {
                return {
                  ...col,
                  options: {
                    data: concat(
                      ageRelax,
                      candidatePhRelax,
                      candidateCommunityRelax,
                      [
                        {
                          label: 'None',
                          value: 'None',
                        },
                      ],
                    ),
                  },
                  readonly: isEmpty(toString(hint)) ? 0 : 1,
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


export const upsert = async(params, reply) => {
  try {
    await myDB.upsert({
      table: 'cms.candidate_consent',
      data: {
        registrationid: params?.data?.registrationid,
        consent: params?.data?.consent,
        post_id: params?.data?.post_id,
      },
      where: params.cond,
    })
  
    return []
  } catch(e){
    handleServerError(reply, e)
  }
}