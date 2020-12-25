/* eslint-disable no-param-reassign */
import { format as fmt } from 'util'
import { transports, loggers, format, Logger, LeveledLogMethod } from 'winston'
import dayjs from 'dayjs'
import chalk from 'chalk'

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

export const COLORIZED_LEVEL = {
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

const simpleFormat = format.printf(({ level, message, timestamp }) =>
  fmt('%s %s %s', timestamp, COLORIZED_LEVEL[level], message),
)

interface DefaultLogger extends Logger {
  trace: LeveledLogMethod
}

// @ts-ignore
const logger: DefaultLogger = loggers.get('default', {
  levels: LEVEL_NUMBER,
  transports: [
    new transports.Console({
      level: process.env.NODE_ENV === 'production' ? LEVEL.INFO : LEVEL.DEBUG,
    }),
  ],
  format: format.combine(timestampFormat(), simpleFormat),
})

export default logger
