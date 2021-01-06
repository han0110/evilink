import { createElement, PropsWithChildren } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import theme from '~/context/theme/theme'

// eslint-disable-next-line import/prefer-default-export
export const ThemeProvider = ({ children }: PropsWithChildren<{}>) =>
  createElement(ChakraProvider, { theme, children })
