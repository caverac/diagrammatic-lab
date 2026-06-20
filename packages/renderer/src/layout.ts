/**
 * Geometry shared by the rendering back-ends.
 *
 * Nodes sit on two horizontal rows; an arc is drawn as a cubic Bezier curve.
 * Through-strands (joining the two rows) curve gently, while cups and caps
 * (joining points on the same row) bulge into the strip so the diagram reads
 * the way it is drawn in the book.
 */

import { type Endpoint, type TLDiagram } from '@diagrammatic-lab/core'

/** A point in rendering coordinates. */
export interface Point {
  readonly x: number
  readonly y: number
}

/** The four control points of the cubic Bezier drawn for one arc. */
export interface ArcGeometry {
  readonly start: Point
  readonly control1: Point
  readonly control2: Point
  readonly end: Point
}

/** Tunable spacing for a rendered diagram (all values in user units). */
export interface LayoutOptions {
  readonly nodeGap: number
  readonly rowGap: number
  readonly margin: number
}

export const defaultLayout: LayoutOptions = {
  nodeGap: 40,
  rowGap: 80,
  margin: 20
}

/** The pixel position of a boundary point. */
export function pointOf(ep: Endpoint, options: LayoutOptions): Point {
  const x = options.margin + ep.pos * options.nodeGap
  const y = ep.row === 'top' ? options.margin : options.margin + options.rowGap
  return { x, y }
}

/** The total drawing size for a diagram of the given rank. */
export function canvasSize(
  rank: number,
  options: LayoutOptions
): { width: number; height: number } {
  const width = 2 * options.margin + Math.max(rank - 1, 0) * options.nodeGap
  const height = 2 * options.margin + options.rowGap
  return { width, height }
}

/** The Bezier control points for the arc joining two endpoints. */
export function arcGeometry(a: Endpoint, b: Endpoint, options: LayoutOptions): ArcGeometry {
  const start = pointOf(a, options)
  const end = pointOf(b, options)
  if (a.row === b.row) {
    const bulge = options.rowGap / 2
    const y = a.row === 'top' ? start.y + bulge : start.y - bulge
    return {
      start,
      control1: { x: start.x, y },
      control2: { x: end.x, y },
      end
    }
  }
  const midY = (start.y + end.y) / 2
  return {
    start,
    control1: { x: start.x, y: midY },
    control2: { x: end.x, y: midY },
    end
  }
}

/** All arc geometries of a diagram, in order. */
export function diagramGeometry(d: TLDiagram, options: LayoutOptions): ArcGeometry[] {
  return d.arcs.map((arc) => arcGeometry(arc[0], arc[1], options))
}
