import pgPromise, { IDatabase } from 'pg-promise'
import { selectAllEncryptedVrfKeys } from './prepared-statement'
import { EncryptedVRFKeys } from './type'

export type IChainlinkOrm = {
  listEncryptedVRFKeys: () => Promise<EncryptedVRFKeys[]>
}

export class ChainlinkOrm implements IChainlinkOrm {
  static async connect(databaseDsn: string) {
    const pgp = pgPromise()(databaseDsn)
    await pgp.connect()
    return new ChainlinkOrm(pgp)
  }

  public database: IDatabase<{}>

  constructor(database: IDatabase<{}>) {
    this.database = database
  }

  listEncryptedVRFKeys() {
    return this.database.any<EncryptedVRFKeys>(selectAllEncryptedVrfKeys)
  }
}
