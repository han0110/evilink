import { createElement, PropsWithChildren } from 'react'
import { ApolloProvider as BaseApolloProvider } from '@apollo/client'
import { createClient } from './client'

// eslint-disable-next-line import/prefer-default-export
export const ApolloProvider = ({ children }: PropsWithChildren<{}>) =>
  createElement(BaseApolloProvider, {
    client: createClient(),
    children,
  })
