import VM from 'ethereumjs-vm'
import Common from 'ethereumjs-common'
import Block from 'ethereumjs-block'
import { Transaction } from 'ethereumjs-tx'
import { RunTxOpts } from 'ethereumjs-vm/dist/runTx'
import { Wallet } from '@ethersproject/wallet'
import { GAS_LIMIT } from '@evilink/constant'

export const bufferToHex = (buffer: Buffer): string =>
  `0x${buffer.toString('hex')}`

export const remove0xPrefix = (hex: string): string =>
  new RegExp(`^(0x)?([a-f0-9]*)$`, 'i').exec(hex)?.[2] ?? ''

export const hexToBuffer = (hex: string): Buffer =>
  Buffer.from(remove0xPrefix(hex), 'hex')

export const hashToAddress = (hash: string): string => `0x${hash.substr(-40)}`

export type Log = {
  address: string
  topics: string[]
  data: string
}

export const decodeRawReceiptLog = (
  rawReceiptLog: [Buffer, Buffer[], Buffer],
): Log => {
  const [address, topics, data] = rawReceiptLog
  return {
    address: bufferToHex(address),
    topics: topics.map(bufferToHex),
    data: bufferToHex(data),
  }
}

export const copyVm = (vm: VM): VM => {
  const copied = vm.copy()
  // @ts-ignore
  copied.blockchain = { ...copied.blockchain }
  return copied
}

export const genTxOptsFromRandom = async (
  data: string,
  to: string,
  common: Common,
  block?: Block,
): Promise<RunTxOpts> => {
  const randomWallet = Wallet.createRandom()
  return {
    tx: new Transaction(
      await randomWallet.signTransaction({
        from: randomWallet.address,
        nonce: 0,
        gasLimit: GAS_LIMIT,
        gasPrice: 0,
        value: 0,
        data,
        to,
        chainId: common.chainId(),
      }),
      { common },
    ),
    skipNonce: true,
    skipBalance: true,
    block,
  }
}
