import { filter } from 'lodash'

import routes from './config/ora'
import Soaproutes5 from './config/s'
import Soaproutes from './config/soap'
import Soaproutes2 from './config/soap_write'
import Soaproutes3 from './config/soap_admin'
import Soaproutes4 from './config/soap_master'
import candidateRoutes from './config/candidate'
import gatePass from './config/gatepass'
import emedical from './config/emedical'
import ebill from './config/ebill'
import vms from './config/vms'
import exam from './config/exam'
import dairyentryadmin from './config/dairyentryadmin'
import asoadmin from './config/asoadmin'
import soadmin from './config/soadmin'
import soadminlink from './config/soadminlink'
import usadmin from './config/usadmin'
import usadminlink from './config/usadminlink'
import dsadmin from './config/dsadmin'
import jsadminlink from './config/jsadminlink'
import jsadmin from './config/jsadmin'
import asadmin from './config/asadmin'
import asadminfa from './config/asadminfa'
import courtcase from './config/courtcase'
import notification from './config/notificaton'
import alpha from './config/alpha'
import admins from './config/admins'
import shortlisthindi from './config/shortlisthindi'
// import expert from './config/expert'
import expertadmin from './config/expertadmin'
import expertpanneladmin from './config/expertadmin2'
import expertoficieradmin from './config/expertoficieradmin'
import expertseniorofficier from './config/expertseniorofficier'

import { isEqual } from 'lodash'
import ptboard from './config/ptboard'
import marksheet from './config/marksheet'
const handleCandMenu = (menu, isLocked) => {
  if (isLocked) {
    return menu
  }

  return {
    module: menu?.module,
    menu: filter(menu?.menu, (item) => !isEqual(item?.label, 'Change request')),
  }
}

export const myStaticMenu = (
  email: string,
  isLocked: boolean,
  isGuestLogin,
) => {
  let menu

  switch (email) {
    case 'gatepass@upsc.in':
      menu = gatePass
      break
    case 'e-medical@upsc.in':
      menu = emedical
      break
    case 'e-bill@upsc.in':
      menu = ebill
      break
    case 'ora@upsc.in':
      menu = routes
      break
    case 'soap-authority@upsc.in':
      menu = Soaproutes
      break
    case 'soap-approver@upsc.in':
      menu = Soaproutes2
      break
    case 'soap-admin@upsc.in':
      menu = Soaproutes3
      break

    case 'soap@upsc.in':
      menu = Soaproutes5
      break
    case 'soap-master@upsc.in':
      menu = Soaproutes4
      break
    case 'vms@upsc.in':
      menu = vms
      break
    case 'alpha@upsc.in':
      menu = alpha
      break
    case 'exam@upsc.in':
      menu = exam
      break
    case 'dairy-entryadmin@upsc.in':
      menu = dairyentryadmin
      break
    case 'asoadmin@upsc.in':
      menu = asoadmin
      break
    case 'soadmin@upsc.in':
      menu = soadmin
      break
    case 'soadminlink@upsc.in':
      menu = soadminlink
      break
    case 'usadmin@upsc.in':
      menu = usadmin
      break
    case 'usadminlink@upsc.in':
      menu = usadminlink
      break
    case 'dsadmin@upsc.in':
      menu = dsadmin
      break
    case 'jsadminlink@upsc.in':
      menu = jsadminlink
      break
    case 'jsadmin@upsc.in':
      menu = jsadmin
      break
    case 'asadmin@upsc.in':
      menu = asadmin
      break
    case 'asadminfa@upsc.in':
      menu = asadminfa
      break
    case 'court-case@upsc.in':
      menu = courtcase
      break
    case 'notification@upsc.in':
      menu = notification
      break
    case 'ptboard@upsc.in':
      menu = ptboard
      break
    case 'shortlisted-admin@upsc.in':
      menu = admins
      break
    case 'hindi@upsc.in':
      menu = shortlisthindi
      break
    case 'section-admin@upsc.in':
      menu = expertadmin
      break
    case 'section-pannel-admin@upsc.in':
      menu = expertpanneladmin
      break
    case 'officier-console@upsc.in':
      menu = expertoficieradmin
      break
    case 'marksheet@upsc.in':
      menu = marksheet
      break
    case 'senior-officier-1@upsc.in':
    case 'senior-officier-2@upsc.in':
    case 'senior-officier-3@upsc.in':
      menu = expertseniorofficier
      break
    default:
      menu = handleCandMenu(candidateRoutes, isLocked)
  }

  return menu
}
