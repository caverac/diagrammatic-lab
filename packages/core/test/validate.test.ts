import {
  diagram,
  endpoint,
  generator,
  identity,
  isPlanar,
  isValidTLDiagram,
  validate,
  type Arc
} from '@core/.'

const crossing: Arc[] = [
  [endpoint('top', 0), endpoint('bottom', 1)],
  [endpoint('top', 1), endpoint('bottom', 0)]
]

describe('isPlanar', () => {
  it('accepts non-crossing diagrams', () => {
    expect(isPlanar(identity(3))).toBe(true)
    expect(isPlanar(generator(3, 1))).toBe(true)
  })

  it('rejects crossing diagrams', () => {
    expect(isPlanar(diagram(2, crossing))).toBe(false)
  })
})

describe('validate', () => {
  it('accepts genuine basis diagrams', () => {
    expect(validate(identity(3))).toEqual({ valid: true, errors: [] })
    expect(isValidTLDiagram(generator(4, 2))).toBe(true)
  })

  it('rejects a non-integer or negative rank early', () => {
    expect(validate(diagram(1.5, [])).valid).toBe(false)
    expect(validate(diagram(-1, [])).valid).toBe(false)
  })

  it('flags the wrong number of arcs', () => {
    const result = validate(diagram(2, [[endpoint('top', 0), endpoint('bottom', 0)]]))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('expected 2 arc'))).toBe(true)
  })

  it('flags endpoints outside the diagram', () => {
    const result = validate(diagram(1, [[endpoint('top', 0), endpoint('bottom', 5)]]))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('outside'))).toBe(true)
  })

  it('flags an arc that joins a point to itself', () => {
    const result = validate(diagram(1, [[endpoint('top', 0), endpoint('top', 0)]]))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('itself'))).toBe(true)
  })

  it('flags points whose degree is not one', () => {
    const result = validate(
      diagram(2, [
        [endpoint('top', 0), endpoint('top', 1)],
        [endpoint('top', 0), endpoint('top', 1)]
      ])
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('degree'))).toBe(true)
  })

  it('flags crossing arcs only once the structure is otherwise sound', () => {
    const result = validate(diagram(2, crossing))
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('diagram is not planar: it has crossing arcs')
  })
})
