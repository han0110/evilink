import React from 'react'
import Head from 'next/head'
import { AppProps } from 'next/app'
// Context
import { ApolloProvider } from '~/context/apollo'
import { ThemeProvider } from '~/context/theme'
import { Web3Provider } from '~/context/web3'
// Config
import config from '~/config'

const App = ({ Component, pageProps, router: { pathname } }: AppProps) => (
  <>
    <Head>
      <title>EVILink Playground</title>
    </Head>
    <ThemeProvider>
      <Web3Provider>
        <ApolloProvider
          options={{
            wsUri: `${config.theGraph.wsEndpoint}/subgraphs/name${pathname}`,
            httpUri: `${config.theGraph.httpEndpoint}/subgraphs/name${pathname}`,
          }}
        >
          <Component {...pageProps} />
        </ApolloProvider>
      </Web3Provider>
    </ThemeProvider>
  </>
)

App.getInitialProps = async () => ({})

export default App
