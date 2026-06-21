import { oneLine } from '@diagrammatic-lab/core'

import { type BruhatGraph } from '../model'

/**
 * The Bruhat order of S_n as an interactive Hasse diagram. Nodes are ranked by
 * length; clicking one selects it and the page highlights its Bruhat interval
 * `[e, w]` (every permutation below it), drawn here in the accent color.
 */
export interface BruhatDiagramProps {
  readonly graph: BruhatGraph
  readonly size: number
  readonly selected: number | null
  /** Node indices in the interval below the selection. */
  readonly below: ReadonlySet<number>
  readonly onSelect: (index: number) => void
}

const VIEW_W = 680
const PAD = 26

export function BruhatDiagram({ graph, size, selected, below, onSelect }: BruhatDiagramProps) {
  const rows = graph.maxLength + 1
  const viewH = 60 + rows * 64
  const px = (x: number): number => PAD + x * (VIEW_W - 2 * PAD)
  // Rank 0 (the identity) sits at the bottom; w_0 at the top.
  const py = (y: number): number => viewH - PAD - y * (viewH - 2 * PAD)

  const pillWidth = graph.nodes.length > 0 ? graph.nodes[0].perm.length * 10 + 16 : 24

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${viewH}`}
      style={{ width: size, maxWidth: '100%', height: 'auto' }}
      className="touch-none select-none"
    >
      {graph.edges.map(([lower, upper], index) => {
        const inInterval = below.has(lower) && below.has(upper)
        const a = graph.nodes[lower]
        const b = graph.nodes[upper]
        return (
          <line
            key={index}
            x1={px(a.x)}
            y1={py(a.y)}
            x2={px(b.x)}
            y2={py(b.y)}
            stroke={inInterval ? 'rgb(99, 102, 241)' : 'rgb(203, 213, 225)'}
            strokeWidth={inInterval ? 1.6 : 1}
          />
        )
      })}

      {graph.nodes.map((node, index) => {
        const cx = px(node.x)
        const cy = py(node.y)
        const isSelected = index === selected
        const isBelow = below.has(index)
        const fill = isSelected
          ? 'rgb(79, 70, 229)'
          : isBelow
            ? 'rgb(224, 231, 255)'
            : 'rgb(255, 255, 255)'
        const textColor = isSelected ? 'rgb(255, 255, 255)' : 'rgb(30, 41, 59)'
        return (
          <g key={index} onClick={() => onSelect(index)} className="cursor-pointer">
            <rect
              x={cx - pillWidth / 2}
              y={cy - 11}
              width={pillWidth}
              height={22}
              rx={11}
              fill={fill}
              stroke={isSelected || isBelow ? 'rgb(99, 102, 241)' : 'rgb(203, 213, 225)'}
              strokeWidth={1}
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
