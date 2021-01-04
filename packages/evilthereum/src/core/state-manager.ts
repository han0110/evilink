import GanacheStateManager from 'ganache-core/lib/statemanager'
import Blockchain from './blockchain'

type StateManagerOption = Record<string, any> & {
  blockchain: Blockchain
}

class StateManager extends GanacheStateManager {
  public blockchain: Blockchain

  constructor({ blockchain, ...options }: StateManagerOption, provider: any) {
    super(options, provider)
    this.blockchain = blockchain
  }
}

export default StateManager
