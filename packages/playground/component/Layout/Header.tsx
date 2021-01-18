import React, { FC } from 'react'
import Link from 'next/link'
import { Box, AspectRatio, Heading, HStack, Spacer } from '@chakra-ui/react'
// Component
import FlippingCoin from '~/component/UI/Animation/FlippingCoin'
import ConnectButton from '~/component/Wallet/ConnectButton'
// Constant
import { ROUTES } from '~/constant'

const Header: FC = () => (
  <>
    <Box
      as="header"
      position="fixed"
      top="0"
      w="100vw"
      boxShadow="sm"
      zIndex="10"
      bgColor="grayAlpha90.50"
    >
      <HStack
        h="20"
        px={[0, 6]}
        m="auto"
        flex="1"
        display="flex"
        alignItems="center"
        maxW={['90vw', '60rem']}
        fontWeight="700"
      >
        <Link href={ROUTES.FLIPCOIN}>
          <Box as="a" cursor="pointer">
            <HStack>
              <AspectRatio w="3em" h="3em" ratio={1}>
                <Box>
                  <FlippingCoin size="xs" />
                </Box>
              </AspectRatio>
              <Heading variant="mono" color="#fbb041">
                FLIPY
              </Heading>
            </HStack>
          </Box>
        </Link>
        <Spacer />
        <ConnectButton />
      </HStack>
    </Box>
    <Box h="20" />
  </>
)

export default Header
