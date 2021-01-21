# @evilink/evilthereum

EVILthereum (base on [trufflesuite/ganache-core](https://github.com/trufflesuite/ganache-core)) implements the attack to steal Chainlink node's `vrf_key` and tamper the randomenss by changing block extra data for favorable result.

## Development

### Start with Chainlink Mocker

```bash
yarn dev serve --chainlink-mocker-key 0x$(openssl rand -hex 32)
```

### Create [`ResultChecker`](./src/core/randomness-hacker/type.ts#L11) for [`RandomnessHacker`](./src/core/randomness-hacker/index.ts#L22)

1. Design your victim contract in [`contracts`](../../contracts) and build artifact.
2. Add migration of victim contract in [`migration.ts`](src/core/migration.ts).
3. Add victim contract's address to [`contract-address.ts`](../constant/src/contract-address.ts) for future usage.
4. Implement `ResultChecker` and [register it as well-known victim](./src/core/randomness-hacker/index.ts#L73).
