import { myDB } from '../../../utils/db/dbHelper'
import { myValue, utils } from '../../../utils/coreUtils'
import { handleServerError } from '../../../helpers/server/serverErrors'
import { cmsValidate } from '../../../helpers/my/candiateBasicValidation'


export const basicValidations = async (params, reply) => {
    try {
      let {
        request: {
          authUser: { registrationid },
        },
      } = params
      //registrationid=124000000001157
      return await cmsValidate.all(registrationid)
    } catch (e) {
      handleServerError(reply, e)
    }
  }