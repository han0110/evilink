const config = {
  theGraph: {
    httpEndpoint:
      process.env.THE_GRAPH_HTTP_ENDPOINT || 'http://localhost:8000',
    wsEndpoint: process.env.THE_GRAPH_WS_ENDPOINT || 'ws://localhost:8001',
  },
  ethereum: {
    chainId: parseInt(process.env.ETHEREUM_CHAIN_ID, 10) || 3777,
    rpcEndpoint: process.env.ETHEREUM_RPC_ENDPOINT || 'http://localhost:8577',
  },
}

module.exports = config
