/**
 * The view-model for the Coxeter playground: it lays out the pure Bruhat poset
 * from the engine into screen-independent coordinates for the Hasse diagram.
 * The group theory itself lives in `@diagrammatic-lab/core`; this file only
 * adds the visual ranking, so the UI stays a thin layer.
 */

import { bruhatPoset, type Permutation } from '@diagrammatic-lab/core'

/** A poset node placed for drawing, with a normalized layout position. */
export interface BruhatNode {
  readonly perm: Permutation
  readonly length: number
  /** Horizontal position within the rank, in `(0, 1)`. */
  readonly x: number
  /** Vertical position by rank, in `[0, 1]`; the identity is at `0`. */
  readonly y: number
}

/** The laid-out Bruhat Hasse diagram of S_n: positioned nodes and covering edges. */
export interface BruhatGraph {
  readonly nodes: readonly BruhatNode[]
  readonly edges: readonly [number, number][]
  readonly maxLength: number
}

/**
 * Lay out the Bruhat order of S_n for drawing: rank by length (the identity at
 * the bottom), and spread each rank evenly across the width.
 */
export function bruhatGraph(n: number): BruhatGraph {
  const poset = bruhatPoset(n)

  const byLength = new Map<number, number[]>()
  poset.nodes.forEach((node, index) => {
    const bucket = byLength.get(node.length)
    if (bucket === undefined) {
      byLength.set(node.length, [index])
    } else {
      bucket.push(index)
    }
  })

  const nodes: BruhatNode[] = poset.nodes.map((node, index) => {
    const rankMembers = byLength.get(node.length) as number[]
    const position = rankMembers.indexOf(index)
    return {
      perm: node.perm,
      length: node.length,
      x: (position + 1) / (rankMembers.length + 1),
      y: node.length / poset.maxLength
    }
  })

  return { nodes, edges: poset.covers, maxLength: poset.maxLength }
}
