import React, { useMemo } from 'react'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { Box } from '@chakra-ui/react'

const clip = keyframes`
  to {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
`

const ClippedBox = styled(Box)`
  clip-path: polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%);
  animation: ${clip} ${(props) => props.$duration}s
    steps(${(props) => props.$step}, start) infinite;
`

type DotsSpinnerProps = {
  count?: number
  duration?: number
}

const DotsSpinner = ({ count = 3, duration = 1 }: DotsSpinnerProps) => {
  // Local state
  const text = useMemo(() => '.'.repeat(count), [count])
  // Render
  return (
    <ClippedBox as="span" $duration={duration} $step={count}>
      {text}
    </ClippedBox>
  )
}

export default DotsSpinner
