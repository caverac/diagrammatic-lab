/**
 * The view-model for the Kazhdan-Lusztig playground. It pairs the pure Bruhat
 * layout (reused from the Coxeter playground) with the KL polynomials P_{x,y}
 * from the engine, marking which nodes of the interval [e, y] are "singular"
 * (carry a non-trivial polynomial). All the mathematics lives in the core
 * engine; this file only assembles per-node display data.
 */

import { createKLContext, type Permutation, type Polynomial } from '@diagrammatic-lab/core'

import { bruhatGraph } from '@/playgrounds/coxeter/model'

/** A polynomial is trivial when it equals the constant 1. */
export function isTrivial(p: Polynomial): boolean {
  return p.length === 1 && p[0] === 1
}

/** One laid-out node together with its Kazhdan-Lusztig data relative to `y`. */
export interface KLNodeView {
  readonly index: number
  readonly perm: Permutation
  readonly length: number
  readonly x: number
  readonly y: number
  /** Whether this node is `<= y`, i.e. lies in the interval `[e, y]`. */
  readonly inInterval: boolean
  /** `P_{node, y}(q)`; the empty polynomial when the node is not in the interval. */
  readonly polynomial: Polynomial
  /** Whether the polynomial is non-trivial (the node is a singular point). */
  readonly nontrivial: boolean
}

/** The laid-out interval below a chosen top element `y`, with KL data. */
export interface KLView {
  readonly nodes: readonly KLNodeView[]
  readonly edges: readonly [number, number][]
  readonly maxLength: number
  readonly topIndex: number
}

/** Build the KL view for S_n with `topIndex` selecting the top element `y`. */
export function buildKLView(n: number, topIndex: number): KLView {
  const graph = bruhatGraph(n)
  const kl = createKLContext(n)
  const top = graph.nodes[topIndex].perm
  const nodes: KLNodeView[] = graph.nodes.map((node, index) => {
    const polynomial = kl.polynomial(node.perm, top)
    const inInterval = polynomial.length > 0
    return {
      index,
      perm: node.perm,
      length: node.length,
      x: node.x,
      y: node.y,
      inInterval,
      polynomial,
      nontrivial: inInterval && !isTrivial(polynomial)
    }
  })
  return { nodes, edges: graph.edges, maxLength: graph.maxLength, topIndex }
}

/**
 * The singular elements of S_n: the `w` whose Schubert variety is singular,
 * detected by `P_{e, w}` being non-trivial. Empty for `n <= 3`.
 */
export function singularElements(n: number): number[] {
  const graph = bruhatGraph(n)
  const kl = createKLContext(n)
  const e = graph.nodes[0].perm
  const result: number[] = []
  graph.nodes.forEach((node, index) => {
    if (!isTrivial(kl.polynomial(e, node.perm))) {
      result.push(index)
    }
  })
  return result
}

/** The default top element: the first singular element, or `w_0` if there is none. */
export function defaultTopIndex(n: number): number {
  const singular = singularElements(n)
  return singular.length > 0 ? singular[0] : bruhatGraph(n).nodes.length - 1
}
