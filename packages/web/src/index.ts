/**
 * `@diagrammatic-lab/web` — the browser Temperley–Lieb explorer.
 *
 * Phase 2 (per `notebooks/notes/logs/20260616-idea.md`) is the React UI: choose
 * a rank `n`, pick two basis diagrams, stack them, animate loop removal, and
 * show `δ^k · D` with SVG/TikZ export.
 *
 * To keep that UI thin and testable, the framework-independent state it will
 * render is assembled here in `@diagrammatic-lab/web` and exercised by the core
 * and renderer test suites. The React layer, when added, should consume
 * {@link buildExplorerState} and own nothing but presentation.
 */

import { enumerateBasis, type TLDiagram } from '@diagrammatic-lab/core'
import { toSvg } from '@diagrammatic-lab/renderer'

/** One basis diagram together with its rendered SVG, ready for display. */
export interface DiagramView {
  readonly diagram: TLDiagram
  readonly svg: string
}

/** The view-model for the basis palette at a given rank. */
export interface ExplorerState {
  readonly rank: number
  readonly basis: readonly DiagramView[]
}

/** Build the framework-independent explorer state for `TL_rank`. */
export function buildExplorerState(rank: number): ExplorerState {
  const basis = enumerateBasis(rank).map((diagram) => ({ diagram, svg: toSvg(diagram) }))
  return { rank, basis }
}
