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

  const correctPositions: Map<number, string> = new Map()
  const presentLetters: Map<string, Set<number>> = new Map()
  const minCounts: Map<string, number> = new Map()
  const exactCounts: Map<string, number> = new Map()

  for (const attempt of attempts) {
    const word = attempt.word.toLowerCase()
    const results = attempt.results

    const positiveCounts: Map<string, number> = new Map()
    for (let i = 0; i < 5; i++) {
      const letter = word[i]
      const state = results[i]
      if (letter && (state === 'correct' || state === 'present')) {
        positiveCounts.set(letter, (positiveCounts.get(letter) ?? 0) + 1)
      }
    }

    const attemptLetters = new Set(word)
    for (const letter of attemptLetters) {
      const pCount = positiveCounts.get(letter) ?? 0
      
      let hasAbsent = false
      for (let i = 0; i < 5; i++) {
        const w = word[i]
        const state = results[i]
        if (w === letter && state === 'absent') {
          hasAbsent = true
          break
        }
      }

      if (hasAbsent) {
        // If exact count is already set to something else, there's a conflict.
        // We just keep the latest or the largest. By rules, it should be exact.
        exactCounts.set(letter, pCount)
      } else {
        const current = minCounts.get(letter) ?? 0
        if (pCount > current) minCounts.set(letter, pCount)
      }
    }

    for (let i = 0; i < 5; i++) {
      const letter = word[i]
      const state = results[i]

      if (!letter || !state) continue

      if (state === 'correct') {
        correctPositions.set(i, letter)
      } else if (state === 'present' || state === 'absent') {
        if (!presentLetters.has(letter)) presentLetters.set(letter, new Set())
        presentLetters.get(letter)!.add(i)
      }
    }
  }

  return allWords.filter(candidate => {
    for (const [pos, letter] of correctPositions) {
      if (candidate[pos] !== letter) return false
    }

    for (const [letter, excludedPositions] of presentLetters) {
      for (const pos of excludedPositions) {
        if (candidate[pos] === letter) return false
      }
    }

    const candidateCounts = new Map<string, number>()
    for (const char of candidate) {
      candidateCounts.set(char, (candidateCounts.get(char) ?? 0) + 1)
    }

    for (const [letter, minCount] of minCounts) {
      if ((candidateCounts.get(letter) ?? 0) < minCount) return false
    }

    for (const [letter, exactCount] of exactCounts) {
      if ((candidateCounts.get(letter) ?? 0) !== exactCount) return false
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
    const g = guess[i]
    if (g && g === answer[i]) {
      result[i] = 'c'
      answerCounts.set(g, answerCounts.get(g)! - 1)
    }
  }

  // Second pass: mark present
  for (let i = 0; i < 5; i++) {
    const g = guess[i]
    if (g && result[i] !== 'c') {
      const count = answerCounts.get(g) ?? 0
      if (count > 0) {
        result[i] = 'p'
        answerCounts.set(g, count - 1)
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
