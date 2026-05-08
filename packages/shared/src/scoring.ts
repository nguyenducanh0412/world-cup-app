import type { ScoringMode } from './index';

/**
 * Calculate points earned for a prediction based on the scoring mode
 * @param predictedHome - Predicted home team score
 * @param predictedAway - Predicted away team score
 * @param actualHome - Actual home team score
 * @param actualAway - Actual away team score
 * @param mode - Scoring mode (EXACT_SCORE or OUTCOME_ONLY)
 * @returns Points earned
 */
export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
  mode: ScoringMode
): number {
  const exactMatch = predictedHome === actualHome && predictedAway === actualAway;
  const predictedOutcome = Math.sign(predictedHome - predictedAway);
  const actualOutcome = Math.sign(actualHome - actualAway);
  const correctOutcome = predictedOutcome === actualOutcome;

  if (mode === 'EXACT_SCORE') {
    if (exactMatch) return 3;
    if (correctOutcome) return 1;
    return 0;
  }

  if (mode === 'OUTCOME_ONLY') {
    return correctOutcome ? 2 : 0;
  }

  return 0;
}
