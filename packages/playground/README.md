# @evilink/playground

## Development

### Prepare Dependencies

Playground depends on a running graph-node serving GQL api, we can use [`script/docker-compose.yml`](/script/docker-compose.yml) for help

```bash
bash ../../script/run.sh up \
  postgres \
  ipfs \
  evilthereum \ # port 8577 is needed for rpc
  chainlink \
  graph-node # port 8000, 8001 is needed for gql api
```

Then deploy subgraph

```bash
VICTIM_CONTRACT=TODO
bash ../../script/run.sh deploy_subgraph ${VICTIM_CONTRACT}
```

Finally

```bash
yarn dev
```

## Credit

- The awesome flipping coin logo in pure css is made by [Hoonseok Park](https://codepen.io/parcon) in [codepen](https://codepen.io/parcon/pen/oxbLVd?editors=1100)
