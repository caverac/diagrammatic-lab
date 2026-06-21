import { viewOf } from '@/playgrounds/rewriting/model'

describe('viewOf', () => {
  it('renders the folded diagram and the total delta power', () => {
    // e_1 e_1 folds to delta * e_1: one loop still inside the word.
    const view = viewOf(4, [0, 0], 0)
    expect(view.svg.startsWith('<svg')).toBe(true)
    expect(view.totalDelta).toBe(1)
  })

  it('adds released delta to the loops still inside the word', () => {
    // After applying the loop move, the word is [0] with one delta released.
    const view = viewOf(4, [0], 1)
    expect(view.totalDelta).toBe(1)
    expect(view.delta).toBe(1)
  })
})
