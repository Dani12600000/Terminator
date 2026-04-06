<template>
  <div class="min-h-screen bg-neutral-900 text-white flex flex-col">
    <!-- Header -->
    <header class="border-b border-neutral-700 py-4 px-4 flex items-center justify-center relative">
      <img :src="logoPath" alt="Terminator Logo" class="h-8 w-8 mr-3" />
      <h1 class="text-3xl font-bold tracking-widest uppercase text-white font-mono">Terminator</h1>
      <p class="absolute right-4 text-xs text-neutral-500 hidden sm:block">Solver para o Termo</p>
    </header>

    <!-- Mode Selector -->
    <div class="flex justify-center gap-2 mt-6">
      <button 
        v-for="m in modes" 
        :key="m.value"
        @click="setMode(m.value)"
        class="px-4 py-1 rounded text-sm font-bold uppercase tracking-wider transition-colors"
        :class="mode === m.value ? 'bg-green-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'"
      >
        {{ m.label }}
      </button>
    </div>

    <main class="flex-1 flex flex-col gap-8 items-center p-6 w-full max-w-6xl mx-auto pb-8">
      <!-- Boards Grid -->
      <div class="flex flex-wrap justify-center gap-x-12 gap-y-8 w-full">
        <div v-for="(board, bIdx) in boards" :key="bIdx" class="flex flex-col xl:flex-row gap-6 items-start">
          <div class="flex flex-col items-center gap-2">
             <div class="text-sm font-bold text-neutral-500 tracking-widest uppercase mb-1">Palavra {{ bIdx + 1 }}</div>
             <GameBoard
              :rows="board.rows"
              :currentRow="currentRow"
              @cellClick="(rIdx, cIdx) => handleCellClick(bIdx, rIdx, cIdx)"
            />
          </div>
          <!-- Suggestions for this board -->
          <div class="w-full xl:w-48 pt-8">
            <SuggestionList
              :suggestions="board.suggestions"
              :candidates="board.candidateCount"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Input area sticky at bottom -->
    <div class="sticky bottom-0 left-0 right-0 w-full bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-700 p-4 py-6 flex flex-col items-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 mt-auto">
      <div class="flex flex-col gap-3 w-full max-w-md">
        <div class="flex gap-2">
          <input
            v-model="inputWord"
            type="text"
            maxlength="5"
            placeholder="ESCREVA AQUI..."
            class="flex-1 bg-neutral-800 border-2 border-neutral-600 text-white text-center uppercase tracking-[0.3em] font-bold text-xl rounded-lg px-3 py-3 outline-none focus:border-neutral-400 placeholder:text-neutral-600 placeholder:normal-case placeholder:tracking-normal placeholder:font-normal placeholder:text-base transition-colors"
            @keydown.enter="submitAttempt"
            @input="sanitizeInput"
          />
        </div>

        <!-- Color legend -->
        <div class="flex gap-4 justify-center text-xs font-medium">
          <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded bg-neutral-600 inline-block"></span> cinzento</div>
          <span class="text-neutral-600">→</span>
          <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded bg-yellow-500 inline-block"></span> amarelo</div>
          <span class="text-neutral-600">→</span>
          <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded bg-green-600 inline-block"></span> verde</div>
        </div>

        <div class="flex gap-2 mt-2">
          <button
            class="flex-[2] bg-green-600 hover:bg-green-500 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:border-neutral-700 disabled:border disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all uppercase tracking-wider text-sm shadow-lg disabled:shadow-none"
            :disabled="inputWord.length !== 5 || currentRow >= maxRows"
            @click="submitAttempt"
          >
            Confirmar
          </button>
          <button
            class="flex-1 bg-yellow-600 hover:bg-yellow-500 disabled:bg-neutral-800 disabled:text-neutral-600 border border-neutral-600 text-white font-bold py-3 rounded-lg transition-colors uppercase tracking-wider text-sm"
            :disabled="currentRow === 0"
            @click="undo"
          >
            Desfazer
          </button>
          <button
            class="flex-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white font-bold py-3 rounded-lg transition-colors uppercase tracking-wider text-sm"
            @click="reset"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Cell } from '~/components/GameBoard.vue'
import type { LetterState, Attempt } from '~/utils/solver'
import { filterCandidates, getSuggestions } from '~/utils/solver'

const COLS = 5

const runtimeConfig = useRuntimeConfig()
const logoPath = computed(() => `${runtimeConfig.app.baseURL}images/logo.png`)

const modes = [
  { label: 'Termo', value: 1, rows: 6 },
  { label: 'Dueto', value: 2, rows: 7 },
  { label: 'Quarteto', value: 4, rows: 9 }
]

