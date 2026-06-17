/**
 * Multiplication in the Temperley–Lieb algebra.
 *
 * To multiply `D₁ · D₂` we stack `D₁` on top of `D₂` and glue the bottom row of
 * `D₁` to the top row of `D₂`. Tracing the resulting strands gives a new
 * diagram on the outer boundary (the top of `D₁` and the bottom of `D₂`), while
 * every closed loop that forms in the middle contributes one factor of the loop
 * parameter `δ`. Thus `D₁ · D₂ = δ^loops · D₃`.
 *
 * Internally we build the gluing as a graph on `4n` vertices in which every
 * outer point has degree one and every middle point has degree two, so the
 * graph is a disjoint union of paths (the new strands) and cycles (the loops).
 */

import {
  diagram,
  endpoint,
  type Arc,
  type Endpoint,
  type TLDiagram,
  type TLProduct
} from './diagram'

/**
 * Multiply two diagrams of equal rank. Returns the resulting basis diagram
 * together with the number of closed loops removed (the power of `δ`).
 */
export function multiply(a: TLDiagram, b: TLDiagram): TLProduct {
  if (a.rank !== b.rank) {
    throw new RangeError(`cannot multiply diagrams of rank ${a.rank} and ${b.rank}`)
  }

  const n = a.rank
  const size = 4 * n
  const adjacency: number[][] = Array.from({ length: size }, () => [])

  // Vertex numbering: A-top [0, n), A-bottom [n, 2n), B-top [2n, 3n), B-bottom [3n, 4n).
  const idA = (ep: Endpoint): number => (ep.row === 'top' ? ep.pos : n + ep.pos)
  const idB = (ep: Endpoint): number => (ep.row === 'top' ? 2 * n + ep.pos : 3 * n + ep.pos)
  const addEdge = (u: number, v: number): void => {
    adjacency[u].push(v)
    adjacency[v].push(u)
  }

  for (const [p, q] of a.arcs) {
    addEdge(idA(p), idA(q))
  }
  for (const [p, q] of b.arcs) {
    addEdge(idB(p), idB(q))
  }
  for (let i = 0; i < n; i += 1) {
    addEdge(n + i, 2 * n + i) // A-bottom[i] glued to B-top[i]
  }

  const isExternal = (node: number): boolean => node < n || node >= 3 * n
  const toEndpoint = (node: number): Endpoint =>
    node < n ? endpoint('top', node) : endpoint('bottom', node - 3 * n)

  const visited = new Array<boolean>(size).fill(false)
  const arcs: Arc[] = []

  // Trace each outer strand from one boundary point to the other.
  for (let start = 0; start < size; start += 1) {
    if (!isExternal(start) || visited[start]) {
      continue
    }
    visited[start] = true
    let from = start
    let cur = adjacency[start].filter((x) => x !== from)[0]
    while (!isExternal(cur)) {
      visited[cur] = true
      const next = adjacency[cur].filter((x) => x !== from)[0]
      from = cur
      cur = next
    }
    visited[cur] = true
    arcs.push([toEndpoint(start), toEndpoint(cur)])
  }

  // Whatever middle vertices remain form the closed loops.
  let loops = 0
  for (let node = 0; node < size; node += 1) {
    if (visited[node]) {
      continue
    }
    loops += 1
    const stack = [node]
    visited[node] = true
    while (stack.length > 0) {
      const v = stack.pop() as number
      for (const w of adjacency[v]) {
        if (!visited[w]) {
          visited[w] = true
          stack.push(w)
        }
      }
    }
  }

  return { loops, diagram: diagram(n, arcs) }
}
