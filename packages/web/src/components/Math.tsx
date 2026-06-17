import { renderMath } from '../math'

/** Typeset an inline (or display) LaTeX fragment with KaTeX. */
export interface MathProps {
  readonly tex: string
  readonly display?: boolean
  readonly className?: string
}

export function Math({ tex, display = false, className }: MathProps) {
  return (
    <span className={className} dangerouslySetInnerHTML={{ __html: renderMath(tex, display) }} />
  )
}
