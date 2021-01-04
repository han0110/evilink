import { v4 as uuidv4 } from 'uuid'
import { IChainlink } from './type'

// eslint-disable-next-line import/prefer-default-export
export class ChainlinkMocker extends IChainlink {
  constructor(key: string) {
    super({
      key,
      jobId: uuidv4(),
    })
  }
}
