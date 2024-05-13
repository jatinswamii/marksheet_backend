import { Prisma, PrismaClient } from '@prisma/client'

export const paramSqlQry = (
  source_string: string,
  values: [],
  withType: boolean = false,
) => {
  if (Array.isArray(values)) {
    values.forEach(function (v: any, i) {
      if (typeof v === 'string' || v instanceof String || withType === false) {
        source_string = source_string.replace(`$${i + 1}`, `'${v}'`)
      } else {
        source_string = source_string.replace(`$${i + 1}`, v)
      }
    })
  }
  return source_string
}

export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
  errorFormat: 'pretty',
})


if (process.env.TS_NODE_DEV == 'true') {
  prisma.$on('query', (e) => {
    console.log('Query: ', paramSqlQry(e.query, JSON.parse(e.params)))
    console.log('Duration: ' + e.duration + 'ms')
  })
}
