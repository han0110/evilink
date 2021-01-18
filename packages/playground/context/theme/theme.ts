import { extendTheme } from '@chakra-ui/react'
import components from '~/context/theme/components'
import styles from '~/context/theme/styles'
import colors from '~/context/theme/colors'

const override = {
  config: {
    useSystemColorMode: false,
    initialColorMode: 'light',
  },
  components,
  styles,
  colors,
  shadows: { outline: 'none' },
}

export default extendTheme(override)
