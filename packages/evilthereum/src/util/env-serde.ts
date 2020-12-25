import {
  createReadStream,
  createWriteStream,
  mkdirSync,
  existsSync,
  statSync,
} from 'fs'
import { dirname } from 'path'
import { createInterface } from 'readline'
import logger from './logger'

const ensureDir = (dirpath: string) => {
  if (existsSync(dirpath)) {
    if (!statSync(dirpath).isDirectory()) {
      throw new Error(
        `failed to serialize env into file: ${dirpath} is not a directory`,
      )
    }
  } else {
    mkdirSync(dirpath, { recursive: true })
  }
}

export const deserializeFrom = async (filepath: string) => {
  const iface = createInterface({
    input: createReadStream(filepath, { encoding: 'utf-8' }),
    crlfDelay: Infinity,
  })

  const env = {}

  // eslint-disable-next-line no-restricted-syntax
  for await (const line of iface) {
    const [key, value = ''] = line.split('=', 2)
    if (key) {
      if (key in env) {
        logger.warn(`env file ${filepath} got duplicate key ${key}`)
      }
      env[key] = value
    }
  }

  return env
}

export const serializeInto = async (
  env: { [key: string]: string },
  filepath: string,
) => {
  ensureDir(dirname(filepath))

  const stream = createWriteStream(filepath, { encoding: 'utf-8' })

  Object.entries(env).forEach(([key, value]) => {
    if (key) {
      stream.write(`${key}=${value}`)
    }
  })
}
