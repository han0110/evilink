import { split, HttpLink, ApolloClient, InMemoryCache } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { OperationDefinitionNode } from 'graphql'
import { WebSocketLink } from '@apollo/client/link/ws'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { isServer } from '~/util/env'

export type CreateClientOptions = {
  httpUri: string
  wsUri?: string
}

export const createClient = (options: CreateClientOptions) => {
  let link
  if (options.wsUri) {
    link = split(
      ({ query }) => {
        const { kind, operation } = getMainDefinition(
          query,
        ) as OperationDefinitionNode
        return kind === 'OperationDefinition' && operation === 'subscription'
      },
      new WebSocketLink(
        new SubscriptionClient(
          options.wsUri.replace(/(http)(s)?:\/\//, 'ws$2://'),
          {
            reconnect: true,
          },
          isServer() && require('ws'), // eslint-disable-line global-require
        ),
      ),
      new HttpLink({ uri: options.httpUri }),
    )
  } else {
    link = new HttpLink({ uri: options.httpUri })
  }
  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  })
}
