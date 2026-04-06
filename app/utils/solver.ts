import { WORD_LIST } from './wordList'

export type LetterState = 'empty' | 'absent' | 'present' | 'correct'

export interface LetterConstraint {
  letter: string
  state: LetterState
  position: number
}

export interface Attempt {
  word: string
  results: LetterState[]
}

/**
 * Filter candidates based on accumulated constraints from all attempts.
 */
export function filterCandidates(attempts: Attempt[], allWords: string[] = WORD_LIST): string[] {
  if (attempts.length === 0) return allWords

  // Build constraint sets
  const correctPositions: Map<number, string> = new Map()   // position -> letter
  const presentLetters: Map<string, Set<number>> = new Map() // letter -> positions where it's NOT
  const absentLetters: Set<string> = new Set()
  const minCounts: Map<string, number> = new Map() // minimum required count of each letter

  for (const attempt of attempts) {
    const word = attempt.word.toLowerCase()
    const results = attempt.results

    // Count how many times each letter appears as correct or present
    const positiveCounts: Map<string, number> = new Map()
    for (let i = 0; i < 5; i++) {
      const letter = word[i]
      if (results[i] === 'correct' || results[i] === 'present') {
        positiveCounts.set(letter, (positiveCounts.get(letter) ?? 0) + 1)
      }
    }

    for (const [letter, count] of positiveCounts) {
      const current = minCounts.get(letter) ?? 0
      if (count > current) minCounts.set(letter, count)
    }

    for (let i = 0; i < 5; i++) {
      const letter = word[i]
      const state = results[i]

      if (state === 'correct') {
        correctPositions.set(i, letter)
      } else if (state === 'present') {
        if (!presentLetters.has(letter)) presentLetters.set(letter, new Set())
        presentLetters.get(letter)!.add(i)
      } else if (state === 'absent') {
        // Only mark absent if it doesn't appear as correct/present anywhere else in same attempt
        if (!positiveCounts.has(letter)) {
          absentLetters.add(letter)
        }
      }
    }
  }

  return allWords.filter(candidate => {
    // Check correct positions
    for (const [pos, letter] of correctPositions) {
      if (candidate[pos] !== letter) return false
    }

    // Check present letters (must exist but not in excluded positions)
    for (const [letter, excludedPositions] of presentLetters) {
      const idx = candidate.split('').findIndex((l, i) => l === letter && !excludedPositions.has(i))
      if (idx === -1) return false
    }

    // Check absent letters
    for (const letter of absentLetters) {
      // Absent only truly means absent if not a required letter
      if (!presentLetters.has(letter) && !correctPositions.values().toString().includes(letter)) {
        if (candidate.includes(letter)) return false
      }
    }

    // Check minimum counts
    for (const [letter, minCount] of minCounts) {
      const count = candidate.split('').filter(l => l === letter).length
      if (count < minCount) return false
    }

    return true
  })
}

/**
 * Calculate the entropy of a guess against a set of candidates.
 * Higher entropy = better guess (eliminates more possibilities on average).
 */
function calculateEntropy(guess: string, candidates: string[]): number {
  if (candidates.length === 0) return 0

  // Group candidates by the pattern they'd produce for this guess
  const patternCounts: Map<string, number> = new Map()

  for (const candidate of candidates) {
    const pattern = getPattern(guess, candidate)
    patternCounts.set(pattern, (patternCounts.get(pattern) ?? 0) + 1)
  }

  let entropy = 0
  const total = candidates.length
  for (const count of patternCounts.values()) {
    const p = count / total
    entropy -= p * Math.log2(p)
  }

  return entropy
}

/**
 * Get the result pattern string for a guess against a true answer.
 * c = correct, p = present, a = absent
 */
function getPattern(guess: string, answer: string): string {
  const result: string[] = ['a', 'a', 'a', 'a', 'a']
  const answerCounts: Map<string, number> = new Map()

  // Count letters in answer
  for (const letter of answer) {
    answerCounts.set(letter, (answerCounts.get(letter) ?? 0) + 1)
  }

  // First pass: mark correct
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'c'
      answerCounts.set(guess[i], answerCounts.get(guess[i])! - 1)
    }
  }

  // Second pass: mark present
  for (let i = 0; i < 5; i++) {
    if (result[i] !== 'c') {
      const count = answerCounts.get(guess[i]) ?? 0
      if (count > 0) {
        result[i] = 'p'
        answerCounts.set(guess[i], count - 1)
      }
    }
  }

  return result.join('')
}

/**
 * Get the top N suggestions based on entropy.
 * Prefers words that are also candidates (could be the answer).
 */
export function getSuggestions(candidates: string[], topN = 5): string[] {
  if (candidates.length === 0) return []
  if (candidates.length <= topN) return [...candidates]

  // For large candidate sets, sample to keep performance reasonable
  const sampleSize = Math.min(candidates.length, 500)
  const sample = candidates.length > sampleSize
    ? candidates.slice(0, sampleSize)
    : candidates

  // Evaluate all candidates as possible guesses
  const scored = sample.map(word => ({
    word,
    entropy: calculateEntropy(word, sample),
    isCandidate: true,
  }))

  scored.sort((a, b) => b.entropy - a.entropy)

  return scored.slice(0, topN).map(s => s.word)
}
