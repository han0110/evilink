import { StyleConfig } from '@chakra-ui/theme-tools'

const button: Record<string, StyleConfig> = {
  Button: {
    variants: {
      unstyled: {
        outline: 'none',
        borderRadius: 0,
        boxShadow: 'none',
        _focus: {
          boxShadow: 'none',
        },
        minWidth: 0,
        padding: 0,
        _hover: {},
      },
    },
  },
}

export default button
