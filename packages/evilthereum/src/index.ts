import { Command } from 'commander'
import { serve } from './command'

// eslint-disable-next-line import/prefer-default-export
export const createProgram = () => {
  const program = new Command()
    .name('evilthereum')
    .description('evil ethereum client')
    .version('0.1.0', '-v, --version')
    .option('--chain-id <chain_id>', 'chain id', process.env.CHAIN_ID || '3777')
    .option(
      '--chain-db-path <chain_db_path>',
      'chain db path',
      process.env.CHAIN_DB_PATH || '.evilthereum/chaindb',
    )

  program
    .command('serve')
    .description('start ganache and listen on port <http_port>')
    .option(
      '--http-port <http_port>',
      'http port to serve',
      process.env.HTTP_PORT || '8545',
    )
    .option(
      '--chainlink-api-dsn <chainlink_api_dsn>',
      'chainlink api data source name',
      process.env.CHAINLINK_API_DSN || 'http://localhost:6688',
    )
    .option(
      '--chainlink-api-auth-file <chainlink_api_auth_file>',
      'chainlink api auth file',
      process.env.CHAINLINK_API_AUTH_FILE || '.chainlink/secret/api.txt',
    )
    .option(
      '--chainlink-database-dsn <chainlink_database_dsn>',
      'chainlink database data source name',
      process.env.CHAINLINK_DATABASE_DSN || '',
    )
    .option(
      '--chainlink-vrf-key-passphrase-file <chainlink_vrf_key_passphrase_file>',
      'chainlink vrf key passphrase file',
      process.env.CHAINLINK_VRF_KEY_PASSPHRASE_FILE ||
        '.chainlink/secret/passphrase.txt',
    )
    .option(
      '--chainlink-mocker-key <chainlink_mocker-key>',
      'chainlink mocker key for mocking random service',
      process.env.CHAINLINK_MOCKER_KEY || '',
    )
    .action(serve)

  return program
}

if (require.main === module) {
  const program = createProgram()
  program.exitOverride((err) => {
    switch (err.code) {
      // Ignore parse error
      case 'commander.helpDisplayed':
      case 'commander.help':
        break
      default:
        // eslint-disable-next-line no-console
        console.log('')
        program.outputHelp()
    }
  })
  program.parse(process.argv)
}
