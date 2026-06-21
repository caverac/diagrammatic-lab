import { parseInlineMath } from '../math'

import { Math } from './Math'

/** Render a string that mixes prose with inline `$...$` LaTeX (typeset by KaTeX). */
export interface MathTextProps {
  readonly children: string
}

export function MathText({ children }: MathTextProps) {
  return (
    <>
      {parseInlineMath(children).map((segment, index) =>
        segment.type === 'math' ? (
          <Math key={index} tex={segment.value} />
        ) : (
          <span key={index}>{segment.value}</span>
        )
      )}
    </>
  )
}
