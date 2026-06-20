/**
 * `@diagrammatic-lab/renderer` - turn a {@link TLDiagram} into pictures.
 *
 * {@link toSvg} produces a standalone SVG document; {@link toTikz} produces a
 * `tikzpicture` for inclusion in LaTeX notes. Both share the geometry exposed
 * by {@link arcGeometry} and friends.
 */

export type { ArcGeometry, LayoutOptions, Point } from './layout'
export { arcGeometry, canvasSize, defaultLayout, diagramGeometry, pointOf } from './layout'

export { toSvg } from './svg'
export { toTikz } from './tikz'
