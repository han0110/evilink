const config = {
  backend: {
    httpEndpoint: 'http://localhost:8000/subgraphs/name/flipcoin',
    wsEndpoint: 'ws://localhost:8001/subgraphs/name/flipcoin',
  },
  ethereum: {
    chainId: 3777,
    rpcEndpoint: 'http://localhost:8577',
  },
}

module.exports = config
