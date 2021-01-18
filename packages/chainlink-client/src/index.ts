import axios, { AxiosInstance } from 'axios'
import { createGet, createPostRaw, createPost, Get, Post } from './helper'
import { SessionReq, SessionRes, JobSpecReq, JobSpecRes } from './type'

export type IChainlinkClient = {
  listJobSpec: Get<JobSpecRes[]>
  createJobSpec: Post<JobSpecReq, JobSpecRes>
}

export class ChainlinkClient implements IChainlinkClient {
  private static SESSION_KEY = 'clsession'

  private static SESSION_KEY_REG_EXP = `^${ChainlinkClient.SESSION_KEY}=([^;]+);.*`

  static async authenticate(
    endpoint: string,
    body: SessionReq,
  ): Promise<ChainlinkClient> {
    const chainlinkClient = new ChainlinkClient(endpoint)
    await chainlinkClient.authenticate(body)
    return chainlinkClient
  }

  private instance: AxiosInstance

  public listJobSpec: Get<JobSpecRes[]>

  public createJobSpec: Post<JobSpecReq, JobSpecRes>

  constructor(endpoint: string) {
    this.instance = axios.create({ baseURL: endpoint })
    this.listJobSpec = createGet<JobSpecRes[]>(this.instance, '/v2/specs')
    this.createJobSpec = createPost<JobSpecReq, JobSpecRes>(
      this.instance,
      '/v2/specs',
    )
  }

  async authenticate(body: SessionReq) {
    const { headers } = await createPostRaw<SessionReq, SessionRes>(
      this.instance,
      '/sessions',
    )(body)

    const sessionRegExp = new RegExp(ChainlinkClient.SESSION_KEY_REG_EXP)
    const setCookies = headers['set-cookie'] || []
    const cookieSession = (Array.isArray(setCookies)
      ? setCookies
      : [setCookies]
    ).find((setCookie) => sessionRegExp.test(setCookie))

    if (!cookieSession) {
      throw new Error(
        `failed to parse session from response header: ${JSON.stringify(
          headers,
          null,
          2,
        )}`,
      )
    }

    this.instance.defaults.headers = {
      Cookie: `${ChainlinkClient.SESSION_KEY}=${
        sessionRegExp.exec(cookieSession)[1]
      }`,
    }
  }
}

export * from './type'
