import {
  lowerCase,
  includes,
  has,
  uniq,
  orderBy,
  toString,
  map,
  isEmpty,
  intersection,
  isEqual,
  keys,
} from 'lodash'
import moment from 'moment'
import { values, filter, uniqBy } from 'lodash'
import { myDB } from '../../utils/db/dbHelper'
import { myValue, utils } from '../../utils/coreUtils'
import { masters } from './mastersQry'
import { cms } from './candidateQry'
import { applicationStatus } from '../../config/appConstants'

export const applicationChecks = {
  jobcategories: async (params, pd) => {
    try {
      const {
        vacancy,
        forms: { candidate_community, candidate_ph, candidate_profile },
      } = pd
      let categories = []
      if (Object.keys(vacancy).length === 0) return categories
      let jobs = {}
      Object.keys(vacancy).forEach((community) => {
        const _vacancy = vacancy[community]
        let v = utils.parseInt({ value: _vacancy?.vacancy })
        if (v > 0) jobs[community] = []
        const g_vacancy = utils.parseInt({ value: _vacancy?.g_vacancy })
        if (v === g_vacancy) {
          for (let g of ['m', 'f', 'o']) {
            v = utils.parseInt({ value: _vacancy[`vacancy_${g}`] })
            if (v > 0) jobs[community].push(g)
          }
        }
      })
      const gender = myValue.toLower(candidate_profile?.gender)
      let _categories = ['gen']
      if (!myValue.isEmpty(candidate_community?.community_code)) {
        _categories.push(myValue.toLower(candidate_community?.community_code))
      }
      if (candidate_ph?.valid === 'Y') _categories.push('ph')

      for (let category of _categories) {
        if (has(jobs, category)) {
          const genders = jobs[category]
          if (genders.length > 0) {
            if (includes(genders, gender)) categories.push(category)
          } else {
            categories.push(category)
          }
        }
      }
      return uniq(categories)
    } catch (e) {
      throw e
    }
  },
  rules: async (params, pd) => {
    try {
      const {
        vacancy,
        jobcategories,
        forms: {
          candidate_community,
          candidate_ph,
          candidate_add_agerelax,
          candidate_profile,
        },
        postrules,
      } = pd

      const rule_groups = await masters.my('rule_groups')

      let rules = {}
      const withoutVacancy = Object.keys(vacancy).length === 0

      for (let group in rule_groups) {
        let rule_id = ''
        switch (group) {
          case 'community':
            if (candidate_community?.valid === 'Y') {
              const _category = myValue.toLower(
                candidate_community?.community_code,
              )
              if (includes(jobcategories, _category) || withoutVacancy) {
                rule_id = _category
              }
            }
            break
          case 'ph':
            if (candidate_ph?.valid === 'Y') {
              const _category = 'ph'
              if (includes(jobcategories, _category) || withoutVacancy) {
                rule_id = _category
              }
            }
            break
          case 'agerelax':
            if (candidate_add_agerelax?.valid === 'Y')
              rule_id = candidate_add_agerelax?.rule_id
            break
          case 'gender':
            if (myValue.toLower(candidate_profile.gender) === 'f') {
              rule_id = 'f'
            }
            break
        }

        if (has(postrules, rule_id)) {
          rules[rule_id] = postrules[rule_id]
        }
      }

      return rules
    } catch (e) {
      throw e
    }
  },
  profile: (params, pd) => {
    try {
      const {
        forms: { candidate_profile: cd },
      } = pd
      if (
        myValue.isEmpty(cd?.photo_id_type) ||
        myValue.isEmpty(cd?.photo_id_no)
      ) {
        return { status: 'Detail Profile is not filled!' }
      }
      return { status: 'ok' }
    } catch (e) {
      throw e
    }
  },
  vacancy: (params, pd) => {
    const {
      vacancy,
      jobcategories,
      forms: { candidate_community, candidate_ph },
    } = pd
    if (Object.keys(vacancy).length === 0) return { status: 'ok' }
    if (jobcategories.length > 0) {
      return { status: 'ok' }
    }
    return { status: 'This vacancy is not allowed for you!' }
  },
  age: (params, pd) => {
    try {
      const {
        rules,
        forms: { candidate_profile, candidate_ph, candidate_community },
        postinfo,
        postrules: {
          ph: { age_relax: phAgeRelax },
        },
        exam_stream_rules,
      } = pd

      let min_age = utils.parseInt({ value: postinfo['age_min_gen'] })
      let max_age = utils.parseInt({ value: postinfo['age_max_gen'] })

      const min_age_value =
        postinfo?.post_type === 'o'
          ? postinfo?.age_min_gen
          : Object.values(exam_stream_rules)?.[0]?.['age_min_gen']
      const max_age_value =
        postinfo?.post_type === 'o'
          ? postinfo?.age_max_gen
          : Object.values(exam_stream_rules)?.[0]?.['age_max_gen']

      min_age = utils.parseInt({
        value: min_age_value || 0,
      })
      max_age = utils.parseInt({
        value: max_age_value || 0,
      })

      let { age_relax, age_messages } = totalAgeRelax(
        rules,
        pd?.forms?.candidate_consent,
      )

      if (age_messages !== '')
        age_messages = `[${max_age} + Age Relax ${age_messages}]`

      const dob = moment(candidate_profile['dob']).format('YYYY-MM-DD')

      const min_dt = moment(postinfo['calculation_date'])
        .subtract(min_age, 'years')
        .format('YYYY-MM-DD')

      const max_dt = moment(postinfo['calculation_date'])
        .subtract(max_age + age_relax, 'years')
        .format('YYYY-MM-DD')

      const min_dt_exc = moment(postinfo['calculation_date'])
        .subtract(min_age, 'years')
        .subtract(1, 'day')
        .format('YYYY-MM-DD')

      const max_dt_exc = moment(postinfo['calculation_date'])
        .subtract(max_age + age_relax, 'years')
        .format('YYYY-MM-DD')

      let status = 'ok'

      if (dob > min_dt || dob < max_dt_exc)
        status = `DOB Date: ${moment(dob).format(
          'DD/MM/YYYY',
        )} should be in between [${moment(min_dt).format(
          'DD/MM/YYYY',
        )}] and [${moment(max_dt).format('DD/MM/YYYY')}]`

      const message = `Your DOB: ${moment(dob).format(
        'DD/MM/YYYY',
      )},  [${moment(min_dt).format('DD MMMM YYYY')} - ${moment(
        max_dt_exc,
      ).format('DD MMMM YYYY')}] ${age_messages}`
      return {
        status,
        message,
      }
    } catch (e) {
      throw e
    }
  },
  fee: (params, pd) => {
    const {
      forms: {
        candidate_profile,
        candidate_community,
        application_payment,
        candidate_ph,
      },
    } = pd

    const belong_to_jco_sanik_school =
      pd.forms[`exam_custom_${pd?.['post_exam_info']?.exam_code}`]
        ?.belong_to_jco_sanik_school
    const attend_sanik_school =
      pd.forms[`exam_custom_${pd?.['post_exam_info']?.exam_code}`]
        ?.attend_sanik_school

    if (
      candidate_profile?.gender === 'F' ||
      includes(['SC', 'ST'], candidate_community?.community_code) ||
      (candidate_community?.community_code === 'OBC' &&
        candidate_community?.creamy === '0') ||
      belong_to_jco_sanik_school === 'Y' ||
      attend_sanik_school === 'Y' ||
      candidate_ph?.ph_percent_type === '1'
    ) {
      return {
        status: 'ok',
        fee: 0,
        message: 'You are not required to pay a fee',
      }
    }

    try {
      return {
        status: 'ok',
        fee: 1,
        message: !isEmpty(application_payment?.transaction_id?.toString())
          ? 'Fee paid'
          : 'You have to pay Fee!',
      }
    } catch (e) {
      throw e
    }
  },
  examAttempts: async (params, pd) => {
    try {
      const { registrationid } = params
      const {
        rules,
        postinfo,
        forms: { candidate_profile: cp },
      } = pd

      let attempts = 0
      // Candidate_master Add Unique
      //candidate_name, father_name, dob, mother_name, class_x_roll_no
      if (postinfo.post_type === 's') {
        let cond = ` lower(candidate_name) ='${myValue.toLower(
          cp?.candidate_name,
        )}'  and dob = '${moment(cp?.dob).format('YYYY-MM-DD')}'`
        let father_name = myValue.toLower(cp?.father_name)
        let mother_name = myValue.toLower(cp?.mother_name)
        switch (myValue.toLower(cp?.single_parent)) {
          case 'm':
            father_name = ''
            break
          case 'f':
            mother_name = ''
            break
        }
        const exam_post_qry = `(select * from main.posts  where exam_id=${postinfo.exam_id})`
        cond = ` ${cond} and lower(COALESCE(father_name,'')) ='${father_name}' and lower(COALESCE(mother_name,'')) ='${mother_name}'`
        const candidate_same_name_qry = `select registrationid from cms.candidate_master where ${cond}`
        const exam_applications = `select post_id from cms.applications where registrationid in (${candidate_same_name_qry}) and app_status >=${applicationStatus.examAttended}`
        const sql = `select count(*) attempts from ${exam_post_qry} p where p.post_id in (${exam_applications})`
        const rs = await myDB.sqlQry({ sql })
        if (rs.length > 0)
          attempts = utils.parseInt({ value: rs[0]['attempts'] })
        let limit = utils.parseInt({ value: postinfo?.no_of_attempts })
        if (limit > 0) {
          let add_value = 0
          for (let key in rules) {
            const rule = rules[key]
            const value = utils.parseInt({ value: rule?.no_of_attempts })
            if (value > add_value) add_value = value
          }
          limit += add_value
          if (limit < attempts) {
            return {
              status: `No. of Attempts exceed! Attempts:${attempts} Limit:${limit}`,
              attempts,
            }
          }
        }
      }
      return {
        status: `ok`,
        message: `No of Attempts: ${attempts}`,
      }
    } catch (e) {
      throw e
    }
  },
  experience: async (params, pd) => {
    try {
      const {
        forms: { application_experience },
        postinfo,
      } = pd
      if (myValue.isEmpty(application_experience)) return []
      if (application_experience.length === 0) {
        return {
          status: 'Your Experience is not as per required!',
        }
      }
      let _totaldays = application_experience.reduce(
        (sum, exp) => sum + exp.days,
        0,
      )
      let totalmonths = (_totaldays / 365) * 12
      _totaldays = _totaldays % 365
      totalmonths += _totaldays / 30
      totalmonths = utils.parseInt({ value: totalmonths })
      let exp_months = utils.parseInt({ value: postinfo['exp_year'] }) * 12
      exp_months += utils.parseInt({ value: postinfo['exp_month'] })

      if (has(pd, 'post_qlevel_experience')) {
        const pqlExp = pd['post_qlevel_experience']
        const { candidate_qualification } = pd
        if (candidate_qualification?.length > 0) {
          //top level education
          let qlevel = candidate_qualification['level']
          const _levels = Object.keys(pqlExp).find((key) => key <= qlevel)
          if (_levels.length > 0) {
            qlevel = _levels[0]
            exp_months =
              utils.parseInt({ value: pqlExp[qlevel]['exp_year'] }) * 12
            exp_months += utils.parseInt({ value: pqlExp[qlevel]['exp_month'] })
          }
        }
      }
      if (totalmonths < exp_months) {
        return {
          status: `Your total job related experience [${totalmonths}] months is short, Minimum [${exp_months}] months required !`,
        }
      }
      return {
        status: 'ok',
      }
    } catch (e) {
      throw e
    }
  },
  qualification: async (params, pd) => {
    try {
      const {
        forms: { candidate_qualification },
        exam_stream_rules,
      } = pd
      let message = ''
      if (candidate_qualification.length === 0) {
        return {
          status: 'Your Qualification is not as per required!',
        }
      }
      const candidateSubjects = map(
        candidate_qualification,
        ({ branch_code }) => branch_code,
      )

      const postSubjects = exam_stream_rules?.subject

      const rc = await balanceQualificationLevels(candidate_qualification)

      const isCandEligible = isEmpty(
        intersection(candidateSubjects, postSubjects),
      )

      if (isCandEligible) {
        message = 'Qualification not matched'
      }
      return { status: 'ok' }
    } catch (e) {
      throw e
    }
  },
  soap_validations: async (params, pd) => {
    try {
      const {
        forms: {
          candidate_qualification: cq,
          candidate_profile: cp,
          candidate_ph,
          candidate_community,
          candidate_consent,
        },
        postinfo,
        rules,
        exam_stream_rules,
        postrules: {
          ph: { age_relax: phAgeRelax },
        },
      } = pd
      let messages = []
      let streams_allowed = []
      let streams_errors = []
      let streams_title = []
      let { age_relax, age_messages } = totalAgeRelax(rules, candidate_consent)
      const dob = moment(cp['dob']).format('YYYY-MM-DD')
      const debug = false
      for (let keyid in exam_stream_rules) {
        const ds = exam_stream_rules[keyid]
        const exam_stream_id = ds?.exam_stream_id

        if (includes(streams_allowed, exam_stream_id)) continue

        // check marital status
        const maritals = ['s', 'm']
        if (includes(maritals, myValue.toLower(ds?.marital))) {
          if (myValue.toLower(cp?.marital) !== myValue.toLower(ds?.marital))
            messages.push(
              '<li>Please check maritial criteria in concern exam / exam streams notification</li>',
            )
        }
        // check certificate
        if (ds?.additionaltype.trim() !== '') {
          const atype = myValue.toLower(ds?.additionaltype)
          switch (atype) {
            case 'cpl':
            case 'dmo':
            case 'gsi':
            case 'cgwb':
              const rule_id = `agerelax_${atype}`
              const cd = cms.candidate_add_agerelax(params, pd, rule_id) as any
              if (cd?.valid !== 'Y') continue
              age_relax += utils.parseInt({ value: cd?.age_relax })
              break
          }
        }
        // age validation
        let min_age = utils.parsefloat({ value: ds?.age_min_gen })
        let max_age = utils.parsefloat({ value: ds?.age_max_gen })

        min_age = utils.parseInt({
          value: exam_stream_rules?.['12']?.['age_min_gen'] || 0,
        })
        max_age = utils.parseInt({
          value: exam_stream_rules?.['12']?.['age_max_gen'] || 0,
        })
        if (min_age > 0 && max_age > 0) {
          const min_dt = moment(postinfo['calculation_date'])
            .subtract(min_age, 'years')
            .format('YYYY-MM-DD')
          const max_dt = moment(postinfo['calculation_date'])
            .subtract(max_age + age_relax, 'years')
            .format('YYYY-MM-DD')
          if (dob > min_dt || dob < max_dt) {
            messages.push(
              '<li>Please select age as per concern exam notification</li>',
            )
          }
          if (debug)
            console.log(
              `Exam Rule ID:${ds?.exam_stream},ageRelax:${age_relax},minAge=${min_age},maxAge=${max_age},${max_dt} < DOB@${dob} <${min_dt}`,
            )
        }
        // const rc = await balanceQualificationLevels(cq)
        // if (!myValue.isEmpty(rc)) {
        //   messages.push(rc)
        // }

        const qL = utils.parseInt({ value: ds?.qualification_core_level })
        const eQ = ds?.eq_qual_codes
        const qS = ds?.subjects

        const cqL = cq.map((item) => item?.level)

        const hasEqualOrHigherQualification = cqL.some((value) => {
          // Convert numeric values before comparison
          const numericValue = parseInt(value, 10)
          return !isNaN(numericValue) && numericValue >= qL
        })

        // check qualification level
        //console.log("-------->",cq,qL,eQ,qS)
        const q = cq.filter((q) => {
          if (debug) console.log('-------->Q', q)
          let pass_qL = true,
            pass_eQ = true,
            pass_qS = true
          if (utils.parseInt({ value: q?.level }) < qL) pass_qL = false
          if (Array.isArray(eQ)) {
            if (eQ.length > 0) {
              if (debug) console.log('-------->eQ', eQ)
              const _tc = utils
                .parseInt({ value: q?.equi_qualification })
                .toString()
              pass_eQ = includes(eQ, _tc)
            }
          }
          if (Array.isArray(qS)) {
            if (qS.length > 0) {
              if (debug) console.log('-------->qS', qS)
              const _tc = utils.parseInt({ value: q?.branch_code }).toString()
              pass_qS = includes(qS, _tc)
            }
          }
          if (debug)
            console.log(
              `Qualification Level=${pass_qL},pass_eQ=${pass_eQ},pass_qS=${pass_qS}`,
            )
          return pass_qL && pass_eQ && pass_qS
        })

        if (q.length === 0 && !hasEqualOrHigherQualification) {
          messages.push(
            '<li>Please check qualification as per concern exam notification</li>',
          )
        }

        if (messages.length === 0) {
          streams_allowed.push(exam_stream_id)
          streams_title.push(ds?.exam_stream)
        } else {
          messages = uniq(messages)

          streams_errors.push({
            id: ds?.exam_stream,
            message: `Unmatched for ${ds?.exam_stream} : <ul>${messages.join('')}</ul>`,
          })
        }
      }

      const community_exluded_streams = uniq(
        map(values(exam_stream_rules), (item) => item.excluded_community),
      )
      const ph_excluded_streams = uniq(
        map(values(exam_stream_rules), (item) => item.is_ph_allowed),
      )

      const gender_streams = uniq(
        map(values(exam_stream_rules), (item) => item.gender),
      )

      if (
        !includes(gender_streams, cp?.gender) &&
        !includes(gender_streams, 'A')
      ) {
        streams_errors.push({
          id: 'gender_error',
          message: `<li>Please select gender as per concern exam notification</li>`,
        })
      }

      if (
        includes(community_exluded_streams, candidate_community?.community_code)
      ) {
        streams_errors.push({
          id: 'community_error',
          message: `<li>Please select community as per concern exam notification</li>`,
        })
      }

      if (
        ph_excluded_streams?.[0] === '0' &&
        candidate_ph?.physicallychallenged === '1'
      ) {
        streams_errors.push({
          id: 'ph_error',
          message: `<li>PH is not allowed as per concern exam notification</li>`,
        })
      }

      streams_errors = uniqBy(streams_errors, 'id')
      let finalstatus = {}
      if (streams_allowed.length > 0 && streams_errors.length === 0) {
        finalstatus['status'] = 'ok'
        const eligibleStreams = uniqBy(
          filter(values(exam_stream_rules), (item) => {
            return (
              includes(
                item?.eq_qual_codes,
                cq?.[0]?.equi_qualification?.toString(),
              ) && item?.marital === cp?.marital
            )
          }),
          'exam_stream_id',
        )

        if (eligibleStreams.length > 0) {
          let message = `Allowed: ${eligibleStreams.map((item) => item?.exam_stream).join(',')}`
          finalstatus['message'] = message
          finalstatus['streams'] = streams_allowed
        }
        if (streams_errors.length > 0) {
          finalstatus['status'] = 'Qualification unmatched'
          finalstatus['streams'] = streams_allowed
        }
      } else {
        finalstatus['status'] =
          `<ul>${map(streams_errors, (item) => item.message).join('')}</li>`
        finalstatus['message'] = 'You are not allowed due to above conditions'
      }
      if (!myValue.isEmpty(age_messages)) {
        finalstatus['message'] =
          `${!isEmpty(finalstatus['message']) ? finalstatus['message'] : ''}; Age Relax:${age_messages}`
      }
      return finalstatus
    } catch (e) {
      throw e
    }
  },
}

