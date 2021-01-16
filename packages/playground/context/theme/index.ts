import { createElement, PropsWithChildren } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import theme from '~/context/theme/theme'

export const ThemeProvider = ({ children }: PropsWithChildren<{}>) =>
  createElement(ChakraProvider, { theme, children })
