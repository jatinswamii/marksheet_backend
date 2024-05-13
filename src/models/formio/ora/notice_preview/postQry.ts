import { post as postQry } from '../../../../helpers/my/postQry'
import { flatten, isEmpty, values } from 'lodash'
import { keydata } from '../../../../helpers/my/mastersQry'
import { formio } from '../../../../controllers'

export const postData = {
  description: async (post_id) => {
    const sql = `select * from main.post_description where post_id = '${post_id}'::Int`

    return await keydata({
      cacheKey: `post_description:${post_id}`,
      sql,
      keyid: 'post_id',
    })
  },
  modules: async (params) => {
    const sql = `select pd.module_id, pd.module_type,name,post_forms as forms,icon, 'true' as status from main.post_modules_data pd, main.post_module_master pm where pd.module_id=pm.module_id and pd.post_id='${params?.post_id}' and post_tab=1 order by sortno`
    return await keydata({
      cacheKey: `post_modules_data:${params?.post_id}`,
      sql,
      keyid: 'module_id',
    })
  },
  modules_list_data: async (params, reply) => {
    const { formId, post_id, module_id, module_type } = params
    if (!isEmpty(formId)) {
      let data = []

      for (const formid of formId) {
        const listData = await formio(
          {
            ...params,
            headers: { 'content-type': '' },
            body: {
              isInternal: true,
              action: 'list',
              formId: formid,
              data: {},
              initData: {
                post_id: post_id,
                module_id: module_id,
                module_type: module_type,
              },
            },
          },
          reply,
        )

        const schemaData = await formio(
          {
            ...params,
            headers: { 'content-type': '' },
            body: {
              isInternal: true,
              action: 'schema',
              formId: formid,
              data: {},
              initData: {
                post_id: post_id,
                module_id: module_id,
                module_type: module_type,
              },
            },
          },
          reply,
        )

        data.push({
          list: listData.data,
          schemaData: schemaData?.data?.map((item) => item.sections),
        })
      }

      return flatten(data)
    }

    return []
  },
  modules_name: async (modules, postid, reply) => {
    const mappedModules = {} as any

    for (const [key, _value] of Object.entries(modules) as any) {
      mappedModules[key] = Object.assign(
        {},
        {
          ...modules?.[key],
          list_data: await postData.modules_list_data(
            {
              formId: modules?.[key]?.forms?.split(','),
              post_id: postid,
              module_id: modules?.[key]?.module_id,
              module_type: modules?.[key]?.module_type,
            },
            reply,
          ),
        },
      )
    }

    return mappedModules
  },
  post_qlevel_experience: async (post_id) => {
    const sql = `select l.*,p.exp_year,p.exp_month from (select keyid qlevel,keytext qlevel_name from my_master('qualification_core_levels') ) l left join main.post_qlevel_experience p on (l.qlevel::INT=p.qlevel and p.post_id=${post_id}) WHERE p.exp_year IS NOT NULL`
    return await keydata({
      cacheKey: `post_qlevel_experience:${post_id}`,
      sql,
      keyid: 'qlevel',
    })
  },
  all_info: async (params, reply) => {
    const all_data = await postQry.alldata(params?.post_id)

    const post_description = await postData.description(params?.post_id)

    const post_modules = await postData.modules({
      post_id: params?.post_id,
      post_type: 'o',
    })

    const vacancy = await postQry.vacancy(params)

    all_data['post_qlevel_experience'] = await postQry.post_qlevel_experience(params)

    all_data['vacancy'] = vacancy

    all_data['post_description'] = post_description[params?.post_id]

    all_data['modules'] = values(
      await postData.modules_name(post_modules, params?.post_id, reply),
    )

    delete all_data['pm']
    delete all_data['pmd']
    delete all_data['exam_stream_rules']

    const pd = all_data

    return pd
  },
}
