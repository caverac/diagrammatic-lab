import { generator, identity } from '@diagrammatic-lab/core'
import { defaultLayout, toSvg, toTikz } from '@renderer/.'

describe('toSvg', () => {
  it('emits a well-formed SVG with a path and nodes per arc', () => {
    const e1 = generator(3, 1)
    const svg = toSvg(e1)
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('</svg>')
    expect((svg.match(/<path /g) ?? []).length).toBe(e1.arcs.length)
    expect((svg.match(/<circle /g) ?? []).length).toBe(2 * e1.arcs.length)
  })

  it('honours custom layout options', () => {
    const svg = toSvg(identity(2), { ...defaultLayout, nodeGap: 100 })
    expect(svg).toContain('width="140"')
  })
})

describe('toTikz', () => {
  it('emits a tikzpicture with a draw per arc', () => {
    const e1 = generator(3, 1)
    const tikz = toTikz(e1)
    expect(tikz).toContain('\\begin{tikzpicture}')
    expect(tikz).toContain('\\end{tikzpicture}')
    expect((tikz.match(/\\draw /g) ?? []).length).toBe(e1.arcs.length)
  })

  it('honours custom layout options', () => {
    const tikz = toTikz(identity(1), { ...defaultLayout, margin: 5 })
    expect(tikz).toContain('(5, -5)')
  })
})
