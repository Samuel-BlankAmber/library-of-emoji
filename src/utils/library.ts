import { BOOK_LENGTH, N, C, I } from './constants'

import * as emoji from 'node-emoji'
import { randBetween, gcd, modInv } from 'bigint-crypto-utils'

interface Emoji {
  emoji: string
  name: string
}

export function getAllEmojis(): Emoji[] {
  return emoji.search('') as Emoji[]
}

export function genConstants() {
  const NUM_EMOJIS = getAllEmojis().length
  const N = BigInt(NUM_EMOJIS) ** BigInt(BOOK_LENGTH)
  let C = N
  while (gcd(N, C) !== 1n) {
    C = randBetween(N, 1n)
  }
  const I = modInv(C, N)
  return { N, C, I }
}

export function getBookContents(bookIndex: bigint) {
  let bookContentValue = (bookIndex * C) % N
  const emojis = getAllEmojis()
  const bookContent = []
  while (bookContentValue > 0n) {
    bookContent.push(emojis[Number(bookContentValue % BigInt(emojis.length))].emoji)
    bookContentValue /= BigInt(emojis.length)
  }
  return bookContent
}

export function getBookIndex(bookContents: string[]) {
  const emojis = getAllEmojis()
  let bookIndex = 0n
  for (let i = 0; i < bookContents.length; i++) {
    const index = BigInt(emojis.findIndex((emoji) => emoji.emoji === bookContents[i]))
    if (index < 0 || index >= emojis.length) {
      throw new Error('Invalid index found in book contents: ' + index)
    }
    bookIndex += index * BigInt(emojis.length) ** BigInt(i)
  }
  return (bookIndex * I) % N
}

export function getRandomBookIndex() {
  return randBetween(N, 1n)
}

export function randInt(max: number, min: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randEmoji(emojis: Emoji[]) {
  return emojis[randInt(emojis.length - 1, 0)]
}

export function getRandomBookWithContents(bookContents: string[]) {
  const rightPadding = randInt(BOOK_LENGTH - bookContents.length, 0)
  const leftPadding = BOOK_LENGTH - bookContents.length - rightPadding
  if (leftPadding + bookContents.length + rightPadding !== BOOK_LENGTH) {
    throw new Error('Padding calculation error')
  }

  const emojis = getAllEmojis()
  const fullBookContent = []
  for (let i = 0; i < leftPadding; i++) {
    fullBookContent.push(randEmoji(emojis).emoji)
  }
  fullBookContent.push(...bookContents)
  for (let i = 0; i < rightPadding; i++) {
    fullBookContent.push(randEmoji(emojis).emoji)
  }
  if (fullBookContent.length !== BOOK_LENGTH) {
    throw new Error('Full book content length error')
  }

  return fullBookContent
}

export function getRandomBookIndexWithContents(bookContent: string[]) {
  return getBookIndex(getRandomBookWithContents(bookContent))
}
