/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */

const { PHASE_PRODUCTION_BUILD } = require('next/constants')
const { withPlugins, optional } = require('next-compose-plugins')
const publicRuntimeConfig = require('./config/publicRuntime')

const config = {
  trailingSlash: true,
  reactStrictMode: true,
  publicRuntimeConfig,
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
