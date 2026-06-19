/** Drag-and-drop wiring for moving basis diagrams onto the product slots. */

/** The `dataTransfer` type under which a dragged diagram's basis index travels. */
export const DIAGRAM_INDEX_MIME = 'application/x-tl-diagram-index'

/** The two droppable operand slots. */
export type SlotId = 'left' | 'right'

/**
 * Parse a dropped basis index from its `dataTransfer` string, returning `null`
 * for anything that is not a non-negative integer (e.g. a foreign drag).
 */
export function parseDropIndex(raw: string): number | null {
  if (raw === '') {
    return null
  }
  const index = Number(raw)
  return Number.isInteger(index) && index >= 0 ? index : null
}
