/**
 * `@diagrammatic-lab/core` - a pure, UI-independent algebra engine for
 * diagrammatic algebra. It carries the math for every playground - Temperley-Lieb
 * diagrams, the Mobius / finite-group machinery, and the Coxeter (symmetric
 * group) combinatorics - with no UI or DOM dependencies.
 */

// Temperley-Lieb diagrams.
export type { Arc, Endpoint, Row, TLDiagram, TLProduct } from '@core/diagram'
export {
  boundaryIndex,
  diagram,
  diagramEquals,
  diagramKey,
  endpoint,
  endpointEquals,
  fromBoundaryIndex,
  generator,
  identity
} from '@core/diagram'

export type { ValidationResult } from '@core/validate'
export { isPlanar, isValidTLDiagram, validate } from '@core/validate'

export { catalan, enumerateBasis } from '@core/catalan'

export { multiply } from '@core/multiply'

// Mobius transformations and the finite subgroups of PSL(2, C).
export * from '@core/mobius'
export * from '@core/mobius-symmetry'

// Coxeter groups: the symmetric group S_n, length, reduced words, Bruhat order.
export * from '@core/coxeter'
