/**
 * Script que lê o léxico português de vendor/pt-br/lexico
 * (repositório: https://github.com/fserb/pt-br)
 * e gera o ficheiro app/utils/wordList.ts com palavras de 5 letras.
 *
 * Uso: bun run scripts/generate-wordlist.ts
 *
 * Para atualizar o repositório: git -C vendor/pt-br pull
 */

import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dir, '..')
const LEXICO_PATH = resolve(ROOT, 'vendor/pt-br/lexico')
const OUTPUT_PATH = resolve(ROOT, 'app/utils/wordList.ts')

console.log('A ler léxico de', LEXICO_PATH)

const text = await Bun.file(LEXICO_PATH).text()
const lines = text.split('\n')

console.log(`Total de entradas no léxico: ${lines.length}`)

function stripAccents(w: string): string {
  return w.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '')
}

const words5 = [...new Set(
  lines
    .map(l => stripAccents(l.trim().toLowerCase()))
    .filter(w => w.length === 5)
)].sort()

console.log(`Palavras com 5 letras (sem acentos, sem duplicados): ${words5.length}`)

const entries = words5.map(w => `  "${w}"`).join(',\n')

const output = `// Palavras portuguesas de 5 letras — gerado automaticamente a partir de:
// https://github.com/fserb/pt-br  (em vendor/pt-br)
// Para regenerar: bun run scripts/generate-wordlist.ts
// Para atualizar o repositório: git -C vendor/pt-br pull
export const WORD_LIST: string[] = [
${entries}
]
`

await Bun.write(OUTPUT_PATH, output)
console.log(`Ficheiro gerado: ${OUTPUT_PATH}`)
