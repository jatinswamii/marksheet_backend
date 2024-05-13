
import { myDB } from "../../../utils/db/dbHelper";
import { handleServerError } from "../../../helpers/server/serverErrors";

export const upsert = async (params, reply) => {
    try {
        // console.log(params.data, params, "email_mobile_update");

        if (params.data.edit_type === 'email') {
            // Construct data object for email update
            const emailUpdate = {
                table: "cms.candidate_master",
                data: { email: params.data.email },
                where: { email: params.data.old_email }
            };
          
            await myDB.upsert(emailUpdate);
        } else if (params.data.edit_type === 'mobile') {
            // Construct data object for mobile update
            const mobileUpdate = {
                table: "cms.candidate_master",
                data: { mobile: params.data.mobile },
                where: { mobile: params.data.old_mobile }
            };
            
            await myDB.upsert(mobileUpdate);
        } else {
            throw new Error('Invalid edit_type');
        }

        return params?.data;
    } catch (e) {
        handleServerError(reply, e);
    }
};
