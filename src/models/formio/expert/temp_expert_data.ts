import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB } from '../../../utils/db/dbHelper'

export const upsert = async (params, reply) => {
  try {
    let expertData
    expertData = {
      ...params?.data,
    }
    const step = parseInt(params?.data.step) + 1
    delete expertData['registrationid']
    delete expertData['step']


    await myDB.upsert({
      table: 'cms.temp_expert_data',
      data: expertData,
      where: { expertid: parseInt(params?.data?.expertid) },
    })
 
    const message =
      params?.formId === 'expert_declaration' &&  params?.data?.mode === 'online'
        ? 'Thanks For Giving Your Details'
        : 'Expert details has been saved'

    return {
      data: [{ ...expertData, step }],
      message,
    }
  } catch (e) {
    console.log(e)
    handleServerError(reply, e)
  }
}

export const get = async (params, reply) => {
  try {
    const data = await myDB.tableQry({
      table: `cms.temp_expert_data`,
      where: {
        expertid: parseInt(params?.data?.expertid),
      },
    })

    return data
  } catch (e) {
    handleServerError(reply, e)
  }
}
export const list = async (params, reply) => {
  try {
    const data = await myDB.tableQry({
      table: `cms.temp_expert_data`,
      where: { is_submited: 1 },
    })
    return data
  } catch (e) {
    handleServerError(reply, e)
  }
}
export const afterSchema = async (params, reply) => {
  try {
    // console.log(params)
    if (
      params?.formId === 'expert_biodata_reg' &&
      params?.data?.mode === 'online'
    ) {
      let sections = params?.fschema?.sections
      let _sections = [] as any
      for (let [k1, section] of Object.entries(sections) as any) {
        if (
          section?.sectionid === 'expert_contact_info' ||
          section?.sectionid === 'expert_info'
        ) {
          for (let [k2, column] of Object.entries(
            section?.['columns'],
          ) as any) {
            if (column?.field === 'mobile') {
              column['readonly'] = 1
            }
          }
          _sections.push(section)
        }
      }

      return {
        ...params,
        fschema: {
          ...params?.fschema,
          sections: _sections,
        },
      }
    } else {
      return params
    }
  } catch (e) {
    handleServerError(reply, e)
  }
}
