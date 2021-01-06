import { split, HttpLink, ApolloClient, InMemoryCache } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { OperationDefinitionNode } from 'graphql'
import { WebSocketLink } from '@apollo/client/link/ws'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import config from '~/config'
import { isServer } from '~/util/env'

// eslint-disable-next-line import/prefer-default-export
export const createClient = () =>
  new ApolloClient({
    link: split(
      ({ query }) => {
        const { kind, operation } = getMainDefinition(
          query,
        ) as OperationDefinitionNode
        return kind === 'OperationDefinition' && operation === 'subscription'
      },
      new WebSocketLink(
        new SubscriptionClient(
          config.backend.wsEndpoint,
          {
            reconnect: true,
          },
          isServer() && require('ws'), // eslint-disable-line global-require
        ),
      ),
      new HttpLink({ uri: config.backend.httpEndpoint }),
    ),
    cache: new InMemoryCache(),
  })
