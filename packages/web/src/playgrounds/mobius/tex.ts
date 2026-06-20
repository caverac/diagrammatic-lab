/** Mobius-specific LaTeX fragments, rendered by the shared `<Math>`. */

import { type GroupId, type MobiusClass } from './model'

/**
 * LaTeX for a finite rotation group. The cyclic and dihedral families take the
 * order parameter `n`; the polyhedral families are fixed.
 */
export function groupTex(id: GroupId, n: number): string {
  switch (id) {
    case 'cyclic':
      return `C_{${n}}`
    case 'dihedral':
      return `D_{${n}}`
    case 'tetrahedral':
      return 'A_4'
    case 'octahedral':
      return 'S_4'
    default:
      return 'A_5'
  }
}

/** A human-readable name for a finite rotation group. */
export function groupName(id: GroupId): string {
  switch (id) {
    case 'cyclic':
      return 'Cyclic'
    case 'dihedral':
      return 'Dihedral'
    case 'tetrahedral':
      return 'Tetrahedral'
    case 'octahedral':
      return 'Octahedral'
    default:
      return 'Icosahedral'
  }
}

/** The conjugacy class of a Mobius transformation, capitalized for display. */
export function classLabel(klass: MobiusClass): string {
  return klass.charAt(0).toUpperCase() + klass.slice(1)
}

/** LaTeX for a complex number, e.g. `1.50 - 0.25i`, rounded for display. */
export function complexTex(re: number, im: number): string {
  const r = re.toFixed(2)
  const sign = im < 0 ? '-' : '+'
  return `${r} ${sign} ${Math.abs(im).toFixed(2)}i`
}
