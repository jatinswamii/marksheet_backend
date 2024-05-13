import { isEmpty, has, toString, isEqual, lowerCase, includes } from 'lodash'
import moment from 'moment'
import * as bcrypt from 'bcryptjs'

const sanitize = (input: string, remove: boolean = false) => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '\\"',
    "'": '\'',
    '/': '-',
  }
  const reg = /[&<>"'/]/gi
  if (remove) return input.replace(reg, (match) => '')
  else return input.replace(reg, (match) => map[match])
}

const isNil = (value) => {
  return value === undefined || value === null || lowerCase(value) === 'null'
}

export const isValidDate = (dateString) => {
  const pattern1 = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/
  const pattern2 = /\d{2}-\d{2}-\d{4}/
  if (pattern1.test(dateString)) {
    dateString = dateString.split('/').reverse().join('-')
  } else if (pattern2.test(dateString)) {
    dateString = dateString.split('-').reverse().join('-')
  }
  const date = new Date(dateString)
  if (toString(date) === 'Invalid Date') return false
  return dateString
}

export const myValue = {
  isNil: (value) => {
    return isNil(value)
  },
  isEmpty: (value) => {
    const rc = isNil(value)
    if (rc) return rc
    if (Array.isArray(value)) return value.length===0
    if (typeof value ===  'object') return Object.keys(value).length==0
    return toString(value) === ''
  },
  toLower: (value)=>{
    if (myValue.isEmpty(value)) return ''
    return value.toLowerCase()
  },
  sqlSafe: (input) => {
    if (typeof input === 'string') {
      input=input.replace(/\'/g, '\'\'')
      input=input.replace(/\;/g, '')
      return input
    }
    return input
  },
  isMultiPart: (request) =>
    includes(request.headers['content-type'], 'multipart/form-data'),
  isJSON: (data: string) => {
    try {
      JSON.parse(data)
    } catch (e) {
      return false
    }
    return true
  },
}
export const utils = {
  ip2int: (ip) =>{
    return (
      ip.split(".").reduce(function(ipInt, octet) {
        return (ipInt << 8) + parseInt(octet, 10);
      }, 0) >>> 0
    );
  },
  int2ip:(ipInt) => {
    return (
      (ipInt >>> 24) +
      "." +
      ((ipInt >> 16) & 255) +
      "." +
      ((ipInt >> 8) & 255) +
      "." +
      (ipInt & 255)
    );
  },
  parseInt:({ value, defaultValue=0 })=> {
    const num = parseInt(value);
    return isNaN(num) ? defaultValue : value;
  },
  parsefloat:({ value, defaultValue=0 })=> {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  },
  leftZeroPad : (num, places) => String(num).padStart(places, '0'),
  isValidIsoDate: (dateString) => {
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(dateString))
      return false
    const d = new Date(dateString)
    return (
      d instanceof Date && !isNaN(d.getTime()) && d.toISOString() === dateString
    ) // valid date
  },
  getValidDate: (dateString) => {
    const pattern1 = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/
    const pattern2 = /\d{2}-\d{2}-\d{4}/

    if (pattern1.test(dateString)) {
      dateString = dateString.split('/').reverse().join('-')
    } else if (pattern2.test(dateString)) {
      dateString = dateString.split('-').reverse().join('-')
    }
    const date = new Date(dateString)

    if (toString(date) === 'Invalid Date') return null

    return dateString
  },
  getIsoDatetime: (dateString) => {
    const pattern1 = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/
    const pattern2 = /\d{2}-\d{2}-\d{4}/
    if (pattern1.test(dateString)) {
      dateString = dateString.split('/').reverse().join('-')
    } else if (pattern2.test(dateString)) {
      dateString = dateString.split('-').reverse().join('-')
    }
    const date = new Date(dateString)

    if (toString(date) === 'Invalid Date') return new Date(0)
    return date
  },
  getTime: () => {
    const date = new Date()
    const time = date.getTime()
    return time
  },
  genSalt: (saltRounds, value) => {
    return new Promise((resolve, reject) => {
      const salt = bcrypt.genSaltSync(saltRounds)
      bcrypt.hash(value, salt, (err, hash) => {
        if (err) reject(err)
        resolve(hash)
      })
    })
  },
  compareHash: (value, hash) => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(value, hash, (err, result): boolean | any => {
        if (err) reject(err)
        resolve(result)
      })
    })
  },
  get_validVia: (recipientId) => {
    const email =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi
    
  if (email.test(recipientId)) return 'email'
    const mobile = /^[1-9]\d{9}$/gi
    if (mobile.test(recipientId)) return 'mobile'
    return ''
  },
  moment_CurrentTime:({
    type = 'datetime',
    offsetInSec = 0,
  }: {
    type?: string
    offsetInSec?: number
  })=>{
    const m=moment().utcOffset('+05:30').add(offsetInSec, 'seconds')
    if (type === 'date') return m.format('YYYY-MM-DD')
    return m.format('YYYY-MM-DD HH:mm:ss')
  },
  get_currentdatetime: ({
    type = 'datetime',
    offsetInSec = 0,
  }: {
    type?: string
    offsetInSec?: number
  }) => {
    const date = new Date()
    let offset =
      date.getTimezoneOffset() === 0 ? 0 : -1 * date.getTimezoneOffset()
    offset = offset + offsetInSec
    let normalized = new Date(date.getTime() + offset * 60000)
    let indiaTime = new Date(
      normalized.toLocaleString('en-US', { timeZone: 'Asia/Calcutta' }),
    )
    if (type === 'date') return indiaTime.toISOString().substring(0, 10)
    return indiaTime.toISOString()
  },
  get_Istviewdate: (postgresdt,type = 'date')=> {
    if (type==='datetime') {
      return moment(postgresdt).format('DD/MM/YYYY HH:MM:SS')
    }
    else {
      return moment(postgresdt).format('DD/MM/YYYY')
    }

  },
  dateDiff:(date1,date2,type='years')=>{
    date1 = moment(date1);
    date2 = moment(date2);
    return date1.diff(date2, type) 
  },
  formDataToJSON: (params) => {
    let payload = {}
    if (params['data']) {
      for (const [key, value] of Object.entries(JSON.parse(params['data']))) {
        let mappedVal = value
        if (myValue.isEmpty(mappedVal)) {
          mappedVal = params[key]
          delete params[key]
        }

        payload = Object.assign(payload, { [key]: mappedVal })
      }
      params['data'] = payload
    }

    return params
  },
  Json1matched: ({ json1, json2 }: { json1: {}; json2: {} }) => {
    const typeObject = function (o) {
      return typeof o === 'object'
    }
    for (const [key, value] of Object.entries(json1)) {
      let v1 = typeObject(value)
        ? JSON.stringify(value)
        : toString(value).trim()
      if (!has(json2, key)) {
        return false
      }
      let v2 = json2[key]
      v2 = typeObject(v2) ? JSON.stringify(v2) : toString(v2).trim()
      if (myValue.isEmpty(v1) && myValue.isEmpty(v2)) continue
      if (`${v1}` !== `${v2}`) {
        if (
          !key.toLowerCase().includes('time') &&
          (key.toLowerCase().includes('date') ||
            key.toLowerCase().includes('dt'))
        ) {
          // only Date or Dt fields
          if (v1 === v2.substring(1, 11)) continue
        }
        return false
      }
    }
    return true
  },
  jsonOneLevelDiff:({old_obj, new_obj,fieldsattr={}})=> {
    const diff = {};
    if (Object.keys(old_obj).length >0) {
      for (const key in new_obj) {
        const nvalue=new_obj[key]
        if (has(old_obj,key)) {
          let ovalue=old_obj[key]
          if (myValue.isEmpty(ovalue) && myValue.isEmpty(nvalue)) continue
          let fType=''
          if (has(fieldsattr,key)) fType=fieldsattr[key]
          else {
            if (typeof ovalue==='object') fType='Json'
            else {
              let _key=key.toLowerCase()
              if (_key.includes('_date')) {
                fType='Date'
              }
              if (_key.includes('_dt')) {
                fType='Date'
              }
            }
          }

          switch (fType) {
            case 'Json':
            case 'JsonB':
              if (JSON.stringify(ovalue)=== nvalue) continue
              break
            case 'Date':
              if (Date.parse(ovalue)===Date.parse(nvalue)) continue
              break
              
            case 'DateTime':
              if (Date.parse(ovalue?.toISOString().slice(0, -1))===Date.parse(nvalue)) continue
              break
            default:
              if (isEqual(toString(ovalue),toString(nvalue))) continue
          }
          diff[key]=ovalue
        }
      }
    }
    return diff
  },
  concatNameAndNo: (name: string, no: string): string => {
    const formattedName = name.padEnd(4, '0')?.toUpperCase(); // Pad right with zeros to ensure 4 characters
    return formattedName.substring(0, 4) + no; // Take first 4 characters and concatenate with no
  }
}

export const converters= {
  secondsToHms : (d) =>{
    d = parseInt(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60);
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay; 
  }
}

export const getSqlTableCachekey=(query)=> {
  const tokens = query.split(" ")
  const tableNames = []
  let flag=false
  for (let token of tokens) {
    token=token.toLowerCase()
    if (["where","order","join","group","limit"].includes(token)) break
    if (token.toLowerCase() ==="from") {
      flag=true
      continue
    }
    if (myValue.isEmpty(token)) continue
    if (flag) tableNames.push(token)
  }
  if (tableNames.length >1 || tableNames.length===0) return ""
  
  let table=tableNames[0]
  if (table.indexOf("my_master('") >-1) {
    table=table.split("my_master('")
    table=table[1].split("')")[0]
    table=`my_masters_data:${table}`
  }
  else {
    table=''
  }
  return table
}