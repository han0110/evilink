import { useState, useCallback } from 'react'

const useBool = (
  initialState: boolean = false,
): [boolean, () => void, () => void] => {
  const [bool, setBool] = useState(initialState)
  return [
    bool,
    useCallback(() => setBool(true), []),
    useCallback(() => setBool(false), []),
  ]
}

export default useBool
