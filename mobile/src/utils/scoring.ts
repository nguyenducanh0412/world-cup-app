import type { ScoringMode } from '../types/shared'

/**
 * Calculate points earned for a prediction based on scoring mode
 * 
 * EXACT_SCORE mode:
 * - Exact match: 3 points
 * - Correct outcome (win/draw/loss): 1 point
 * - Wrong: 0 points
 * 
 * OUTCOME_ONLY mode:
 * - Correct outcome: 2 points
 * - Wrong: 0 points
 */
export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
  mode: ScoringMode
): number {
  const exactMatch = predictedHome === actualHome && predictedAway === actualAway
  const predictedOutcome = Math.sign(predictedHome - predictedAway)
  const actualOutcome = Math.sign(actualHome - actualAway)
  const correctOutcome = predictedOutcome === actualOutcome

  if (mode === 'EXACT_SCORE') {
    if (exactMatch) return 3
    if (correctOutcome) return 1
    return 0
  }

  if (mode === 'OUTCOME_ONLY') {
    return correctOutcome ? 2 : 0
  }

  return 0
}
