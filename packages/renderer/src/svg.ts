/** Render a Temperley–Lieb diagram to a standalone SVG string. */

import { type TLDiagram } from '@diagrammatic-lab/core'

import {
  arcGeometry,
  canvasSize,
  defaultLayout,
  pointOf,
  type LayoutOptions,
  type Point
} from './layout'

function nodeCircle(p: Point): string {
  return `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#1d2433" />`
}

/** Render `d` as an SVG document. */
export function toSvg(d: TLDiagram, options: LayoutOptions = defaultLayout): string {
  const { width, height } = canvasSize(d.rank, options)

  const paths = d.arcs.map((arc) => {
    const g = arcGeometry(arc[0], arc[1], options)
    const path = `M ${g.start.x} ${g.start.y} C ${g.control1.x} ${g.control1.y} ${g.control2.x} ${g.control2.y} ${g.end.x} ${g.end.y}`
    return `<path d="${path}" fill="none" stroke="#1d2433" stroke-width="2" />`
  })

  const nodes: string[] = []
  for (const arc of d.arcs) {
    nodes.push(nodeCircle(pointOf(arc[0], options)))
    nodes.push(nodeCircle(pointOf(arc[1], options)))
  }

  const body = [...paths, ...nodes].map((line) => `  ${line}`).join('\n')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n${body}\n</svg>`
}
