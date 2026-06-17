/** A tiny hash router: the part after `#/` is the active route id. */

/** The route id for the landing page. */
export const HOME_ROUTE = ''

/** Extract the route id from a `location.hash` (e.g. `#/temperley-lieb`). */
export function parseHash(hash: string): string {
  return hash.replace(/^#\/?/, '')
}

/** Build the hash for a route id. */
export function toHash(routeId: string): string {
  return `#/${routeId}`
}
