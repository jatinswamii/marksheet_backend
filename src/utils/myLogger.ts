// const winston = require('winston');
// const { createLogger, format, transports } = winston;

// function getCaller() {
//     var err;
//     try { throw Error('') } catch (e) { err = e; }
//     var pattern = /\s*at (Object.)?(silly|debug|verbose|info|warn|error) /;
//     var callerLine = err.stack.split("\n").filter(line => pattern.test(line))[0];
//     return callerLine.replace(pattern, '').replace(/^\(|\)$/g, '');
// }

// const logConfig = {
//     level: 'debug',
//     format: winston.format.combine(
//         winston.format.timestamp({ format: 'YYYY-MM-dd HH:mm:ss.SSS' }),
//         winston.format.printf((log) => `${[log.timestamp]} | ${log.level} | ${getCaller()} | ${log.message}`)
//     )
// };

// const logger = createLogger({
//     format: format.combine(
//         format.splat(),
//         format.simple()
//     ),
//     transports: [
//         new winston.transports.Console(logConfig)
//     ],
//     exitOnError: false
// });

// module.exports = logger;