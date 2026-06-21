/** Render a Temperley-Lieb diagram to a LaTeX/TikZ `tikzpicture`. */

import { type TLDiagram } from '@diagrammatic-lab/core'

import { arcGeometry, defaultLayout, pointOf, type LayoutOptions, type Point } from './layout'

// TikZ's y-axis points up, the opposite of SVG, so flip when emitting.
function tikz(p: Point): string {
  return `(${p.x}, ${-p.y})`
}

/** Render `d` as the body of a `tikzpicture` environment. */
export function toTikz(d: TLDiagram, options: LayoutOptions = defaultLayout): string {
  const lines: string[] = ['\\begin{tikzpicture}[line width=1pt]']

  for (const arc of d.arcs) {
    const g = arcGeometry(arc[0], arc[1], options)
    lines.push(
      `  \\draw ${tikz(g.start)} .. controls ${tikz(g.control1)} and ${tikz(g.control2)} .. ${tikz(g.end)};`
    )
  }

  for (const arc of d.arcs) {
    lines.push(`  \\fill ${tikz(pointOf(arc[0], options))} circle (2pt);`)
    lines.push(`  \\fill ${tikz(pointOf(arc[1], options))} circle (2pt);`)
  }

  lines.push('\\end{tikzpicture}')
  return lines.join('\n')
}
