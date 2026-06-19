import { DIAGRAM_INDEX_MIME } from '../dnd'
import { type DiagramView } from '../model'

import { DiagramFigure } from './DiagramFigure'

/** A draggable palette diagram: a clipped thumbnail that reveals the full
 *  diagram in a popover on hover, and can be dragged onto an operand slot. */
export interface DiagramCardProps {
  readonly view: DiagramView
  readonly index: number
  readonly onSelect: (view: DiagramView) => void
}

export function DiagramCard({ view, index, onSelect }: DiagramCardProps) {
  return (
    <div className="group relative">
      <button
        type="button"
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData(DIAGRAM_INDEX_MIME, String(index))
          event.dataTransfer.setData('text/plain', String(index))
          event.dataTransfer.effectAllowed = 'copy'
        }}
        onClick={() => onSelect(view)}
        title={`basis diagram ${index + 1} — drag onto a slot`}
        className="flex h-24 w-full cursor-grab items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-2 shadow-sm transition hover:border-indigo-400 hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-500"
      >
        <DiagramFigure svg={view.svg} />
      </button>

      {/* Full diagram, revealed on hover. */}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 group-hover:block">
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <DiagramFigure svg={view.svg} />
        </div>
      </div>
    </div>
  )
}
