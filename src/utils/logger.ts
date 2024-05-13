const winston = require('winston')
const { createLogger, transports, format } = winston
const { combine, timestamp, label, printf } = format

// Create a function to initialize loggers
const init = (appname: string) => {
  winston.loggers.add('default', {
    level: 'info',
    levels: Object.assign(
      { fatal: 0, warn: 4, trace: 7 },
      winston.config.syslog.levels,
    ),
    format: combine(format.splat(), format.json()),
    defaultMeta: {
      service: appname + '_' + (process.env.NODE_ENV || 'development'),
    },
    transports: [new transports.Console({ level: 'info' })],
    exceptionHandlers: [new transports.Console({ level: 'error' })],
  })

  // Get the default logger
  const defaultLogger = winston.loggers.get('default')

  // Configure console logging for development
  if (process.env.NODE_ENV !== 'production') {
    defaultLogger.add(
      new transports.Console({
        format: format.simple(),
        handleExceptions: true,
      }),
    )
  }

  process.on('uncaughtException', function (err) {
    defaultLogger.error('UncaughtException processing: %s', err)
  })

  process.on('unhandledRejection', (e) => {
    defaultLogger.error('UnhandledRejection processing: %s', e)
    process.exit(1)
  })

  defaultLogger.child = function () {
    return winston.loggers.get('default')
  }
  return defaultLogger
}


module.exports = init
