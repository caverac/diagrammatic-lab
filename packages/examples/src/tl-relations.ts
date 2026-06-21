/**
 * Worked example: the defining relations of the Temperley-Lieb algebra.
 *
 * For `TL_3(delta)` with generators `e_0, e_1` this prints the three relations
 *
 *   e_i . e_i        = delta . e_i
 *   e_i . e_{i+-1}.e_i = e_i
 *   e_i . e_j         = e_j . e_i        (|i - j| >= 2, shown in TL_4)
 *
 * computed by the core engine, and renders `e_1` to TikZ via the renderer.
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

/** Render `delta^loops . label` the way it is written in the book. */
export function formatTLProduct(result: TLProduct, label: string): string {
  if (result.loops === 0) {
    return label
  }
  if (result.loops === 1) {
    return `delta . ${label}`
  }
  return `delta^${result.loops} . ${label}`
}

/** Multiply a chain of diagrams, accumulating the power of delta. */
export function chain(first: TLDiagram, ...rest: TLDiagram[]): TLProduct {
  return rest.reduce<TLProduct>(
    (acc, next) => {
      const step = multiply(acc.diagram, next)
      return { loops: acc.loops + step.loops, diagram: step.diagram }
    },
    { loops: 0, diagram: first }
  )
}

/** Print the Temperley-Lieb relations and a rendering of `e_1`. */
export function runDemo(): void {
  const e0 = generator(3, 0)
  const e1 = generator(3, 1)

  console.log('Temperley-Lieb relations in TL_3(delta):')
  console.log(`  e0 . e0       = ${formatTLProduct(multiply(e0, e0), 'e0')}`)
  console.log(`  e0 . e1 . e0  = ${formatTLProduct(chain(e0, e1, e0), 'e0')}`)
  console.log(`  e1 . e0 . e1  = ${formatTLProduct(chain(e1, e0, e1), 'e1')}`)
  console.log(`  1  . e1       = ${formatTLProduct(multiply(identity(3), e1), 'e1')}`)

  const f0 = generator(4, 0)
  const f2 = generator(4, 2)
  const commutes = diagramEquals(multiply(f0, f2).diagram, multiply(f2, f0).diagram)
  console.log(`\nFar-apart generators commute in TL_4(delta)?  e0 . e2 = e2 . e0  ->  ${commutes}`)

  console.log('\nTikZ for e1 in TL_3:')
  console.log(toTikz(e1))
}

if (require.main === module) {
  runDemo()
}
