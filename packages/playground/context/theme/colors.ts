/* eslint-disable no-bitwise */

import theme from '@chakra-ui/theme'

type ColorHues = {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
}

const ALPHAS = [...Array(19)].map((_, i) => (i + 1) * 5)

const hexToRgba = (hex: string, alpha: number) => {
  const bigint = parseInt(hex.replace('#', ''), 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`
}

const alphaExtended = (colors: Record<string, ColorHues | string>) =>
  Object.entries(colors)
    .filter(([, hues]) => typeof hues === 'object')
    .reduce(
      (prev1, [color, hues]) => ({
        ...prev1,
        ...ALPHAS.reduce(
          (prev2, alpha) => ({
            ...prev2,
            [`${color}Alpha${`${alpha}`.padStart(2, '0')}`]: Object.entries(
              hues,
            ).reduce(
              (hueExtended, [hue, rgb]) => ({
                ...hueExtended,
                [hue]: hexToRgba(rgb, alpha),
              }),
              {},
            ),
          }),
          {},
        ),
      }),
      {},
    )

const colors = {
  ...theme.colors,
  ...alphaExtended(theme.colors),
}

export default colors
