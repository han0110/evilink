import { Command } from 'commander'
import { init, serve } from './command'

// eslint-disable-next-line import/prefer-default-export
export const createProgram = () => {
  const program = new Command()
    .name('evilthereum')
    .description('evil ethereum client')
    .version('0.1.0', '-v, --version')
    .option('--chain-id <chain_id> [CHAIN_ID]', 'chain id', '3777')
    .option(
      '--chain-db-path <chain_db_path> [CHAIN_DB_PATH]',
      'chain db path',
      '.evilthereum/chaindb',
    )

  program
    .command('init')
    .description('create ganache snapshot with all required contracts deloyed')
    .option(
      '--chainlink-env-file <chainlink_env_file> [CHAINLINK_ENV_FILE]',
      'chainlink env file path',
      '.chainlink/.env',
    )
    .action(init)
  program
    .command('serve')
    .description('start ganache and listen on port <http_port>')
    .option('--http-port <http_port> [HTTP_PORT]', 'http port to serve', '8545')
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
