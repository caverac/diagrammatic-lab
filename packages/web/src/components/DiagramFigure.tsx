/** Render a pre-generated SVG diagram string into the DOM. */
export interface DiagramFigureProps {
  readonly svg: string
  readonly className?: string
}

export function DiagramFigure({ svg, className = '' }: DiagramFigureProps) {
  return (
    <span
      className={`text-slate-700 dark:text-slate-200 [&_svg]:block ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
