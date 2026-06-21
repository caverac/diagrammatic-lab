/**
 * `@diagrammatic-lab/renderer` - turn a {@link TLDiagram} into pictures.
 *
 * {@link toSvg} produces a standalone SVG document; {@link toTikz} produces a
 * `tikzpicture` for inclusion in LaTeX notes. Both share the geometry exposed
 * by {@link arcGeometry} and friends.
 */

export type { ArcGeometry, LayoutOptions, Point } from '@renderer/layout'
export { arcGeometry, canvasSize, defaultLayout, diagramGeometry, pointOf } from '@renderer/layout'

export { toSvg } from '@renderer/svg'
export { toTikz } from '@renderer/tikz'
