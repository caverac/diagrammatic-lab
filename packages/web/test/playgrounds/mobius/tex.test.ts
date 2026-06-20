import { classLabel, complexTex, groupName, groupTex } from '../../../src/playgrounds/mobius/tex'

describe('groupTex', () => {
  it('renders each family, parameterized where relevant', () => {
    expect(groupTex('cyclic', 6)).toBe('C_{6}')
    expect(groupTex('dihedral', 4)).toBe('D_{4}')
    expect(groupTex('tetrahedral', 5)).toBe('A_4')
    expect(groupTex('octahedral', 5)).toBe('S_4')
    expect(groupTex('icosahedral', 5)).toBe('A_5')
  })
})

describe('groupName', () => {
  it('names every family', () => {
    expect(groupName('cyclic')).toBe('Cyclic')
    expect(groupName('dihedral')).toBe('Dihedral')
    expect(groupName('tetrahedral')).toBe('Tetrahedral')
    expect(groupName('octahedral')).toBe('Octahedral')
    expect(groupName('icosahedral')).toBe('Icosahedral')
  })
})

describe('classLabel', () => {
  it('capitalizes a conjugacy class', () => {
    expect(classLabel('elliptic')).toBe('Elliptic')
    expect(classLabel('loxodromic')).toBe('Loxodromic')
  })
})

describe('complexTex', () => {
  it('formats both signs of the imaginary part', () => {
    expect(complexTex(1.5, 0.5)).toBe('1.50 + 0.50i')
    expect(complexTex(1.5, -0.5)).toBe('1.50 - 0.50i')
  })
})
