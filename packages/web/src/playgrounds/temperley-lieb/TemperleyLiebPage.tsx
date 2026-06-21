import { useMemo, useState } from 'react'

import { Math } from '../../components/Math'

import { BasisPalette } from './components/BasisPalette'
import { ProductPanel, type ExportFormat } from './components/ProductPanel'
import { type SlotId } from './dnd'
import { buildExplorerState, computeProduct, type DiagramView } from './model'
import { temperleyLiebTex } from './tex'

const RANKS = [1, 2, 3, 4, 5] as const

function download(filename: string, content: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function TemperleyLiebPage() {
  const [rank, setRank] = useState(3)
  const [left, setLeft] = useState<DiagramView | null>(null)
  const [right, setRight] = useState<DiagramView | null>(null)

  const explorer = useMemo(() => buildExplorerState(rank), [rank])
  const product = useMemo(
    () => (left && right ? computeProduct(left.diagram, right.diagram) : null),
    [left, right]
  )

  function chooseRank(next: number): void {
    setRank(next)
    setLeft(null)
    setRight(null)
  }

  function select(view: DiagramView): void {
    if (!left) {
      setLeft(view)
    } else if (!right) {
      setRight(view)
    } else {
      setLeft(view)
      setRight(null)
    }
  }

  function dropToSlot(slot: SlotId, index: number): void {
    const view = explorer.basis[index]
    if (!view) {
      return
    }
    if (slot === 'left') {
      setLeft(view)
    } else {
      setRight(view)
    }
  }

  function clear(): void {
    setLeft(null)
    setRight(null)
  }

  function exportProduct(format: ExportFormat): void {
    if (!product) {
      return
    }
    if (format === 'svg') {
      download('tl-product.svg', product.svg, 'image/svg+xml')
    } else {
      download('tl-product.tikz', product.tikz, 'text/plain')
    }
  }

  return (
    <div className="py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Temperley-Lieb Playground</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-slate-600 dark:text-slate-400">
          Drag two basis diagrams of <Math tex={temperleyLiebTex(rank)} /> onto the slots below;
          their product is the diagram obtained by stacking, with one factor of{' '}
          <Math tex="\delta" /> per closed loop removed.
        </p>
      </header>

      <section className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Rank <Math tex="n" /> =
        </span>
        {RANKS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => chooseRank(value)}
            className={
              value === rank
                ? 'h-9 w-9 rounded-md bg-indigo-600 font-medium text-white shadow-sm'
                : 'h-9 w-9 rounded-md border border-slate-200 bg-white transition hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900'
            }
          >
            {value}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-500">
          {explorer.basis.length} basis diagrams (Catalan)
        </span>
      </section>

      <div className="mb-8">
        <ProductPanel
          left={left}
          right={right}
          product={product}
          onDropToSlot={dropToSlot}
          onClear={clear}
          onExport={exportProduct}
        />
      </div>

      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold tracking-wide text-slate-500 uppercase">
        Basis of <Math tex={`\\mathrm{TL}_{${rank}}`} className="normal-case" />
      </h2>
      <BasisPalette basis={explorer.basis} onSelect={select} />
    </div>
  )
}
