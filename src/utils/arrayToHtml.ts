import { forEach } from 'lodash'

export const arrayToHtml = (array) => {
  let string = ''

  forEach(array, ({ title, data }) => {
    string = string + `<b>${title}</b>: ${data}<br />`
  })

  return string + ''
}
