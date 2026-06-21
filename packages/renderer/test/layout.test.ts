import { endpoint, generator } from '@diagrammatic-lab/core'
import {
  arcGeometry,
  canvasSize,
  defaultLayout,
  diagramGeometry,
  pointOf,
  type LayoutOptions
} from '@renderer/.'

const layout: LayoutOptions = defaultLayout

describe('pointOf', () => {
  it('places top and bottom rows on different heights', () => {
    expect(pointOf(endpoint('top', 0), layout)).toEqual({ x: 20, y: 20 })
    expect(pointOf(endpoint('bottom', 1), layout)).toEqual({ x: 60, y: 100 })
  })
})

describe('canvasSize', () => {
  it('grows with the rank', () => {
    expect(canvasSize(3, layout)).toEqual({ width: 120, height: 120 })
  })
})

describe('arcGeometry', () => {
  it('bulges a top cup downward into the strip', () => {
    const g = arcGeometry(endpoint('top', 1), endpoint('top', 2), layout)
    expect(g.control1.y).toBeGreaterThan(g.start.y)
    expect(g.control2.y).toBe(g.control1.y)
  })

  it('bulges a bottom cap upward into the strip', () => {
    const g = arcGeometry(endpoint('bottom', 1), endpoint('bottom', 2), layout)
    expect(g.control1.y).toBeLessThan(g.start.y)
  })

  it('curves a through-strand between the rows', () => {
    const g = arcGeometry(endpoint('top', 0), endpoint('bottom', 0), layout)
    expect(g.control1.y).toBe(60)
    expect(g.control2.y).toBe(60)
  })
})

describe('diagramGeometry', () => {
  it('returns one geometry per arc', () => {
    const e1 = generator(3, 1)
    expect(diagramGeometry(e1, layout)).toHaveLength(e1.arcs.length)
  })
})
