import React, { FC } from 'react'
import { StylesProvider, useMultiStyleConfig } from '@chakra-ui/react'
// Component
import Header from '~/component/Layout/Header'
import Main from '~/component/Layout/Main'
import Footer from '~/component/Layout/Footer'

type LayoutProps = {
  mainProps?: any
}

const Layout: FC<LayoutProps> = ({ children, mainProps }) => (
  <StylesProvider value={useMultiStyleConfig('Layout', {})}>
    <Header />
    <Main {...mainProps}>{children}</Main>
    <Footer />
  </StylesProvider>
)

export default Layout
