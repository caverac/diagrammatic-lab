/**
 * `@diagrammatic-lab/core` - a pure, UI-independent algebra engine for
 * diagrammatic algebra. It carries the math for every playground - Temperley-Lieb
 * diagrams, the Mobius / finite-group machinery, and the Coxeter (symmetric
 * group) combinatorics - with no UI or DOM dependencies.
 */

// Temperley-Lieb diagrams.
export type { Arc, Endpoint, Row, TLDiagram, TLProduct } from './diagram'
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
} from './diagram'

export type { ValidationResult } from './validate'
export { isPlanar, isValidTLDiagram, validate } from './validate'

export { catalan, enumerateBasis } from './catalan'

export { multiply } from './multiply'

// Mobius transformations and the finite subgroups of PSL(2, C).
export * from './mobius'
export * from './mobius-symmetry'

// Coxeter groups: the symmetric group S_n, length, reduced words, Bruhat order.
export * from './coxeter'
