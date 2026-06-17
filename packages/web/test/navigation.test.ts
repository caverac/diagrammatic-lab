import { HOME_ROUTE, parseHash, toHash } from '../src/router'
import { documentTitle, findTool } from '../src/tools'

describe('parseHash', () => {
  it('reads the route id out of a hash', () => {
    expect(parseHash('#/temperley-lieb')).toBe('temperley-lieb')
    expect(parseHash('#temperley-lieb')).toBe('temperley-lieb')
  })

  it('treats an empty or bare hash as the home route', () => {
    expect(parseHash('')).toBe(HOME_ROUTE)
    expect(parseHash('#/')).toBe(HOME_ROUTE)
  })
})

describe('toHash', () => {
  it('builds a hash for a route id', () => {
    expect(toHash('coxeter')).toBe('#/coxeter')
  })
})

describe('findTool', () => {
  it('finds a registered tool', () => {
    expect(findTool('temperley-lieb')?.status).toBe('available')
  })

  it('returns undefined for an unknown id', () => {
    expect(findTool('nope')).toBeUndefined()
  })
})

describe('documentTitle', () => {
  it('names the active tool, falling back to the app name', () => {
    expect(documentTitle('temperley-lieb')).toBe('Temperley–Lieb · diagrammatic-lab')
    expect(documentTitle('')).toBe('diagrammatic-lab')
    expect(documentTitle('nope')).toBe('diagrammatic-lab')
  })
})
