import { useEffect, useState } from 'react'

import { parseHash } from '../router'

/** Track the active hash route, updating on browser navigation. */
export function useHashRoute(): string {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))

  useEffect(() => {
    const onChange = (): void => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
