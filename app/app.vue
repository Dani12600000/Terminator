<template>
  <div class="min-h-screen bg-neutral-900 text-white flex flex-col">
    <!-- Header -->
    <header class="border-b border-neutral-700 py-4 px-4 flex items-center justify-center relative">
      <img :src="logoPath" alt="Terminator Logo" class="h-8 w-8 mr-3" />
      <h1 class="text-3xl font-bold tracking-widest uppercase text-white font-mono">Terminator</h1>
      <p class="absolute right-4 text-xs text-neutral-500 hidden sm:block">Solver para o Termo</p>
      <button 
        @click="showDictionary = true"
        class="absolute left-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 p-2 rounded-lg text-neutral-400 hover:text-white transition-all group"
        title="Dicionário"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span class="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ml-0 group-hover:ml-2 text-xs font-bold uppercase tracking-wider">Dicionário</span>
      </button>
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
             <div class="text-sm font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
               <span :class="isBoardSolved(board) ? 'text-green-500' : 'text-neutral-500'">Palavra {{ bIdx + 1 }}</span>
               <span v-if="isBoardSolved(board)" class="bg-green-600/20 text-green-500 px-2 py-0.5 rounded text-[10px] border border-green-600/30 animate-pulse">✓ RESOLVIDA</span>
             </div>
             <GameBoard
              :rows="board.rows"
              :currentRow="currentRow"
              :class="{ 'opacity-80 grayscale-[0.2]': isBoardSolved(board) }"
              @cellClick="(rIdx, cIdx) => handleCellClick(bIdx, rIdx, cIdx)"
            />
          </div>
          <!-- Suggestions for this board -->
          <div class="w-full xl:w-48 pt-8">
            <SuggestionList
              :suggestions="board.suggestions"
              :candidates="board.candidateCount"
              :is-solved="isBoardSolved(board)"
              @select-word="selectWord"
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
    
    <!-- Modal Dicionário -->
    <Transition name="fade">
      <div v-if="showDictionary" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="showDictionary = false">
        <div class="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
          <div class="p-6 border-b border-neutral-800 flex justify-between items-center">
            <h3 class="text-xl font-bold uppercase tracking-widest text-white">Dicionário</h3>
            <button @click="showDictionary = false" class="text-neutral-500 hover:text-white transition-colors p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 flex flex-col gap-6">
            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-neutral-500 uppercase tracking-widest">Adicionar Nova Palavra</label>
              <div class="flex gap-2">
                <input 
                  v-model="newWord" 
                  maxlength="5" 
                  placeholder="EX: TERMO"
                  class="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 uppercase tracking-widest font-bold text-lg outline-none focus:border-green-600 transition-colors"
                  @keydown.enter="addNewWord"
                />
                <button 
                  @click="addNewWord"
                  :disabled="newWord.length !== 5"
                  class="bg-green-600 hover:bg-green-500 disabled:bg-neutral-800 disabled:text-neutral-600 px-4 py-2 rounded-lg font-bold uppercase text-xs transition-all"
                >
                  Add
                </button>
              </div>
              <Transition name="fade">
                <p v-if="addError" class="text-red-500 text-xs mt-1">{{ addError }}</p>
              </Transition>
            </div>
            
            <div class="flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <label class="text-xs font-bold text-neutral-500 uppercase tracking-widest">Minhas Palavras ({{ userWords.length }})</label>
              </div>
              <div class="bg-neutral-800 rounded-lg max-h-48 overflow-y-auto border border-neutral-700 flex flex-col">
                <div v-if="userWords.length === 0" class="p-8 text-center text-neutral-500 text-sm">
                  Nenhuma palavra adicionada manualmente.
                </div>
                <div 
                  v-for="word in userWords" 
                  :key="word" 
                  class="flex items-center justify-between p-3 px-4 border-b border-neutral-700/50 last:border-0 hover:bg-neutral-700/30 transition-colors"
                >
                  <span class="font-bold uppercase tracking-widest text-green-500">{{ word }}</span>
                  <button @click="removeWord(word)" class="text-neutral-500 hover:text-red-500 transition-colors p-1" title="Remover">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <p class="text-[10px] text-neutral-600 text-center italic mt-1">As palavras são guardadas no seu navegador.</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Cell } from '~/components/GameBoard.vue'
