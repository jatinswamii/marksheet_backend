import S from 'fluent-json-schema'

export const loginSchema = {
  body: S.object()
    .prop('email', S.string())
    .prop('registrationid', S.string())
    .prop('mobile', S.string())
    .prop('password', S.string())
    .prop('captcha', S.string()),
  queryString: S.object(),
  params: S.object(),
  headers: S.object(),
}

export const signupSchema = {
  body: S.object()
    .prop('email', S.string().required())
    .prop('password', S.string().minLength(8).required()),
  queryString: S.object(),
  params: S.object(),
  headers: S.object(),
}
