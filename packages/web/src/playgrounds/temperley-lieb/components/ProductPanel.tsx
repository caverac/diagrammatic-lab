import { useState } from 'react'

import { Math } from '../../../components/Math'
import { DIAGRAM_INDEX_MIME, parseDropIndex, type SlotId } from '../dnd'
import { type DiagramView, type ProductView } from '../model'
import { coefficientTex } from '../tex'

import { DiagramFigure } from './DiagramFigure'

export type ExportFormat = 'svg' | 'tikz'

/** The two selected operands, their product, and export controls. */
export interface ProductPanelProps {
  readonly left: DiagramView | null
  readonly right: DiagramView | null
  readonly product: ProductView | null
  readonly onDropToSlot: (slot: SlotId, index: number) => void
  readonly onClear: () => void
  readonly onExport: (format: ExportFormat) => void
}

interface SlotProps {
  readonly label: string
  readonly view: DiagramView | null
  readonly onDropIndex: (index: number) => void
}

function Slot({ label, view, onDropIndex }: SlotProps) {
  const [over, setOver] = useState(false)
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'copy'
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault()
        setOver(false)
        const index = parseDropIndex(event.dataTransfer.getData(DIAGRAM_INDEX_MIME))
        if (index !== null) {
          onDropIndex(index)
        }
      }}
      className={`flex min-h-24 min-w-28 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed p-3 transition ${
        over
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
          : 'border-slate-300 dark:border-slate-700'
      }`}
    >
      <Math tex={label} className="text-xs text-slate-400" />
      {view ? (
        <DiagramFigure svg={view.svg} />
      ) : (
        <span className="text-xs text-slate-400">drop here</span>
      )}
    </div>
  )
}

const buttonClass =
  'rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500'

export function ProductPanel({
  left,
  right,
  product,
  onDropToSlot,
  onClear,
  onExport
}: ProductPanelProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-4">
        <Slot label="D_1" view={left} onDropIndex={(index) => onDropToSlot('left', index)} />
        <span className="text-2xl text-slate-400">·</span>
        <Slot label="D_2" view={right} onDropIndex={(index) => onDropToSlot('right', index)} />
        <span className="text-2xl text-slate-400">=</span>
        <div className="flex min-h-24 min-w-28 items-center justify-center gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          {product ? (
            <>
              {product.product.loops > 0 && (
                <span className="text-lg text-indigo-600 dark:text-indigo-400">
                  <Math tex={`${coefficientTex(product.product.loops)} \\cdot`} />
                </span>
              )}
              <DiagramFigure svg={product.svg} />
            </>
          ) : (
            <span className="text-sm text-slate-400">drag two diagrams</span>
          )}
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => onExport('svg')}
          disabled={!product}
          className={buttonClass}
        >
          Export SVG
        </button>
        <button
          type="button"
          onClick={() => onExport('tikz')}
          disabled={!product}
          className={buttonClass}
        >
          Export TikZ
        </button>
        <button type="button" onClick={onClear} disabled={!left && !right} className={buttonClass}>
          Clear
        </button>
      </div>
    </section>
  )
}
