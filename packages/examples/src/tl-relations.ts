/**
 * Worked example: the defining relations of the Temperley–Lieb algebra.
 *
 * For `TL_3(δ)` with generators `e₀, e₁` this prints the three relations
 *
 *   e_i · e_i        = δ · e_i
 *   e_i · e_{i±1}·e_i = e_i
 *   e_i · e_j         = e_j · e_i        (|i − j| ≥ 2, shown in TL_4)
 *
 * computed by the core engine, and renders `e₁` to TikZ via the renderer.
 */

import {
  diagramEquals,
  generator,
  identity,
  multiply,
  type TLDiagram,
  type TLProduct
} from '@diagrammatic-lab/core'
import { toTikz } from '@diagrammatic-lab/renderer'

/** Render `δ^loops · label` the way it is written in the book. */
export function formatTLProduct(result: TLProduct, label: string): string {
  if (result.loops === 0) {
    return label
  }
  if (result.loops === 1) {
    return `δ · ${label}`
  }
  return `δ^${result.loops} · ${label}`
}

/** Multiply a chain of diagrams, accumulating the power of δ. */
export function chain(first: TLDiagram, ...rest: TLDiagram[]): TLProduct {
  return rest.reduce<TLProduct>(
    (acc, next) => {
      const step = multiply(acc.diagram, next)
      return { loops: acc.loops + step.loops, diagram: step.diagram }
    },
    { loops: 0, diagram: first }
  )
}

/** Print the Temperley–Lieb relations and a rendering of `e₁`. */
export function runDemo(): void {
  const e0 = generator(3, 0)
  const e1 = generator(3, 1)

  console.log('Temperley–Lieb relations in TL_3(δ):')
  console.log(`  e0 · e0       = ${formatTLProduct(multiply(e0, e0), 'e0')}`)
  console.log(`  e0 · e1 · e0  = ${formatTLProduct(chain(e0, e1, e0), 'e0')}`)
  console.log(`  e1 · e0 · e1  = ${formatTLProduct(chain(e1, e0, e1), 'e1')}`)
  console.log(`  1  · e1       = ${formatTLProduct(multiply(identity(3), e1), 'e1')}`)

  const f0 = generator(4, 0)
  const f2 = generator(4, 2)
  const commutes = diagramEquals(multiply(f0, f2).diagram, multiply(f2, f0).diagram)
  console.log(`\nFar-apart generators commute in TL_4(δ)?  e0 · e2 = e2 · e0  →  ${commutes}`)

  console.log('\nTikZ for e1 ∈ TL_3:')
  console.log(toTikz(e1))
}

if (require.main === module) {
  runDemo()
}
