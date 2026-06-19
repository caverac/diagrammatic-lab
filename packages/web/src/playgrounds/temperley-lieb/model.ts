/**
 * The framework-independent view-model for the Temperley–Lieb playground.
 *
 * Everything the UI needs is computed here as plain data — basis palettes,
 * products, and rendered SVG/TikZ — so the React layer stays thin and this
 * logic is unit-tested without a DOM.
 */

import { enumerateBasis, multiply, type TLDiagram, type TLProduct } from '@diagrammatic-lab/core'
import { toSvg, toTikz } from '@diagrammatic-lab/renderer'

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

/** A computed product `D₁ · D₂ = δ^k · D₃`, rendered for display. */
export interface ProductView {
  readonly product: TLProduct
  readonly svg: string
  readonly tikz: string
}

/** Render a diagram to SVG and pair it with the diagram itself. */
export function viewOf(diagram: TLDiagram): DiagramView {
  return { diagram, svg: toSvg(diagram) }
}

/** Build the basis palette for `TL_rank`. */
export function buildExplorerState(rank: number): ExplorerState {
  return { rank, basis: enumerateBasis(rank).map(viewOf) }
}

/** Multiply two diagrams and render the result for display. */
export function computeProduct(a: TLDiagram, b: TLDiagram): ProductView {
  const product = multiply(a, b)
  return {
    product,
    svg: toSvg(product.diagram),
    tikz: toTikz(product.diagram)
  }
}
