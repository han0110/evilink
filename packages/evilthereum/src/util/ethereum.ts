import VM from 'ethereumjs-vm'
import Common from 'ethereumjs-common'
import { Transaction } from 'ethereumjs-tx'
import Block from 'ethereumjs-block'
import { Wallet, utils } from 'ethers'
import { RunTxOpts } from 'ethereumjs-vm/dist/runTx'

export const bufferToHex = (buffer: Buffer): string =>
  `0x${buffer.toString('hex')}`

export const remove0xPrefix = (hex: string): string =>
  new RegExp(`^(0x)?([a-f0-9]*)$`, 'i').exec(hex)[2]

export const hexToBuffer = (hex: string): Buffer =>
  Buffer.from(remove0xPrefix(hex), 'hex')

export const hexStripZeros = (hex: utils.BytesLike, length: number): string =>
  utils.hexZeroPad(utils.hexStripZeros(hex), length)

export const encodeCalldata = (
  shortSignature: string,
  types: Array<string | utils.ParamType>,
  data: string[],
) =>
  `0x${remove0xPrefix(shortSignature)}${new utils.AbiCoder()
    .encode(types, data)
    .substr(2)}`

export const decodeData = (
  types: Array<string | utils.ParamType>,
  data: string,
): utils.Result => new utils.AbiCoder().decode(types, utils.arrayify(data))

export type Log = {
  address: string
  topics: string[]
  data: string
}

export const doecdeReceiptLog = (
  receiptLog: [Buffer, Buffer[], Buffer],
): Log => {
  const [address, topics, data] = receiptLog
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
        nonce: 1,
        gasLimit: 10000000,
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
