<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  randInt,
  getAllEmojiSymbols,
  getRandomBookWithContents,
  getBookIndex,
  getBookContents,
  getRandomBookIndex,
} from './utils/library'
import { emojify } from 'node-emoji'
import emojiRegex from 'emoji-regex'
import Book from './components/Book.vue'

const backgroundEmojis = ['🔥', '😂', '🌈', '💀', '🚀', '🍕', '❤️', '🎸', '👽', '🌍']
const emojiCount = 300
const emojiInput = ref('')
const bookIndex = ref(0n)
const bookContents = ref<string[]>([])
const areEmojisHighlighted = ref<boolean[]>([])
const isBookVisible = ref(false)

function createEmoji(container: HTMLElement) {
  const emoji = document.createElement('div')
  emoji.classList.add('background-emoji')
  emoji.textContent = backgroundEmojis[Math.floor(Math.random() * backgroundEmojis.length)]
  emoji.style.position = 'absolute'
  emoji.style.fontSize = `${randInt(1.5, 1)}rem`
  emoji.style.left = `${randInt(0, window.innerWidth)}px`
  emoji.style.top = `${randInt(0, window.innerHeight)}px`
  emoji.style.transform = `rotate(${randInt(-5, 5)}deg)`
  emoji.style.zIndex = '-1'
  emoji.style.opacity = '0.5'
  container.appendChild(emoji)
}

function fillEmojis(container: HTMLElement) {
  for (let i = 0; i < emojiCount; i++) {
    createEmoji(container)
  }
}

function handleResize() {
  const container = document.querySelector('.container') as HTMLElement
  if (!container) return

  const emojis = document.querySelectorAll('.background-emoji')
  emojis.forEach((emoji) => emoji.remove())

  fillEmojis(container)
}

function replaceEmojiInput(event: Event) {
  let input = (event.target as HTMLTextAreaElement).value
  input = emojify(input.toLowerCase())
  emojiInput.value = input
}

function handleSearch() {
  const input = emojiInput.value
  const allowedEmojis = getAllEmojiSymbols()
  const emojis = input.match(emojiRegex()) || []
  const filteredEmojis = emojis.filter((emoji) => allowedEmojis.includes(emoji))
  const newEmojis = filteredEmojis.slice(0, 100)
  emojiInput.value = newEmojis.join('')

  const contents = getRandomBookWithContents(newEmojis)
  const index = getBookIndex(contents)

  displayBook(index, contents, newEmojis)
  setBookIdQueryParam(index)
}

function handleRandom() {
  const index = getRandomBookIndex()
  const contents = getBookContents(index)
  displayBook(index, contents)
  setBookIdQueryParam(index)
}

function setBookIdQueryParam(bookId: bigint | null) {
  const url = new URL(window.location.href)
  if (bookId === null) {
    url.searchParams.delete('bookId')
  } else {
    url.searchParams.set('bookId', bookId.toString())
  }
  window.history.pushState({}, '', url)
}

function displayBook(index: bigint, contents: string[], searchedEmojis: string[] = []) {
  bookIndex.value = index
  bookContents.value = contents
  areEmojisHighlighted.value = getHighlightedEmojiBooleans(contents, searchedEmojis)
  isBookVisible.value = true
}

function getHighlightedEmojiBooleans(contents: string[], searchedEmojis: string[]) {
  const areEmojisHighlighted = contents.map(() => false)
  if (searchedEmojis.length === 0) return areEmojisHighlighted
  if (contents.length === searchedEmojis.length) return contents.map(() => true)

  let searchEmojiIndex = 0
  let foundSearchEmojiIndexes = []
  let contentsIndex = 0
  for (const emoji of contents) {
    if (emoji == searchedEmojis[searchEmojiIndex]) {
      foundSearchEmojiIndexes.push(contentsIndex)
      searchEmojiIndex++
    } else if (foundSearchEmojiIndexes.length > 0) {
      if (foundSearchEmojiIndexes.length == searchedEmojis.length) {
        for (const index of foundSearchEmojiIndexes) {
          areEmojisHighlighted[index] = true
        }
        return areEmojisHighlighted
      } else {
        searchEmojiIndex = 0
        foundSearchEmojiIndexes = []
      }
    }
    contentsIndex++
  }

  throw new Error('Searched emojis not found in contents')
}

function handleBookClose() {
  setBookIdQueryParam(null)
  handleQueryParams()
}

function handleQueryParams() {
  const queryParams = new URLSearchParams(window.location.search)
  if (queryParams.has('bookId')) {
    const bookId = queryParams.get('bookId')!
    const index = BigInt(bookId)
    const contents = getBookContents(index)
    displayBook(index, contents)
  } else {
    isBookVisible.value = false
  }
}

onMounted(() => {
  const container = document.querySelector('.container') as HTMLElement
  if (!container) return

  fillEmojis(container)

  window.addEventListener('resize', handleResize)

  handleQueryParams()
  window.addEventListener('popstate', handleQueryParams)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="container">
    <h1>Library of Emoji</h1>
    <textarea
      v-model="emojiInput"
      @input="replaceEmojiInput"
      placeholder="Enter up to 100 emojis"
      rows="6"
    ></textarea>
    <div>
      <button @click="handleSearch">Search</button>
      <button @click="handleRandom">Random</button>
    </div>
    <p>
      The Library of Emoji is a vast, incomprehensible digital abyss containing every possible
      combination of emojis ever conceived—and many that should never have been. Need a 📖 but only
      find 🍆💦🔞? That’s just how it works. Somewhere in its infinite scroll, there exists a
      perfectly structured essay written entirely in 🍔🔥🤖, explaining the meaning of life. But
      good luck finding it—you’re more likely to stumble upon an unreadable string of 🦄💩🚀
      repeated for eternity. Scholars spend their days lost in its depths, seeking wisdom but mostly
      finding an infinite cascade of 😂😂😂
    </p>
    <p>PS: Type emojis like :fire: if you don't want to copy paste</p>
    <p>
      Visit my site at <a href="https://samuelb.dev" target="_blank" rel="noopener">samuelb.dev</a>
      <br />
      Thanks to
      <a href="https://libraryofbabel.app" target="_blank" rel="noopener">libraryofbabel.app</a> for
      the inspiration!
    </p>
  </div>
  <Book
    v-if="isBookVisible"
    @close="handleBookClose"
    :index="bookIndex"
    :contents="bookContents"
    :areEmojisHighlighted="areEmojisHighlighted"
  />
</template>

<style scoped>
.container {
  position: fixed;
  width: 100vw;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  text-align: center;
}

h1 {
  font-size: 4rem;
  text-shadow: 0 0 10px rgba(250, 250, 250, 0.7);
}

p {
  max-width: 50%;
  color: rgb(255, 255, 255);
  background-color: rgba(0, 0, 0, 0.9);
  border-radius: 0.5rem;
  padding: 10px;
  margin: 0.1rem;
}

textarea {
  font-size: 1.5rem;
  padding: 0.5rem;
  margin: 0.5rem;
  border: 2px solid #000;
  border-radius: 0.5rem;
  box-sizing: border-box;
  width: 50%;
}

button {
  font-size: 1.5rem;
  padding: 0.5rem 1rem;
  margin: 0.3rem;
  border: 2px solid rgb(246, 214, 93);
  border-radius: 0.5rem;
  background-color: #000;
  color: #fff;
  cursor: pointer;
}
</style>
