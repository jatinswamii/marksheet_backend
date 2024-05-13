
import { handleServerError } from '../../../helpers/server/serverErrors'
import { myDB} from '../../../utils/db/dbHelper'


export const del = async (params, reply) => {
    try {
      await myDB.delete({
        table: params?.fd?.dbtable,
        where: params?.initData,
      })
  
      return { message: 'Item has been removed' }
    } catch (e) {
      handleServerError(reply, e)
    }
  }