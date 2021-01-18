import React, { forwardRef, PropsWithChildren, RefObject } from 'react'
import { Box } from '@chakra-ui/react'
import { motion, isValidMotionProp } from 'framer-motion'

const MotionBox = motion.custom<PropsWithChildren<any>>(
  forwardRef((props, ref) => {
    const chakraProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => !isValidMotionProp(key)),
    )
    return <Box ref={ref as RefObject<HTMLDivElement>} {...chakraProps} />
  }),
)

export default MotionBox
