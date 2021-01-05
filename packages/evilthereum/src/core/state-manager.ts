import GanacheStateManager from 'ganache-core/lib/statemanager'
import Blockchain from './blockchain'

type StateManagerOption = Record<string, any> & {
  blockchain: Blockchain
}

class StateManager extends GanacheStateManager {
  public blockchain: Blockchain

  constructor({ blockchain, ...options }: StateManagerOption) {
    super(options)
    this.blockchain = blockchain
  }
}

export default StateManager
