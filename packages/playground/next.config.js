/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */

const { PHASE_PRODUCTION_BUILD } = require('next/constants')
const { withPlugins, optional } = require('next-compose-plugins')
const publicRuntimeConfig = require('./config/publicRuntime')

const config = {
  trailingSlash: false,
  reactStrictMode: true,
  publicRuntimeConfig,
  // NOTE: Temperary workaround for not-implemented homepage
  async redirects() {
    return [
      {
        source: '/',
        destination: '/flipcoin',
        permanent: true,
      },
    ]
  },
}

const plugins = [
  [
    optional(() =>
      require('@next/bundle-analyzer')({
        enabled: process.env.BUNDLE_ANALYZER === 'true',
      }),
    ),
    [PHASE_PRODUCTION_BUILD],
  ],
]

module.exports = withPlugins(plugins, config)
