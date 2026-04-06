<template>
  <div class="w-full">
    <h2 class="text-neutral-400 text-sm font-semibold uppercase tracking-widest mb-3">
      Sugestões do Solver
    </h2>

    <div v-if="candidates === 0" class="text-neutral-500 text-sm">
      Nenhuma palavra encontrada com essas restrições.
    </div>

    <div v-else-if="suggestions.length === 0" class="text-neutral-500 text-sm">
      Insira uma tentativa para ver sugestões.
    </div>

    <div v-else class="flex flex-col gap-2">
      <div
        v-for="(word, index) in suggestions"
        :key="word"
        class="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-neutral-800 border border-neutral-700"
      >
        <span class="text-neutral-500 text-xs w-4 text-right">{{ index + 1 }}.</span>
        <span class="text-white font-bold text-lg uppercase tracking-widest">{{ word }}</span>
        <span v-if="index === 0" class="ml-auto text-xs text-green-400 font-medium">melhor</span>
      </div>

      <p class="text-neutral-500 text-xs mt-1">
        {{ candidates.toLocaleString('pt-BR') }} palavra{{ candidates === 1 ? '' : 's' }} candidata{{ candidates === 1 ? '' : 's' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  suggestions: string[]
  candidates: number
}>()
</script>