import type { LetterState, Attempt } from '~/utils/solver'
import { filterCandidates, getSuggestions } from '~/utils/solver'
import { WORD_LIST } from '~/utils/wordList'

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

// Dictionary persistence
const userWords = ref<string[]>([])
const showDictionary = ref(false)
const newWord = ref('')
const addError = ref('')

const combinedWordList = computed(() => {
  return [...new Set([...WORD_LIST, ...userWords.value])]
})

function loadUserWords() {
  const saved = localStorage.getItem('terminator_user_words')
  if (saved) {
    try {
      userWords.value = JSON.parse(saved)
    } catch (e) {
      console.error('Erro ao carregar dicionário', e)
    }
  }
}

function saveUserWords() {
  localStorage.setItem('terminator_user_words', JSON.stringify(userWords.value))
}

function addNewWord() {
  const word = newWord.value.toLowerCase().trim()
  if (word.length !== 5) return
  
  if (combinedWordList.value.includes(word)) {
    addError.value = 'Palavra já existe no dicionário'
    setTimeout(() => addError.value = '', 2000)
    return
  }

  userWords.value.unshift(word)
  saveUserWords()
  newWord.value = ''
  addError.value = ''
}

function removeWord(word: string) {
  userWords.value = userWords.value.filter(w => w !== word)
  saveUserWords()
}

function initBoards() {
  const numBoards = mode.value
  const rowsCount = maxRows.value
  
  boards.value = Array.from({ length: numBoards }, () => ({
    rows: Array.from({ length: rowsCount }, emptyRow),
    attempts: [],
    suggestions: [],
    candidateCount: 0
  }))
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
    // Se a palavra já foi descoberta nesta board, não escreve nela
    if (isBoardSolved(board)) return

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

function isBoardSolved(board: BoardState) {
  return board.attempts.some(a => a.results.every(r => r === 'correct'))
}

function handleCellClick(boardIndex: number, rowIndex: number, colIndex: number) {
  const board = boards.value[boardIndex]
  if (!board || isBoardSolved(board)) return
  
  const cell = board.rows[rowIndex]?.[colIndex]
  if (!cell || !cell.letter) return
  const cycle: LetterState[] = ['absent', 'present', 'correct']
  const current = cell.state === 'empty' ? 'absent' : cell.state
  const nextIndex = (cycle.indexOf(current) + 1) % cycle.length
  cell.state = cycle[nextIndex] ?? 'absent'
}

function submitAttempt() {
  if (inputWord.value.length !== 5 || currentRow.value >= maxRows.value) return

  const rowIdx = currentRow.value
  const word = inputWord.value.toLowerCase()

  boards.value.forEach((board, bIdx) => {
    // Se a board já foi resolvida em tentativas anteriores, não faz nada
    if (isBoardSolved(board)) return

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
    const candidates = filterCandidates(board.attempts, combinedWordList.value)
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
    // Só faz pop se a board tiver uma tentativa nesta linha
    if (board.attempts.length > currentRow.value) {
      const popped = board.attempts.pop()
      if (index === 0 && popped) {
        lastWord = popped.word
      }
      
      // Limpa a linha no UI (seja ela a de solução ou uma posterior)
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
      if (board.attempts.length === 0) {
        board.suggestions = []
        board.candidateCount = 0
      } else {
        const candidates = filterCandidates(board.attempts, combinedWordList.value)
        board.candidateCount = candidates.length
        board.suggestions = getSuggestions(candidates)
      }
    }
  })

  inputWord.value = lastWord
  syncCurrentRowLetters()
}

function selectWord(word: string) {
  inputWord.value = word
  syncCurrentRowLetters()
}

function reset() {
  initBoards()
  currentRow.value = 0
  inputWord.value = ''
}

onMounted(() => {
  loadUserWords()
  initBoards()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes scale-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out forwards;
}
</style>
