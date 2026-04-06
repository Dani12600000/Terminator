<template>
  <button
    type="button"
    :class="[
      'w-14 h-14 flex items-center justify-center',
      'text-2xl font-bold uppercase select-none',
      'border-2 transition-colors duration-150 cursor-pointer',
      stateClasses,
    ]"
    :aria-label="`Letra ${letter || 'vazia'}, estado: ${stateLabel}`"
    @click="$emit('click')"
  >
    {{ letter }}
  </button>
</template>

<script setup lang="ts">
import type { LetterState } from '~/utils/solver'

const props = defineProps<{
  letter: string
  state: LetterState
  interactive?: boolean
}>()

defineEmits<{
  click: []
}>()

const stateClasses = computed(() => {
  switch (props.state) {
    case 'correct':
      return 'bg-green-600 border-green-600 text-white'
    case 'present':
      return 'bg-yellow-500 border-yellow-500 text-white'
    case 'absent':
      return 'bg-neutral-600 border-neutral-600 text-white'
    default:
      return props.letter
        ? 'bg-transparent border-neutral-400 text-white'
        : 'bg-transparent border-neutral-700 text-white'
  }
})

const stateLabel = computed(() => {
  switch (props.state) {
    case 'correct': return 'correto'
    case 'present': return 'presente'
    case 'absent': return 'ausente'
    default: return 'vazio'
  }
})
</script>
