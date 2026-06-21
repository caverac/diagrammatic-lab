import { DiagramCard } from '@/playgrounds/temperley-lieb/components/DiagramCard'
import { type DiagramView } from '@/playgrounds/temperley-lieb/model'

/** The palette of all `TL_n` basis diagrams, each draggable onto a slot. */
export interface BasisPaletteProps {
  readonly basis: readonly DiagramView[]
  readonly onSelect: (view: DiagramView) => void
}

export function BasisPalette({ basis, onSelect }: BasisPaletteProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3">
      {basis.map((view, index) => (
        <DiagramCard key={index} view={view} index={index} onSelect={onSelect} />
      ))}
    </div>
  )
}
