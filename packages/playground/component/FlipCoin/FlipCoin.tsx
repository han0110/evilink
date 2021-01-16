import React, { useState } from 'react'
import { AspectRatio, Button, Box, VStack, Heading } from '@chakra-ui/react'
// Component
import FlippingCoin, {
  FlippingCoinInteractStage,
} from '~/component/UI/Animation/FlippingCoin'

const FlipCoin = () => {
  // Local state
  const [interactStage, setInteractStage] = useState<FlippingCoinInteractStage>(
    'ready',
  )
  // Render
  return (
    <VStack spacing={10}>
      <AspectRatio width="100%" ratio={1}>
        <Box>
          <FlippingCoin
            size="xl"
            variant="interactive"
            interactStage={interactStage}
            onFlip={() => setInteractStage('rotating')}
            onFlipEnd={() => setInteractStage('ready')}
          />
        </Box>
      </AspectRatio>
      <Heading variant="mono" size="xs">
        Flip the Coin!
      </Heading>
      <Button onClick={() => setInteractStage('to-head')}>Stop</Button>
    </VStack>
  )
}

export default FlipCoin
