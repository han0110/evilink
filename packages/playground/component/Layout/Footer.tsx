import React, { FC } from 'react'
import { Box } from '@chakra-ui/react'
// Component
import TaiwanIcon from '~/component/UI/Icon/Taiwan'

const Footer: FC = () => (
  <Box
    as="footer"
    display="flex"
    alignItems="center"
    justifyContent="center"
    width="100vw"
    h="12"
  >
    Made in{' '}
    <TaiwanIcon aria-label="Taiwan" w="6" px="1" transform="scale(1.2)" /> by
    Han
  </Box>
)

export default Footer
