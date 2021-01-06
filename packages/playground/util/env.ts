export const isBrowser = () => typeof window !== 'undefined'

export const isServer = () => !isBrowser()
