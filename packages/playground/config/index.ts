import getConfig from 'next/config'
import mergeDeepRight from 'ramda/src/mergeDeepRight'
import publicRuntime from '~/config/publicRuntime'

type RuntimeConfig = typeof publicRuntime & {
  dev: boolean
  prod: boolean
}

const { publicRuntimeConfig } = getConfig()

const config = mergeDeepRight(publicRuntimeConfig, {
  dev: process.env.NODE_ENV !== 'production',
  prod: process.env.NODE_ENV === 'production',
})

export default config as RuntimeConfig