export const totalAgeRelax = (rules, consent_data) => {
  let age_relax = 0,
    age_messages = [] as any

  for (let key in rules) {
    if (
      !includes(['None'], consent_data?.consent) ||
      (rules?.[key]?.rules_exception !== 1 &&
        consent_data?.consent?.toLowerCase() ===
          rules?.[key]?.rule_name?.toLowerCase())
    ) {
      if (consent_data?.consent !== 'ph') {
        delete rules['ph']
      }

      if (
        (!isEqual(key, 'ph') && consent_data?.consent === 'ph') ||
        (includes(key, 'agerelax') &&
          !includes(consent_data?.consent, 'agerelax'))
      ) {
        const ageRelaxKeys = filter(keys(rules), (item) =>
          item.includes('agerelax'),
        )
        ageRelaxKeys.forEach((age_key) => {
          delete rules[age_key]
        })
      }
    }

    const rule = rules[key]

    const value = utils.parseInt({ value: rule?.age_relax })

    if (value > 0) {
      age_relax += value
      age_messages.push(`${rule?.rule_name}:${value}`)
    }
  }
  age_messages = age_messages.join('+')

  if (includes(['None'], consent_data?.consent)) {
    age_relax = 0
    age_messages = ': You are not allowed for any age relaxation / reservation'
  }

  return { age_relax, age_messages }
}

export const balanceQualificationLevels = async (rows) => {
  try {
    if (rows.length === 0) return 'Qualification(s) is not Found!'
    rows = orderBy(rows, ['level'], ['desc'])
    let levels = []
    for (const row of rows) {
      if (!myValue.isEmpty(row?.level)) levels.push(row?.level)
    }

    levels = uniq(levels)
    let naLevels = []
    const qlevels = await masters.my('qualification_core_levels')
    for (let i = levels[0]; i > 0; i--) {
      if (includes([4, 6], i)) continue //PG diploma or DM/Mphil
      if (!includes(levels, i.toString())) {
        naLevels.push(qlevels[i]?.keytext)
      }
    }
    if (naLevels.length > 0) {
      return `Incomplete Qualification Levels. Please add ${naLevels.join(
        ' ,',
      )} levels.`
    }
    return ''
  } catch (e) {
    throw e
  }
}
