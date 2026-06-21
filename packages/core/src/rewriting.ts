/**
 * Diagrammatic rewriting in the Temperley-Lieb algebra.
 *
 * A word in the generators e_0, ..., e_{n-2} is rewritten to a normal form by
 * the three defining relations, applied as local moves:
 *
 *   loop:     e_i e_i        -> delta * e_i
 *   contract: e_i e_{i+-1} e_i -> e_i
 *   commute:  e_i e_j        =  e_j e_i      (|i - j| >= 2)
 *
 * Every move preserves the algebra element (loop records one factor of delta),
 * so reducing a word and stacking it into a diagram give the same answer - which
 * is exactly the correctness test in `rewriting.test.ts`.
 */

import { generator, identity, type TLProduct } from '@core/diagram'
import { multiply } from '@core/multiply'

/** A word in the Temperley-Lieb generators, by generator index. */
export type Word = readonly number[]

/** The kind of local relation a move applies. */
export type MoveKind = 'loop' | 'contract' | 'commute'

/** A local rewrite move: apply `kind` at position `at` of the word. */
export interface Move {
  readonly kind: MoveKind
  readonly at: number
}

/** Whether two generators are adjacent (`|i - j| = 1`). */
function adjacent(a: number, b: number): boolean {
  return Math.abs(a - b) === 1
}

/** Whether two generators are far apart (`|i - j| >= 2`), so they commute. */
function distant(a: number, b: number): boolean {
  return Math.abs(a - b) >= 2
}

/** Every rewrite move applicable to `word`, scanning left to right. */
export function applicableMoves(word: Word): Move[] {
  const moves: Move[] = []
  for (let i = 0; i < word.length; i += 1) {
    if (i + 1 < word.length) {
      if (word[i] === word[i + 1]) {
        moves.push({ kind: 'loop', at: i })
      } else if (distant(word[i], word[i + 1])) {
        moves.push({ kind: 'commute', at: i })
      }
    }
    if (i + 2 < word.length && word[i] === word[i + 2] && adjacent(word[i], word[i + 1])) {
      moves.push({ kind: 'contract', at: i })
    }
  }
  return moves
}

/** The result of a move: the new word and the power of delta it released. */
export interface MoveResult {
  readonly word: Word
  /** `1` for a loop (one factor of delta), `0` otherwise. */
  readonly delta: number
}

/** Apply a move to a word. */
export function applyMove(word: Word, move: Move): MoveResult {
  const { kind, at } = move
  if (kind === 'loop') {
    // e_i e_i -> delta e_i: drop one of the pair.
    return { word: [...word.slice(0, at), word[at], ...word.slice(at + 2)], delta: 1 }
  }
  if (kind === 'contract') {
    // e_i e_j e_i -> e_i: keep the first, drop the next two.
    return { word: [...word.slice(0, at), word[at], ...word.slice(at + 3)], delta: 0 }
  }
  // commute: swap the adjacent pair.
  const swapped = [...word]
  ;[swapped[at], swapped[at + 1]] = [swapped[at + 1], swapped[at]]
  return { word: swapped, delta: 0 }
}

/** A single step of a reduction: the move applied and the state after it. */
export interface RewriteStep {
  readonly move: Move
  readonly word: Word
  /** The cumulative power of delta after this step. */
  readonly delta: number
}

/** A length-reducing move (loop or contract), if one is available. */
function reducingMove(word: Word): Move | undefined {
  return applicableMoves(word).find((m) => m.kind === 'loop' || m.kind === 'contract')
}

/** A commute that exposes a length-reducing move, if one is available. */
function enablingCommute(word: Word): Move | undefined {
  return applicableMoves(word)
    .filter((m) => m.kind === 'commute')
    .find((m) => reducingMove(applyMove(word, m).word) !== undefined)
}

/**
 * Greedily reduce a word, returning the derivation as a list of steps. Each
 * round applies a loop or contract when possible, otherwise a commute that
 * exposes one; it stops at a reduced word. The process terminates because every
 * commute is immediately followed by a length-reducing move.
 */
export function reduce(word: Word): RewriteStep[] {
  const steps: RewriteStep[] = []
  let current = word
  let delta = 0
  for (let move = reducingMove(current) ?? enablingCommute(current); move !== undefined; ) {
    const result = applyMove(current, move)
    current = result.word
    delta += result.delta
    steps.push({ move, word: current, delta })
    move = reducingMove(current) ?? enablingCommute(current)
  }
  return steps
}

/**
 * Stack a word of generators into its Temperley-Lieb diagram, accumulating the
 * power of delta from every closed loop. This is the normal form the rewriting
 * converges to: `delta^loops * diagram`.
 */
export function productOfWord(n: number, word: Word): TLProduct {
  let loops = 0
  let diagram = identity(n)
  for (const i of word) {
    const product = multiply(diagram, generator(n, i))
    loops += product.loops
    diagram = product.diagram
  }
  return { loops, diagram }
}
