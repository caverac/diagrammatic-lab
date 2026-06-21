/**
 * The view-model for the diagrammatic rewriting playground. It folds the current
 * Temperley-Lieb word into its basis diagram (the invariant the rewriting
 * preserves) and renders it to SVG. All the algebra lives in the core engine;
 * this file only pairs the result with a picture.
 */

import { productOfWord, type Word } from '@diagrammatic-lab/core'
import { toSvg } from '@diagrammatic-lab/renderer'

/** The rendered state of a rewriting: the word, the diagram, and the delta power. */
export interface RewriteView {
  readonly word: Word
  /** The power of delta already released by applied moves. */
  readonly delta: number
  /** SVG of the basis diagram the word folds to (unchanged by any move). */
  readonly svg: string
  /** The total power of delta: released so far plus loops still inside the word. */
  readonly totalDelta: number
}

/** Build the view for a word with `delta` already released. */
export function viewOf(n: number, word: Word, delta: number): RewriteView {
  const product = productOfWord(n, word)
  return { word, delta, svg: toSvg(product.diagram), totalDelta: delta + product.loops }
}
