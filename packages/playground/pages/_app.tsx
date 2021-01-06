import React from 'react'
import Head from 'next/head'
import { AppProps } from 'next/app'
import { ThemeProvider } from '~/context/theme'
import { ApolloProvider } from '~/context/apollo'
import { Web3Provider } from '~/context/web3'

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <title>EVILink Playground</title>
    </Head>
    <ThemeProvider>
      <ApolloProvider>
        <Web3Provider>
          <Component {...pageProps} />
        </Web3Provider>
      </ApolloProvider>
    </ThemeProvider>
  </>
)

export default App
