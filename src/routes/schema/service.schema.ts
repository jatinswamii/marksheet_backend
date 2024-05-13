import S from 'fluent-json-schema'

export const serviceSchema = {
  body: S.object()
    .prop('action', S.string().required())
    .prop('section', S.string().required())
    .prop('path', S.string().required()),
  headers: S.object(),
}
