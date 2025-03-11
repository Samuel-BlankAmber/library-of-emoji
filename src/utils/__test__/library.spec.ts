import { describe, it, expect } from 'vitest'

import { N } from '../constants'
import {
  getAllEmojis,
  genConstants,
  getBookContents,
  getBookIndex,
  getRandomBookWithContents,
} from '../library'
import { randBetween } from 'bigint-crypto-utils'

describe('getAllEmojis', () => {
  it('returns an array of emojis', () => {
    const emojis = getAllEmojis()
    expect(emojis).toBeInstanceOf(Array)
    expect(emojis.length).toBeGreaterThan(0)
  })
})

describe('genConstants', () => {
  it('calculated N matches stored N', () => {
    // If this fails, then that means the constants need updated.
    const { N: actualN } = genConstants()
    expect(actualN).toBe(N)
  })
})

describe('getBookContents and getBookIndex', () => {
  it('getBookIndex(getBookContents(x)) === x', () => {
    const index = randBetween(N, 1n)
    const bookContents = getBookContents(index)
    const newIndex = getBookIndex(bookContents)
    expect(newIndex).toBe(index)
  })

  it('getBookContents(getBookIndex(x)) === x', () => {
    const bookContents = ['👍', '👎', '👌']
    const index = getBookIndex(bookContents)
    const newBookContents = getBookContents(index)
    expect(newBookContents).toEqual(bookContents)
  })
})

describe('getRandomBookWithContents', () => {
  it('preserves book contents query', () => {
    const bookContents = ['👍', '👎', '👌']
    const newBookContents = getRandomBookWithContents(bookContents)
    let isSlicePresent = false
    for (let i = 0; i < newBookContents.length - bookContents.length; i++) {
      if (newBookContents.slice(i, i + bookContents.length).join('') === bookContents.join('')) {
        isSlicePresent = true
        break
      }
    }
    expect(isSlicePresent).toBe(true)
  })
})