const mode = ref(1)

const maxRows = computed(() => modes.find(m => m.value === mode.value)?.rows ?? 6)

interface BoardState {
  rows: Cell[][]
  attempts: Attempt[]
  suggestions: string[]
  candidateCount: number
}

function emptyRow(): Cell[] {
  return Array.from({ length: COLS }, () => ({ letter: '', state: 'empty' as LetterState }))
}

const boards = ref<BoardState[]>([])
const currentRow = ref(0)
const inputWord = ref('')

function initBoards() {
  const numBoards = mode.value
  const rowsCount = maxRows.value
  
  boards.value = Array.from({ length: numBoards }, () => ({
    rows: Array.from({ length: rowsCount }, emptyRow),
    attempts: [],
    suggestions: [],
    candidateCount: 0
  }))

  // Initial suggestions
  const initialCandidates = filterCandidates([])
  const initialCount = initialCandidates.length
  
  boards.value.forEach(b => {
    b.candidateCount = initialCount
    // Get initial suggestions (done lazily or just empty at start to save CPU? Actually we can compute once and share)
    // On mount, wait a little before computing initial suggestions, or just don't show full list initially
  })
}

function setMode(newMode: number) {
  mode.value = newMode
  reset()
}

function sanitizeInput() {
  inputWord.value = inputWord.value.replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, 5)
  syncCurrentRowLetters()
}

function syncCurrentRowLetters() {
  if (currentRow.value >= maxRows.value) return
  const word = inputWord.value.padEnd(5, '')
  
  boards.value.forEach(board => {
    const row = board.rows[currentRow.value]
    if (row) {
      for (let i = 0; i < COLS; i++) {
        const cell = row[i]
        const w = word[i]
        if (cell) {
          cell.letter = w === ' ' ? '' : (w ?? '')
        }
      }
    }
  })
}

function handleCellClick(boardIndex: number, rowIndex: number, colIndex: number) {
  const cell = boards.value[boardIndex]?.rows[rowIndex]?.[colIndex]
  if (!cell || !cell.letter) return
  const cycle: LetterState[] = ['absent', 'present', 'correct']
  const current = cell.state === 'empty' ? 'absent' : cell.state
  const nextIndex = (cycle.indexOf(current) + 1) % cycle.length
  // Fix strict array indexing: cycle[nextIndex] could be inferred as LetterState | undefined
  cell.state = cycle[nextIndex] ?? 'absent'
}

function submitAttempt() {
  if (inputWord.value.length !== 5 || currentRow.value >= maxRows.value) return

  const rowIdx = currentRow.value
  const word = inputWord.value.toLowerCase()

  boards.value.forEach((board, bIdx) => {
    const row = board.rows[rowIdx]
    if (!row) return

    for (let i = 0; i < COLS; i++) {
      const cell = row[i]
      const w = word[i]
      if (cell && w !== undefined) {
        cell.letter = w
        if (cell.state === 'empty') {
          cell.state = 'absent'
        }
      }
    }

    const attempt: Attempt = {
      word,
      results: row.map(c => c.state),
    }

    board.attempts.push(attempt)
    
    // Compute suggestions for this board
    const candidates = filterCandidates(board.attempts)
    board.candidateCount = candidates.length
    board.suggestions = getSuggestions(candidates)
  })

  currentRow.value++
  inputWord.value = ''
}

function undo() {
  if (currentRow.value === 0) return

  currentRow.value--
  let lastWord = ''

  boards.value.forEach((board, index) => {
    const popped = board.attempts.pop()
    if (index === 0 && popped) {
      lastWord = popped.word
    }

    const row = board.rows[currentRow.value]
    if (row) {
      for (let i = 0; i < COLS; i++) {
        const cell = row[i]
        if (cell) {
          cell.letter = ''
          cell.state = 'empty'
        }
      }
    }

    // Recompute suggestions with previous attempts
    const candidates = filterCandidates(board.attempts)
    board.candidateCount = candidates.length
    board.suggestions = getSuggestions(candidates)
  })

  inputWord.value = lastWord
  syncCurrentRowLetters()
}

function reset() {
  initBoards()
  currentRow.value = 0
  inputWord.value = ''
}

onMounted(() => {
  initBoards()
  
  // Calculate initial suggestions once
  setTimeout(() => {
    const candidates = filterCandidates([])
    const suggestions = getSuggestions(candidates)
    boards.value.forEach(b => {
        b.suggestions = [...suggestions]
    })
  }, 100)
})
</script>
