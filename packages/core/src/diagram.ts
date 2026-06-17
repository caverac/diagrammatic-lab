/**
 * The data model for Temperley–Lieb diagrams.
 *
 * A Temperley–Lieb diagram of rank `n` is a planar (non-crossing) perfect
 * matching of `2n` points: `n` on the top row and `n` on the bottom row, each
 * point joined to exactly one other by an arc. The set of such diagrams is a
 * basis of the Temperley–Lieb algebra `TL_n(δ)`, whose dimension is the
 * Catalan number `C_n`.
 */

/** The two rows of boundary points a diagram lives between. */
export type Row = 'top' | 'bottom'

/** A boundary point: a position on either the top or bottom row. */
export interface Endpoint {
  readonly row: Row
  readonly pos: number
}

/** An arc joins two distinct endpoints. */
export type Arc = readonly [Endpoint, Endpoint]

/** A Temperley–Lieb diagram: a rank together with its `n` arcs. */
export interface TLDiagram {
  readonly rank: number
  readonly arcs: readonly Arc[]
}

/**
 * The result of multiplying two diagrams: a single basis diagram scaled by a
 * power of the loop parameter `δ`. `D₁ · D₂ = δ^loops · diagram`.
 */
export interface TLProduct {
  readonly loops: number
  readonly diagram: TLDiagram
}

/** Construct an endpoint. */
export function endpoint(row: Row, pos: number): Endpoint {
  return { row, pos }
}

/** Structural equality of endpoints. */
export function endpointEquals(a: Endpoint, b: Endpoint): boolean {
  return a.row === b.row && a.pos === b.pos
}

/**
 * Map an endpoint to its index along the boundary of the rectangle, walking
 * clockwise: across the top row left→right (`0 … n-1`), then down and back
 * across the bottom row right→left (`n … 2n-1`). This linearisation is what
 * turns "planar" into the combinatorial condition of a non-crossing chord
 * diagram (see {@link isPlanar}).
 */
export function boundaryIndex(rank: number, ep: Endpoint): number {
  return ep.row === 'top' ? ep.pos : 2 * rank - 1 - ep.pos
}

/** Inverse of {@link boundaryIndex}. */
export function fromBoundaryIndex(rank: number, index: number): Endpoint {
  return index < rank ? endpoint('top', index) : endpoint('bottom', 2 * rank - 1 - index)
}

/** Construct a diagram from arcs. Validity is checked separately. */
export function diagram(rank: number, arcs: readonly Arc[]): TLDiagram {
  return { rank, arcs }
}

/**
 * The identity diagram `1 ∈ TL_n`: every top point joined straight down to the
 * bottom point in the same column.
 */
export function identity(rank: number): TLDiagram {
  const arcs: Arc[] = []
  for (let i = 0; i < rank; i += 1) {
    arcs.push([endpoint('top', i), endpoint('bottom', i)])
  }
  return diagram(rank, arcs)
}

/**
 * The Temperley–Lieb generator `e_i ∈ TL_n` (with `0 ≤ i ≤ n-2`): a "cup"
 * joining the top points `i, i+1`, a "cap" joining the bottom points `i, i+1`,
 * and a vertical through-strand in every other column.
 */
export function generator(rank: number, i: number): TLDiagram {
  if (!Number.isInteger(i) || i < 0 || i > rank - 2) {
    throw new RangeError(`generator index ${i} out of range for rank ${rank}`)
  }
  const arcs: Arc[] = [
    [endpoint('top', i), endpoint('top', i + 1)],
    [endpoint('bottom', i), endpoint('bottom', i + 1)]
  ]
  for (let j = 0; j < rank; j += 1) {
    if (j !== i && j !== i + 1) {
      arcs.push([endpoint('top', j), endpoint('bottom', j)])
    }
  }
  return diagram(rank, arcs)
}

/**
 * A canonical string key for a diagram, used for structural equality. Each arc
 * is recorded as its sorted pair of boundary indices; the arcs themselves are
 * then sorted, so the key is independent of arc and endpoint ordering.
 */
export function diagramKey(d: TLDiagram): string {
  const keys = d.arcs.map((arc) => {
    const a = boundaryIndex(d.rank, arc[0])
    const b = boundaryIndex(d.rank, arc[1])
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    return `${lo}-${hi}`
  })
  keys.sort()
  return `n${d.rank}:${keys.join(',')}`
}

/** Structural equality of diagrams, independent of arc ordering. */
export function diagramEquals(a: TLDiagram, b: TLDiagram): boolean {
  return a.rank === b.rank && diagramKey(a) === diagramKey(b)
}
