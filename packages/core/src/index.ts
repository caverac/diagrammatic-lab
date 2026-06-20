/**
 * `@diagrammatic-lab/core` - a pure, UI-independent algebra engine for
 * Temperley-Lieb diagrams.
 *
 * The public surface: the {@link TLDiagram} data model and its constructors,
 * {@link validate | validation}, {@link catalan | Catalan enumeration} of the
 * basis, and {@link multiply | diagram multiplication}.
 */

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
