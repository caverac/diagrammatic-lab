import { type ReactNode } from 'react'

/**
 * The wiring (braid) diagram of a reduced word: `n` strands read left to right,
 * each generator `s_i` crossing the strands on tracks `i` and `i+1`. Colors
 * follow each strand, so the final order is the permutation the word builds -
 * the diagrammatic face of a Coxeter element.
 */
export interface WiringDiagramProps {
  readonly n: number
  readonly word: readonly number[]
  readonly size: number
}

const PALETTE = [
  'rgb(79, 70, 229)', // indigo
  'rgb(5, 150, 105)', // emerald
  'rgb(217, 119, 6)', // amber
  'rgb(225, 29, 72)', // rose
  'rgb(2, 132, 199)', // sky
  'rgb(124, 58, 237)' // violet
]

const PAD = 18
const GAP = 30
const COL = 46
const STROKE = 2.5

export function WiringDiagram({ n, word, size }: WiringDiagramProps) {
  const columns = Math.max(word.length, 1)
  const viewW = PAD * 2 + columns * COL
  const viewH = PAD * 2 + (n - 1) * GAP
  const yOf = (track: number): number => PAD + track * GAP
  const color = (strand: number): string => PALETTE[strand % PALETTE.length]

  const strands = Array.from({ length: n }, (_, i) => i)
  const elements: ReactNode[] = []

  word.forEach((letter, c) => {
    const x0 = PAD + c * COL
    const x1 = x0 + COL
    const mid = (x0 + x1) / 2
    for (let track = 0; track < n; track += 1) {
      if (track === letter || track === letter + 1) {
        continue
      }
      elements.push(
        <line
          key={`s${c}-${track}`}
          x1={x0}
          y1={yOf(track)}
          x2={x1}
          y2={yOf(track)}
          stroke={color(strands[track])}
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
      )
    }
    const top = yOf(letter)
    const bottom = yOf(letter + 1)
    const upper = strands[letter]
    const lower = strands[letter + 1]
    elements.push(
      <path
        key={`x${c}-a`}
        d={`M ${x0} ${top} C ${mid} ${top}, ${mid} ${bottom}, ${x1} ${bottom}`}
        fill="none"
        stroke={color(upper)}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />,
      <path
        key={`x${c}-b`}
        d={`M ${x0} ${bottom} C ${mid} ${bottom}, ${mid} ${top}, ${x1} ${top}`}
        fill="none"
        stroke={color(lower)}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    )
    ;[strands[letter], strands[letter + 1]] = [lower, upper]
  })

  if (word.length === 0) {
    for (let track = 0; track < n; track += 1) {
      elements.push(
        <line
          key={`flat-${track}`}
          x1={PAD}
          y1={yOf(track)}
          x2={PAD + COL}
          y2={yOf(track)}
          stroke={color(track)}
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
      )
    }
  }

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      style={{ width: Math.min(size, viewW), maxWidth: '100%', height: 'auto' }}
      className="select-none"
    >
      {elements}
    </svg>
  )
}
