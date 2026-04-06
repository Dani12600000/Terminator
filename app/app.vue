<template>
  <div class="min-h-screen bg-neutral-900 text-white flex flex-col">
    <!-- Header -->
    <header class="border-b border-neutral-700 py-4 px-4 flex items-center justify-center relative">
      <h1 class="text-2xl font-bold tracking-widest uppercase text-white">Terminator</h1>
      <p class="absolute right-4 text-xs text-neutral-500 hidden sm:block">Solver para o Termo</p>
    </header>

    <main class="flex-1 flex flex-col lg:flex-row gap-8 items-start justify-center p-6 max-w-3xl mx-auto w-full">
      <!-- Left: game board + input -->
      <div class="flex flex-col items-center gap-6 w-full lg:w-auto">
        <GameBoard
          :rows="rows"
          :currentRow="currentRow"
          @cellClick="handleCellClick"
        />

        <!-- Input area -->
        <div class="flex flex-col gap-3 w-full max-w-xs">
          <div class="flex gap-2">
            <input
              v-model="inputWord"
              type="text"
              maxlength="5"
              placeholder="Palavra tentada..."
              class="flex-1 bg-neutral-800 border border-neutral-600 text-white text-center uppercase tracking-widest font-bold text-lg rounded-lg px-3 py-2.5 outline-none focus:border-neutral-400 placeholder:text-neutral-600 placeholder:normal-case placeholder:tracking-normal placeholder:font-normal placeholder:text-base"
              @keydown.enter="submitAttempt"
              @input="sanitizeInput"
            />
          </div>

          <!-- Color legend -->
          <div class="flex gap-2 text-xs text-neutral-400 justify-center">
            <div class="flex items-center gap-1">
              <span class="w-4 h-4 rounded bg-neutral-600 inline-block"></span> Clique para alternar
            </div>
          </div>

          <!-- State toggle hint -->
          <div class="flex gap-2 justify-center text-xs">
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-neutral-600 inline-block"></span> cinzento</span>
            <span class="text-neutral-600">→</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-yellow-500 inline-block"></span> amarelo</span>
            <span class="text-neutral-600">→</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-green-600 inline-block"></span> verde</span>
          </div>

          <div class="flex gap-2 mt-1">
            <button
              class="flex-1 bg-green-700 hover:bg-green-600 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg transition-colors uppercase tracking-wider text-sm"
              :disabled="inputWord.length !== 5 || currentRow >= 6"
              @click="submitAttempt"
            >
              Confirmar
            </button>
            <button
              class="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-2.5 rounded-lg transition-colors uppercase tracking-wider text-sm"
              @click="reset"
            >
              Resetar
            </button>
          </div>
        </div>
      </div>

      <!-- Right: suggestions -->
      <div class="w-full lg:w-64 lg:pt-2">
        <SuggestionList
          :suggestions="suggestions"
          :candidates="candidateCount"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { Cell } from '~/components/GameBoard.vue'
import type { LetterState, Attempt } from '~/utils/solver'
import { filterCandidates, getSuggestions } from '~/utils/solver'

const ROWS = 6
const COLS = 5

function emptyRow(): Cell[] {
  return Array.from({ length: COLS }, () => ({ letter: '', state: 'empty' as LetterState }))
}

const rows = ref<Cell[][]>(Array.from({ length: ROWS }, emptyRow))
const currentRow = ref(0)
const inputWord = ref('')
const attempts = ref<Attempt[]>([])
const suggestions = ref<string[]>([])
const candidateCount = ref(0)

function sanitizeInput() {
  inputWord.value = inputWord.value.replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, 5)
  syncCurrentRowLetters()
}

function syncCurrentRowLetters() {
  if (currentRow.value >= ROWS) return
  const word = inputWord.value.padEnd(5, '')
  for (let i = 0; i < COLS; i++) {
    rows.value[currentRow.value][i].letter = word[i] === ' ' ? '' : word[i]
  }
}

function handleCellClick(rowIndex: number, colIndex: number) {
  const cell = rows.value[rowIndex][colIndex]
  if (!cell.letter) return
  const cycle: LetterState[] = ['absent', 'present', 'correct']
  const current = cell.state === 'empty' ? 'absent' : cell.state
  const nextIndex = (cycle.indexOf(current) + 1) % cycle.length
  cell.state = cycle[nextIndex]
}

function submitAttempt() {
  if (inputWord.value.length !== 5 || currentRow.value >= ROWS) return

  const row = currentRow.value
  const word = inputWord.value.toLowerCase()

  // Set letters and default state to absent for any still 'empty'
  for (let i = 0; i < COLS; i++) {
    rows.value[row][i].letter = word[i]
    if (rows.value[row][i].state === 'empty') {
      rows.value[row][i].state = 'absent'
    }
  }

  const attempt: Attempt = {
    word,
    results: rows.value[row].map(c => c.state),
  }

  attempts.value.push(attempt)
  currentRow.value++
  inputWord.value = ''

  // Compute suggestions
  const candidates = filterCandidates(attempts.value)
  candidateCount.value = candidates.length
  suggestions.value = getSuggestions(candidates)
}

function reset() {
  rows.value = Array.from({ length: ROWS }, emptyRow)
  currentRow.value = 0
  inputWord.value = ''
  attempts.value = []
  suggestions.value = []
  candidateCount.value = 0
}

// Init suggestions
onMounted(() => {
  const candidates = filterCandidates([])
  candidateCount.value = candidates.length
})
</script>
