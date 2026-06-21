/**
 * The registry of playgrounds the lab offers. Adding a new module is a single
 * entry here plus a page component wired into the router in `App.tsx`.
 */

export type ToolStatus = 'available' | 'coming-soon'

export interface ToolMeta {
  /** URL slug, used as the hash route. */
  readonly id: string
  readonly name: string
  readonly tagline: string
  readonly status: ToolStatus
}

export const TOOLS: readonly ToolMeta[] = [
  {
    id: 'temperley-lieb',
    name: 'Temperley-Lieb',
    tagline: 'Multiply diagrams in $\\mathrm{TL}_n(\\delta)$ by stacking',
    status: 'available'
  },
  {
    id: 'mobius',
    name: 'Mobius & Finite Groups',
    tagline: 'Finite subgroups of $\\mathrm{PSL}_2(\\mathbb{C})$ as rotation orbits on the sphere',
    status: 'available'
  },
  {
    id: 'coxeter',
    name: 'Coxeter Groups',
    tagline: 'Reduced words, length, and Bruhat order in $S_n$',
    status: 'available'
  },
  {
    id: 'kazhdan-lusztig',
    name: 'Kazhdan-Lusztig',
    tagline: 'Bruhat intervals and the polynomials $P_{x,y}(q)$',
    status: 'coming-soon'
  },
  {
    id: 'rewriting',
    name: 'Diagram Rewriting',
    tagline: 'Apply local relations to reach a normal form',
    status: 'coming-soon'
  }
]

/** The application name, used in the document title and branding. */
export const APP_NAME = 'diagrammatic-lab'

/** Look up a tool by its route id. */
export function findTool(id: string): ToolMeta | undefined {
  return TOOLS.find((tool) => tool.id === id)
}

/** The browser tab title for a route, e.g. `Temperley-Lieb . diagrammatic-lab`. */
export function documentTitle(route: string): string {
  const tool = findTool(route)
  return tool ? `${tool.name} . ${APP_NAME}` : APP_NAME
}
