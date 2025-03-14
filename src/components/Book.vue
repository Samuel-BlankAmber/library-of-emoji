<script setup lang="ts">
import { computed } from '@vue/reactivity'

const emit = defineEmits(['close'])

const props = defineProps<{
  index: bigint
  contents: string[]
  areEmojisHighlighted: boolean[]
}>()

const bookMessage = computed(() => {
  return props.index <= 0n ? 'Book IDs are positive!' : `📖Book Number: ${props.index.toString()}`
})

const shareBook = () => {
  const url = window.location.href
  navigator.clipboard
    .writeText(url)
    .then(() => {
      alert('Book URL copied to clipboard!')
    })
    .catch((err) => {
      console.error('Failed to copy: ', err)
    })
}
</script>

<template>
  <div class="book">
    <button class="close-button" @click="emit('close')">✖</button>
    <h1 class="book-number">{{ bookMessage }}</h1>
    <p class="contents">
      <span v-for="(emoji, i) in contents" :key="i" :class="{ highlight: areEmojisHighlighted[i] }">
        {{ emoji }}
      </span>
    </p>
    <button class="share-button" @click="shareBook">Share Book</button>
  </div>
</template>

<style scoped>
.book {
  position: fixed;
  width: 100vw;
  height: 100dvh;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #8b4513;
  padding: 20px;
  box-sizing: border-box;
  text-align: center;
}

.book-number {
  font-size: 1rem;
  color: white;
  margin-bottom: 10px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 90%;
  white-space: normal;
}

.contents {
  font-size: 2rem;
  text-align: center;
  line-height: 1.5;
  white-space: pre-wrap;
  max-width: 90%;
  word-wrap: break-word;
}

.highlight {
  background-color: yellow;
  border-radius: 5px;
  padding: 2px;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: white;
}

.close-button:hover {
  color: red;
}

.share-button {
  margin-top: 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 5px;
}

.share-button:hover {
  background-color: #45a049;
}
</style>
