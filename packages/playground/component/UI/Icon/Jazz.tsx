import React, { useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import ReactJazzicon, { jsNumberForAddress } from 'react-jazzicon'

type JazzIconProps = {
  address: string
  size?: string
}

const JazzIcon = ({ address, size = '3em' }: JazzIconProps) => {
  const ref = useRef(null)
  // Effect
  useEffect(() => {
    const el = ReactDOM.findDOMNode(ref.current) as Element // eslint-disable-line react/no-find-dom-node
    const svg = el?.getElementsByTagName?.('svg')[0]
    if (svg) {
      svg.setAttribute('width', size)
      svg.setAttribute('height', size)
    }
  }, [size])
  // Render
  return (
    <ReactJazzicon
      seed={jsNumberForAddress(address)}
      diameter={12}
      ref={ref}
      paperStyles={{
        width: 'auto',
        height: 'auto',
        borderRadius: '100em',
      }}
    />
  )
}

export default JazzIcon
