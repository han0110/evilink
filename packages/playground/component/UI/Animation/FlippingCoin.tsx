import React, { useEffect, useRef, useState } from 'react'
import styled from '@emotion/styled'
import { Box } from '@chakra-ui/react'
import {
  useMotionValue,
  useMotionTemplate,
  animate,
  PanInfo,
} from 'framer-motion'
// Hook
import useBool from '~/hook/useBool'
// Component
import MotionBox from '~/component/UI/Animation/MotionBox'
// Util
import { enableScroll, disableScroll } from '~/util/scroll-control'

const SIZE_PARAMETER = {
  xs: {
    $diameter: '48px',
    $thickness: '3px',
    $borderWidth: '8px',
    $contentFontSize: '18px',
  },
  xl: {
    $diameter: '200px',
    $thickness: '12px',
    $borderWidth: '24px',
    $contentFontSize: '60px',
  },
}

const Wrapper = styled(MotionBox)`
  width: ${(props) => props.$diameter};
  height: ${(props) => props.$diameter};
  transform-style: preserve-3d;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  &::before {
    content: '';
    width: ${(props) => `calc(2 * ${props.$thickness})`};
    height: 100%;
    background: #f7941e;
    position: absolute;
    top: 0;
    left: ${(props) => `calc(50% - ${props.$thickness})`};
    transform: rotateY(90deg) scaleX(0.99);
  }
`

const Side = styled(Box)`
  width: 100%;
  height: 100%;
  background: #f7941e;
  border-radius: 50%;
  transform: translateZ(
    ${(props) => (props.$side === 'front' ? '' : '-')}${(props) => props.$thickness}
  );
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;

  &::before {
    content: '';
    width: 100%;
    height: 100%;
    border: ${(props) => props.$beforeBorderWidth} solid #fbb041;
    border-radius: 50%;
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 3;
  }

  &::after {
    content: ${(props) => `'${props.$content || ''}'`};
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    font-size: ${(props) => props.$contentFontSize};
    font-weight: bold;
    color: #fbb041;
  }
`

const SideInner = styled(Box)`
  width: 100%;
  height: 100%;
  background: #f7941e;
  border-radius: 50%;
  transform: ${(props) =>
    `translateZ(calc(${
      props.$side === 'front'
        ? `-${props.$thickness} + 0.0001px`
        : `${props.$thickness} - 0.0001px`
    }))`};
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
`

export type FlippingCoinVariant = 'noninteractive' | 'interactive'

export type FlippingCoinInteractStage =
  | 'ready'
  | 'flipping'
  | 'to-ready'
  | 'to-head'
  | 'to-tail'

export type FlippingCoinProps = {
  size?: keyof typeof SIZE_PARAMETER
  variant?: FlippingCoinVariant
  interactStage?: FlippingCoinInteractStage
  onFlip?: (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => void
  onFlipEnd?: () => void
}

const FlippingCoin = ({
  size = 'xs',
  variant = 'noninteractive',
  interactStage,
  onFlip,
  onFlipEnd,
}: FlippingCoinProps) => {
  // Local state
  const [disallowScroll, setDisallowScroll, unsetDisallowScroll] = useBool()
  const [
    currentInteractStage,
    setCurrentInteractStage,
  ] = useState<FlippingCoinInteractStage>('ready')
  const controls = useRef<{ stop: () => void }>()
  const nextControlCreator = useRef<() => { stop: () => void }>()
  const deg = useMotionValue(0)
  const transform = useMotionTemplate`rotateY(${deg}deg)`
  const [clockwise, setClockwise] = useState<-1 | 1>(-1)
  // Event
  const onPan = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (currentInteractStage === 'ready' && interactStage === 'ready') {
      deg.set(deg.get() + info.delta.x)
    }
  }
  const onPanStart = () => {
    setDisallowScroll()
  }
  const onPanEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    unsetDisallowScroll()
    const velocity = Math.abs(info.velocity.x)
    const newClockwise = info.velocity.x > 0 ? 1 : -1
    if (
      currentInteractStage === 'ready' &&
      interactStage === 'ready' &&
      velocity > 100
    ) {
      let duration = Math.max(100 / velocity, 0.2)
      const createAnimate = () =>
        animate(deg, deg.get() + newClockwise * 360, {
          repeat: Infinity,
          duration,
          ease: 'linear',
          onRepeat: () => {
            if (nextControlCreator.current) {
              if (duration === 1) {
                controls.current = nextControlCreator.current()
                nextControlCreator.current = undefined
              } else {
                duration = Math.min(duration + 0.1, 1)
                controls.current = createAnimate()
              }
            }
          },
        })
      controls.current = createAnimate()
      setCurrentInteractStage('flipping')
      setClockwise(newClockwise)
      onFlip?.(event, info)
    }
  }
  // Effect
  useEffect(() => {
    switch (variant) {
      case 'noninteractive':
        controls.current = animate(deg, deg.get() + 360, {
          repeat: Infinity,
          duration: 10,
          ease: 'linear',
        })
        break
      case 'interactive':
        break
      default:
        throw new Error(`unexpected variant ${variant}`)
    }
    return controls.current?.stop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant])
  useEffect(() => {
    if (disallowScroll) {
      disableScroll()
      return enableScroll
    }
    return () => {}
  }, [disallowScroll])
  useEffect(() => {
    if (currentInteractStage === 'flipping') {
      if (interactStage === 'to-ready') {
        setCurrentInteractStage(interactStage)
        controls.current = animate(
          deg,
          clockwise * (Math.ceil(Math.abs(deg.get()) / 360) * 360 + 360),
          {
            duration: 1,
            ease: [0.66, 0.61, 0.58, 1],
            onComplete: () => {
              deg.set(0)
              setCurrentInteractStage('ready')
              onFlipEnd?.()
            },
          },
        )
      }
      if (interactStage === 'to-head' || interactStage === 'to-tail') {
        setCurrentInteractStage(interactStage)

        nextControlCreator.current = () => {
          let toDeg =
            clockwise * (Math.ceil(Math.abs(deg.get()) / 360) * 360 + 360)
          if (interactStage === 'to-tail') {
            toDeg += clockwise * 180
          }
          return animate(deg, toDeg, {
            duration: 3,
            ease: [0.66, 0.61, 0.58, 1],
            onComplete: () => {
              deg.set(toDeg % 360)
              setCurrentInteractStage('ready')
              onFlipEnd?.()
            },
          })
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactStage, currentInteractStage, setCurrentInteractStage])
  // Render
  return (
    <MotionBox
      display="flex"
      alignItems="center"
      justifyContent="center"
      onPanStart={onPanStart}
      onPan={onPan}
      onPanEnd={onPanEnd}
    >
      <Wrapper
        $diameter={SIZE_PARAMETER[size].$diameter}
        $thickness={SIZE_PARAMETER[size].$thickness}
        style={{ transform }}
      >
        <Side
          $side="front"
          $thickness={SIZE_PARAMETER[size].$thickness}
          $beforeBorderWidth={SIZE_PARAMETER[size].$borderWidth}
          $contentFontSize={SIZE_PARAMETER[size].$contentFontSize}
          $content="Ξ"
        />
        <SideInner $side="front" $thickness={SIZE_PARAMETER[size].$thickness} />
        <SideInner $side="back" $thickness={SIZE_PARAMETER[size].$thickness} />
        <Side
          $side="back"
          $thickness={SIZE_PARAMETER[size].$thickness}
          $beforeBorderWidth={SIZE_PARAMETER[size].$borderWidth}
        />
      </Wrapper>
    </MotionBox>
  )
}

export default FlippingCoin
