import { catalan, generator, identity } from '@diagrammatic-lab/core'

import {
  buildExplorerState,
  computeProduct,
  viewOf
} from '../../../src/playgrounds/temperley-lieb/model'

describe('viewOf', () => {
  it('pairs a diagram with its SVG', () => {
    const view = viewOf(identity(2))
    expect(view.diagram.rank).toBe(2)
    expect(view.svg.startsWith('<svg')).toBe(true)
  })
})

describe('buildExplorerState', () => {
  it('builds a palette of C_n rendered basis diagrams', () => {
    const state = buildExplorerState(3)
    expect(state.rank).toBe(3)
    expect(state.basis).toHaveLength(catalan(3))
    expect(state.basis.every((v) => v.svg.includes('<path'))).toBe(true)
  })
})

describe('computeProduct', () => {
  it('renders e_i . e_i = delta . e_i (one loop removed)', () => {
    const e0 = generator(3, 0)
    const view = computeProduct(e0, e0)
    expect(view.product.loops).toBe(1)
    expect(view.svg.startsWith('<svg')).toBe(true)
    expect(view.tikz).toContain('\\begin{tikzpicture}')
  })

  it('renders a loop-free product', () => {
    const view = computeProduct(identity(3), generator(3, 1))
    expect(view.product.loops).toBe(0)
  })
})
