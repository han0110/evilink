// Reference: https://stackoverflow.com/a/4770179/13177330

import { isBrowser } from './env'

const preventDefault = (e: Event) => {
  e.preventDefault()
}

let supportsPassive = false
try {
  if (isBrowser()) {
    // @ts-ignore
    window.addEventListener(
      'test',
      null,
      Object.defineProperty({}, 'passive', {
        get: () => {
          supportsPassive = true
        },
      }),
    )
  }
} catch {
  // noop
}

const wheelOpt = supportsPassive ? { passive: false } : false
// eslint-disable-next-line no-nested-ternary
const wheelEvent = isBrowser()
  ? 'onwheel' in document.createElement('div')
    ? 'wheel'
    : 'mousewheel'
  : ''

export const disableScroll = () => {
  if (isBrowser()) {
    window.addEventListener('DOMMouseScroll', preventDefault, false)
    window.addEventListener(wheelEvent, preventDefault, wheelOpt)
    window.addEventListener('touchmove', preventDefault, wheelOpt)
  }
}

export const enableScroll = () => {
  if (isBrowser()) {
    window.removeEventListener('DOMMouseScroll', preventDefault, false)
    // @ts-ignore
    window.removeEventListener(wheelEvent, preventDefault, wheelOpt)
    // @ts-ignore
    window.removeEventListener('touchmove', preventDefault, wheelOpt)
  }
}
