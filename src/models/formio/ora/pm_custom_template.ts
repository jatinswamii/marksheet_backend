import { myDB } from '../../../utils/db/dbHelper'
import { map } from 'lodash'
import { handleServerError } from '../../../helpers/server/serverErrors'
import {myKeyCond} from '../../../helpers/formio/formio.common'

function replaceWhitespace(text: string): string {
  const regex = /\s+/g
  return text.replace(regex, '_')
}

const handleTextField = (value, selectOptions) => {
  switch (value) {
    case 'text':
      return { type: 'string', component: 'input' }
    case 'textarea':
      return { type: 'string', component: 'textarea' }
    case 'number':
      return { type: 'number', component: 'input' }
    case 'reactselect':
    case 'select-tree':
    case 'tree-list':
    case 'typehead':
    case 'select-tree-list':
    case 'rc-tree':
    case 'rc-select-tree':
    case 'react-select-draggable':
      
      return {
        type: 'select',
        component: 'reactselect',
        options: JSON.stringify({
          data: map(selectOptions, (item) => {
            return {
              label: item,
              value: item,
            }
          }),
        }),
      }
    case 'date':
      return { type: 'date', component: 'datepicker' }
    default:
      return { type: 'string', component: 'input' }
  }
}

export const beforeUpdate = async (params, reply) => {
  try {
    let res = await myDB.tableQry({
      table: 'my_forms',
      where: params['cond'],
    })
    //Custom Formid=ifc-form-{module_id 4 digit}
    if (res.length === 0) {
      const my_forms = {
        formid: params?.data?.formid,
        title: params?.data?.formid,
        module: 'pm_custom_template',
        formview: 'table-form',
        active: 1,
        colsize: 'col-12',
        dbtable: 'candidate_custom_forms',
        model: 'candidate_custom_forms',
        pkeyid: 'cdid',
        pkeys: 'registrationid, formid',
        type: 'M',
      }
      res = await myDB.insert({
        table: 'my_forms',
        data: my_forms,
      })
    }

    // params['fd'] = {}
    params['data'] = {
      ...params['data'],
      formid: params?.data?.formid,
      field: replaceWhitespace(params['data']?.title),
      active: 1,
      colsize: 'col-12',
      sectionid: '',
      ...handleTextField(params?.data?.component, params?.data?.selectoptions),
    }

    params['cond'] = [
      { formid: params?.data?.formid },
      { field: params?.data.field },
    ]

    delete params['data']?.selectoptions
    myKeyCond(params,reply)
    return params
  } catch (e) {
    handleServerError(reply, e)
  }
}
