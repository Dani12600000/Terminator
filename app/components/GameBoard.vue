<template>
  <div class="flex flex-col gap-1.5">
    <div
      v-for="(row, rowIndex) in rows"
      :key="rowIndex"
      class="flex gap-1.5"
    >
      <LetterCell
        v-for="(cell, colIndex) in row"
        :key="colIndex"
        :letter="cell.letter"
        :state="cell.state"
        :interactive="rowIndex === currentRow"
        @click="rowIndex === currentRow && $emit('cellClick', rowIndex, colIndex)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LetterState } from '~/utils/solver'

export interface Cell {
  letter: string
  state: LetterState
}

const props = defineProps<{
  rows: Cell[][]
  currentRow: number
}>()

defineEmits<{
  cellClick: [rowIndex: number, colIndex: number]
}>()
</script>
