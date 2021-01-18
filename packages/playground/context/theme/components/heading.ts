import { StyleConfig } from '@chakra-ui/theme-tools'
import styles from '~/context/theme/styles'

const button: Record<string, StyleConfig> = {
  Heading: {
    variants: {
      mono: {
        fontFamily: styles.global.body.fontFamily,
      },
    },
  },
}

export default button
