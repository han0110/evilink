import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ChainlinkPageQuery, ChainlinkDocument } from './type'

export type Get<Data> = (
  query?: ChainlinkPageQuery,
  config?: AxiosRequestConfig,
) => Promise<ChainlinkDocument<Data>>

export type PostRaw<Body, Data> = (
  body: Body,
  config?: AxiosRequestConfig,
) => Promise<AxiosResponse<ChainlinkDocument<Data>>>

export type Post<Body, Data> = (
  body: Body,
  config?: AxiosRequestConfig,
) => Promise<ChainlinkDocument<Data>>

export function createGet<Data>(client: AxiosInstance, url: string): Get<Data> {
  return (query?: ChainlinkPageQuery, config?: AxiosRequestConfig) =>
    client({
      ...config,
      url,
      method: 'GET',
      params: query,
    }).then(({ data }) => data)
}

export function createPostRaw<Body, Data>(
  client: AxiosInstance,
  url: string,
): PostRaw<Body, Data> {
  return (body: Body, config?: AxiosRequestConfig) =>
    client({
      ...config,
      url,
      method: 'POST',
      data: body,
    })
}

export function createPost<Body, Data>(
  client: AxiosInstance,
  url: string,
): Post<Body, Data> {
  return (body: Body, config?: AxiosRequestConfig) =>
    client({
      ...config,
      url,
      method: 'POST',
      data: body,
    }).then(({ data }) => data)
}
