import { customAlphabet } from 'nanoid'

export const myuuid = (text, length) => {
  const id = customAlphabet(text, length)
  return id()
}
