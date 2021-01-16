import React, { FC } from 'react'
import { Box } from '@chakra-ui/react'

type MainProps = any

const Main: FC<MainProps> = ({ children, ...props }) => (
  <Box
    as="main"
    flex="1"
    w="100vw"
    maxW={['90vw', '60rem']}
    mx="auto"
    px={[0, 6]}
    {...props}
  >
    {children}
  </Box>
)

export default Main
