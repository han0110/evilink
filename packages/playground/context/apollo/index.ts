import { createElement, FC } from 'react'
import { ApolloProvider as BaseApolloProvider } from '@apollo/client'
import { createClient, CreateClientOptions } from './client'

export const ApolloProvider: FC<{ options: CreateClientOptions }> = ({
  children,
  options,
}) =>
  createElement(BaseApolloProvider, {
    client: createClient(options),
    children,
  })
