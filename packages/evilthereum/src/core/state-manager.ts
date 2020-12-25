import GanacheStateManager from 'ganache-core/lib/statemanager'

class StateManager extends GanacheStateManager {
  processBlock(timestamp, callback) {
    // TODO: hack the block header to perform attack
    super.processBlock(timestamp, callback)
  }
}

export default StateManager
