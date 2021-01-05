/* eslint-disable no-param-reassign */
import { format as fmt } from 'util'
import * as winston from 'winston'
import { transports, loggers, format } from 'winston'
import dayjs from 'dayjs'
import chalk from 'chalk'

declare module 'winston' {
  interface Logger {
    trace: winston.LeveledLogMethod
  }
}

const LEVEL = {
  PANIC: 'panic',
  FATAL: 'fatal',
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace',
}

const LEVEL_NUMBER = {
  [LEVEL.PANIC]: 0,
  [LEVEL.FATAL]: 1,
  [LEVEL.ERROR]: 2,
  [LEVEL.WARN]: 3,
  [LEVEL.INFO]: 4,
  [LEVEL.DEBUG]: 5,
  [LEVEL.TRACE]: 6,
}

const COLORIZED_LEVEL = {
  [LEVEL.PANIC]: chalk.red(`${LEVEL.PANIC.toUpperCase()}`),
  [LEVEL.FATAL]: chalk.red(`${LEVEL.FATAL.toUpperCase()}`),
  [LEVEL.ERROR]: chalk.red(`${LEVEL.ERROR.toUpperCase()}`),
  [LEVEL.WARN]: chalk.yellow(` ${LEVEL.WARN.toUpperCase()}`),
  [LEVEL.INFO]: chalk.green(` ${LEVEL.INFO.toUpperCase()}`),
  [LEVEL.DEBUG]: chalk.gray(`${LEVEL.DEBUG.toUpperCase()}`),
  [LEVEL.TRACE]: chalk.gray(`${LEVEL.TRACE.toUpperCase()}`),
}

const timestampFormat = format((info) => {
  info.unixTimestamp = Date.now()
  info.timestamp = chalk.gray(
    dayjs(info.unixTimestamp || info.timestamp).format('YYYY/MM/DD HH:mm:ss'),
  )
  return info
})

const simpleFormat = format.printf(
  ({ prefix = 'ANONYMOUS', level, message, timestamp }) =>
    fmt(
      '%s %s %s %s',
      timestamp,
      COLORIZED_LEVEL[level],
      chalk.magenta(
        prefix.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase(),
      ),
      message,
    ),
)

const logger = loggers.get('default', {
  levels: LEVEL_NUMBER,
  transports: [
    new transports.Console({
      level:
        { production: LEVEL.INFO, debug: LEVEL.TRACE }?.[
          process.env.NODE_ENV
        ] ?? LEVEL.DEBUG,
    }),
  ],
  format: format.combine(timestampFormat(), simpleFormat),
})

export default logger
