import { map, includes } from 'lodash'
import { myDB } from '../../utils/db/dbHelper'
import { handleServerError } from '../../helpers/server/serverErrors'
import { getTransliterateSuggestions } from '@ai4bharat/indic-transliterate'

export const suggestions = async (params, reply) => {
  try {
    const data = await getTransliterateSuggestions(params?.data?.word, {
      numOptions: 1,
      showCurrentWordAsLastSuggestion: false,
      lang: 'hi',
    })

    const cachedData = await myDB.sqlQry({ sql: `select word from dictionary` })

    const cached = map(cachedData, (item) => item.word)

    const mappedData = data?.map((item) => {
      return {
        word: item,
        isCached: includes(cached, item),
      }
    })

    return { data: mappedData, message: '' }
  } catch (e) {
    handleServerError(reply, e)
  }
}
