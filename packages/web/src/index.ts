/**
 * `@diagrammatic-lab/web` — the browser Temperley–Lieb explorer.
 *
 * The framework-independent view-model lives in {@link ./model}; the React
 * application that renders it is bootstrapped from `main.tsx`.
 */

export type { DiagramView, ExplorerState, ProductView } from './model'
export { buildExplorerState, computeProduct, formatCoefficient, viewOf } from './model'

export type { Theme } from './theme'
export { resolveInitialTheme, THEME_STORAGE_KEY, toggleTheme } from './theme'

export { coefficientTex, renderMath, temperleyLiebTex } from './math'

export type { SlotId } from './dnd'
export { DIAGRAM_INDEX_MIME, parseDropIndex } from './dnd'

export type { ToolMeta, ToolStatus } from './tools'
export { findTool, TOOLS } from './tools'
export { HOME_ROUTE, parseHash, toHash } from './router'
