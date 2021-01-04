import { readFileSync } from 'fs'
import { createServer } from '../core/server'
import logger from '../util/logger'

const action = async (options) => {
  const {
    parent: { chainId, chainDbPath },
    httpPort,
    chainlinkApiDsn,
    chainlinkApiAuthFile,
    chainlinkDatabaseDsn,
    chainlinkVrfKeyPassphraseFile,
    chainlinkMockerKey,
  } = options

  const [apiAuthEmail, apiAuthPassphrase] = readFileSync(chainlinkApiAuthFile)
    .toString('utf-8')
    .split('\n', 2)
  const [vrfKeyPassphrase] = readFileSync(chainlinkVrfKeyPassphraseFile)
    .toString('utf-8')
    .split('\n', 1)

  const server = await createServer({
    chainId: parseInt(chainId, 10),
    chainDbPath,
    chainlink: {
      apiDsn: chainlinkApiDsn,
      apiAuth: {
        email: apiAuthEmail,
        password: apiAuthPassphrase,
      },
      databaseDsn: chainlinkDatabaseDsn,
      vrfKeyPassphrase,
      mockerKey: chainlinkMockerKey,
    },
  })

  server.listen(httpPort, () => {
    logger.info(`http server listening on port ${httpPort}`)
  })
}

export default action
