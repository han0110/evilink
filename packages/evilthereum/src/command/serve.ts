// import { generateProof } from '@evilink/chainlink-vrf'
import { createServer } from '../core/server'
import logger from '../util/logger'

const action = (options) => {
  const {
    parent: { chainId, chainDbPath },
    httpPort,
  } = options
  const server = createServer({
    chainId,
    chainDbPath,
  })

  server.listen(httpPort, () => {
    logger.info(`http server listening on port ${httpPort}`)
  })
}

export default action
