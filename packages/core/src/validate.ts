/**
 * Validation of Temperley-Lieb diagrams.
 *
 * A list of arcs is a genuine `TL_n` basis diagram exactly when it is a
 * **planar perfect matching** of the `2n` boundary points: every point has
 * degree one, and no two arcs cross. These are the conditions the book uses to
 * pin down the basis, and they are exactly what we check here.
 */

import { boundaryIndex, endpointEquals, type Endpoint, type TLDiagram } from './diagram'

/** A diagnostic result: whether the diagram is valid and, if not, why. */
export interface ValidationResult {
  readonly valid: boolean
  readonly errors: readonly string[]
}

function formatEndpoint(ep: Endpoint): string {
  return `${ep.row}[${ep.pos}]`
}

function isValidEndpoint(ep: Endpoint, rank: number): boolean {
  return Number.isInteger(ep.pos) && ep.pos >= 0 && ep.pos < rank
}

/**
 * Decide whether a diagram is planar, i.e. drawable in the rectangle with no
 * crossing arcs. Mapping endpoints to boundary indices (see
 * {@link boundaryIndex}) reduces this to the classical chord-diagram test: two
 * arcs `[a,b]` and `[c,d]` (each written low->high) cross precisely when their
 * endpoints interleave, `a < c < b < d`.
 */
export function isPlanar(d: TLDiagram): boolean {
  const chords = d.arcs.map((arc) => {
    const a = boundaryIndex(d.rank, arc[0])
    const b = boundaryIndex(d.rank, arc[1])
    return a < b ? ([a, b] as const) : ([b, a] as const)
  })
  for (const [a, b] of chords) {
    for (const [c, e] of chords) {
      if (a < c && c < b && b < e) {
        return false
      }
    }
  }
  return true
}

/**
 * Fully validate a diagram, returning every problem found. Use
 * {@link isValidTLDiagram} for a plain boolean.
 */
export function validate(d: TLDiagram): ValidationResult {
  if (!Number.isInteger(d.rank) || d.rank < 0) {
    return { valid: false, errors: [`rank must be a non-negative integer, got ${d.rank}`] }
  }

  const errors: string[] = []

  if (d.arcs.length !== d.rank) {
    errors.push(`expected ${d.rank} arc(s), found ${d.arcs.length}`)
  }

  const degree = new Map<string, number>()
  for (const arc of d.arcs) {
    if (endpointEquals(arc[0], arc[1])) {
      errors.push(`arc at ${formatEndpoint(arc[0])} joins a point to itself`)
    }
    for (const ep of arc) {
      if (!isValidEndpoint(ep, d.rank)) {
        errors.push(`endpoint ${formatEndpoint(ep)} lies outside a rank-${d.rank} diagram`)
        continue
      }
      const key = `${ep.row}:${ep.pos}`
      degree.set(key, (degree.get(key) ?? 0) + 1)
    }
  }

  for (const row of ['top', 'bottom'] as const) {
    for (let pos = 0; pos < d.rank; pos += 1) {
      const count = degree.get(`${row}:${pos}`) ?? 0
      if (count !== 1) {
        errors.push(`point ${row}[${pos}] has degree ${count}, expected 1`)
      }
    }
  }

  if (errors.length === 0 && !isPlanar(d)) {
    errors.push('diagram is not planar: it has crossing arcs')
  }

  return { valid: errors.length === 0, errors }
}

/** Whether `d` is a valid Temperley-Lieb basis diagram. */
export function isValidTLDiagram(d: TLDiagram): boolean {
  return validate(d).valid
}
