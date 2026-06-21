import { oneLine } from '@diagrammatic-lab/core'

import { type KLView } from '@/playgrounds/kazhdan-lusztig/model'

/**
 * The Bruhat interval `[e, y]` as a Hasse diagram, colored by Kazhdan-Lusztig
 * data: nodes outside the interval are faint, smooth nodes (`P = 1`) are light,
 * and singular nodes (`P != 1`) are amber. The top element `y` is outlined and
 * the inspected element `x` is filled.
 */
export interface KLDiagramProps {
  readonly view: KLView
  readonly size: number
  readonly selected: number
  readonly onSelect: (index: number) => void
}

const VIEW_W = 680
const PAD = 26

export function KLDiagram({ view, size, selected, onSelect }: KLDiagramProps) {
  const rows = view.maxLength + 1
  const viewH = 60 + rows * 64
  const px = (x: number): number => PAD + x * (VIEW_W - 2 * PAD)
  const py = (y: number): number => viewH - PAD - y * (viewH - 2 * PAD)
  const pillWidth = view.nodes.length > 0 ? view.nodes[0].perm.length * 10 + 16 : 24

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${viewH}`}
      style={{ width: size, maxWidth: '100%', height: 'auto' }}
      className="touch-none select-none"
    >
      {view.edges.map(([lower, upper], index) => {
        const inside = view.nodes[lower].inInterval && view.nodes[upper].inInterval
        const a = view.nodes[lower]
        const b = view.nodes[upper]
        return (
          <line
            key={index}
            x1={px(a.x)}
            y1={py(a.y)}
            x2={px(b.x)}
            y2={py(b.y)}
            stroke={inside ? 'rgb(129, 140, 248)' : 'rgb(226, 232, 240)'}
            strokeWidth={inside ? 1.5 : 1}
          />
        )
      })}

      {view.nodes.map((node) => {
        const cx = px(node.x)
        const cy = py(node.y)
        const isSelected = node.index === selected
        const isTop = node.index === view.topIndex

        let fill = 'rgb(248, 250, 252)' // faint: outside the interval
        let textColor = 'rgb(148, 163, 184)'
        if (isSelected) {
          fill = 'rgb(79, 70, 229)'
          textColor = 'rgb(255, 255, 255)'
        } else if (node.nontrivial) {
          fill = 'rgb(254, 215, 170)' // amber-200: singular
          textColor = 'rgb(154, 52, 18)'
        } else if (node.inInterval) {
          fill = 'rgb(224, 231, 255)' // indigo-100: smooth
          textColor = 'rgb(30, 41, 59)'
        }

        const stroke = isTop
          ? 'rgb(79, 70, 229)'
          : node.nontrivial
            ? 'rgb(234, 88, 12)'
            : node.inInterval
              ? 'rgb(129, 140, 248)'
              : 'rgb(226, 232, 240)'

        return (
          <g key={node.index} onClick={() => onSelect(node.index)} className="cursor-pointer">
            <rect
              x={cx - pillWidth / 2}
              y={cy - 11}
              width={pillWidth}
              height={22}
              rx={11}
              fill={fill}
              stroke={stroke}
              strokeWidth={isTop ? 2.5 : 1}
            />
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              fontSize={12}
              fontFamily="ui-monospace, monospace"
              fill={textColor}
            >
              {oneLine(node.perm)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
