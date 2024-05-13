import { map, flatten } from 'lodash'

export const getFormSchema = (schemaD) => {
  return map(schemaD?.data, ({ formid, title, sections }) => {
    return {
      formid,
      title,
      columns: map(
        flatten(map(sections, ({ columns }) => map(columns))),
        ({ field, title }) => {
          return {
            field,
            title,
          }
        },
      ),
    }
  })
}
