import { bruhatGraph } from '../../../src/playgrounds/coxeter/model'

describe('bruhatGraph layout', () => {
  it('ranks S_3 by length with the poset covers as edges', () => {
    const graph = bruhatGraph(3)
    expect(graph.nodes).toHaveLength(6)
    expect(graph.edges).toHaveLength(8)
    expect(graph.maxLength).toBe(3)
  })

  it('places the identity at the bottom and spreads each rank across the width', () => {
    const graph = bruhatGraph(3)
    const identity = graph.nodes[0]
    expect(identity.length).toBe(0)
    expect(identity.y).toBe(0)
    for (const node of graph.nodes) {
      expect(node.x).toBeGreaterThan(0)
      expect(node.x).toBeLessThan(1)
    }
    // w_0 is the unique top rank.
    expect(graph.nodes[graph.nodes.length - 1].y).toBe(1)
  })
})
