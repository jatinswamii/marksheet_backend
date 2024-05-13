import { FastifyReply } from 'fastify'

import { handleServerError } from '../helpers/server/serverErrors'
import { handleServerResponse } from '../helpers/server/serverResponse'

import { myDB } from '../utils/db/dbHelper'


export const getIFCFilter = async (request: any, reply: FastifyReply) => {
  const { post_id, module_type } = request?.body

  try {
    const sql = `select pd.module_id, pd.module_type,name,post_forms as forms,icon, 'true' as status from post_modules_data pd,post_module_master pm where pd.module_id=pm.module_id and post_id=${post_id} and post_tab=1 order by sortno`
    let rows = await myDB.sqlQry({ sql })

    handleServerResponse(reply, {
      formTabs: [
        {
          data: rows,
          formcontrols: {
            button: false,
            icon: true,
          },
        },
      ],
      message: 'ok',
    })
  } catch (e) {
    handleServerError(reply, e)
  }
}



export const getcandidateChecklist = async (request: any, reply: FastifyReply) => {
  const { post_id, module_type } = request?.body

  try {
    const sql = `select pd.module_id, pd.module_type,name,post_forms as forms,icon, 'true' as status from post_modules_data pd,post_module_master pm where pd.module_id=pm.module_id and post_id=${post_id} and post_tab=1 order by sortno`
    let rows = await myDB.sqlQry({ sql })

    handleServerResponse(reply, {
      formTabs: [
        {
          data: rows,
          formcontrols: {
            button: false,
            icon: true,
          },
        },
      ],
      message: 'ok',
    })
  } catch (e) {
    handleServerError(reply, e)
  }
}
