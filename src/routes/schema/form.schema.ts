import S from 'fluent-json-schema'

export const formSchema = {
  body: S.object()
    .prop('formId', S.required())
    .prop(
      'action',
      S.enum(['schema', 'create', 'get', 'upsert', 'del', 'list']).required(),
    )
    .prop('param', S.object())
}


