/*
 * IELTS Scoring Engine
 * Converts raw scores to IELTS band scores and calculates overall band.
 */

// Listening raw-to-band conversion (Academic & General)
const LISTENING_BAND_TABLE: Record<number, number> = {
  39: 9.0, 38: 9.0, 37: 8.5, 36: 8.5, 35: 8.0, 34: 8.0, 33: 7.5,
  32: 7.5, 31: 7.0, 30: 7.0, 29: 6.5, 28: 6.5, 27: 6.0, 26: 6.0,
  25: 5.5, 24: 5.5, 23: 5.0, 22: 5.0, 21: 4.5, 20: 4.5, 19: 4.0,
  18: 4.0, 17: 3.5, 16: 3.5, 15: 3.0, 14: 3.0, 13: 2.5, 12: 2.5,
  11: 2.0, 10: 2.0, 9: 1.5, 8: 1.5, 7: 1.0, 6: 1.0, 5: 0.5,
  4: 0.5, 3: 0.0, 2: 0.0, 1: 0.0, 0: 0.0,
};

// Academic Reading raw-to-band conversion
const ACADEMIC_READING_BAND_TABLE: Record<number, number> = {
  39: 9.0, 38: 9.0, 37: 8.5, 36: 8.5, 35: 8.0, 34: 8.0, 33: 7.5,
  32: 7.5, 31: 7.0, 30: 7.0, 29: 6.5, 28: 6.5, 27: 6.0, 26: 6.0,
  25: 5.5, 24: 5.5, 23: 5.0, 22: 5.0, 21: 4.5, 20: 4.5, 19: 4.0,
  18: 4.0, 17: 3.5, 16: 3.5, 15: 3.0, 14: 3.0, 13: 2.5, 12: 2.5,
  11: 2.0, 10: 2.0, 9: 1.5, 8: 1.5, 7: 1.0, 6: 1.0, 5: 0.5,
  4: 0.5, 3: 0.0, 2: 0.0, 1: 0.0, 0: 0.0,
};

// General Training Reading raw-to-band conversion
const GENERAL_READING_BAND_TABLE: Record<number, number> = {
  40: 9.0, 39: 9.0, 38: 8.5, 37: 8.5, 36: 8.0, 35: 8.0, 34: 7.5,
  33: 7.5, 32: 7.0, 31: 7.0, 30: 6.5, 29: 6.5, 28: 6.0, 27: 6.0,
  26: 5.5, 25: 5.5, 24: 5.0, 23: 5.0, 22: 4.5, 21: 4.5, 20: 4.0,
  19: 4.0, 18: 3.5, 17: 3.5, 16: 3.0, 15: 3.0, 14: 2.5, 13: 2.5,
  12: 2.0, 11: 2.0, 10: 1.5, 9: 1.5, 8: 1.0, 7: 1.0, 6: 0.5,
  5: 0.5, 4: 0.0, 3: 0.0, 2: 0.0, 1: 0.0, 0: 0.0,
};

export function calculateListeningBand(raw: number, total: number = 40): number {
  if (total === 40 && LISTENING_BAND_TABLE[raw] !== undefined) {
    return LISTENING_BAND_TABLE[raw];
  }
  return interpolateBand(raw, total);
}

export function calculateReadingBand(raw: number, total: number = 40, examType: 'academic' | 'general' = 'academic'): number {
  const table = examType === 'general' ? GENERAL_READING_BAND_TABLE : ACADEMIC_READING_BAND_TABLE;
  if (total === 40 && table[raw] !== undefined) {
    return table[raw];
  }
  return interpolateBand(raw, total);
}

export function calculateWritingBand(wordCount: number, criteriaScores: { taskAchievement: number; coherence: number; lexicalResource: number; grammaticalRange: number }): number {
  const avg = (criteriaScores.taskAchievement + criteriaScores.coherence + criteriaScores.lexicalResource + criteriaScores.grammaticalRange) / 4;
  if (wordCount < 150) return Math.min(avg - 1.0, 5.5);
  if (wordCount < 200) return Math.min(avg - 0.5, 6.0);
  return roundToNearestHalf(avg);
}

export function calculateSpeakingBand(criteriaScores: { fluency: number; lexicalResource: number; grammaticalRange: number; pronunciation: number }): number {
  const avg = (criteriaScores.fluency + criteriaScores.lexicalResource + criteriaScores.grammaticalRange + criteriaScores.pronunciation) / 4;
  return roundToNearestHalf(avg);
}

export function calculateOverallBand(listening: number, reading: number, writing: number, speaking: number): number {
  const sum = listening + reading + writing + speaking;
  const avg = sum / 4;
  return roundToNearestHalf(avg);
}

function roundToNearestHalf(value: number): number {
  const decimal = value - Math.floor(value);
  if (decimal < 0.25) return Math.floor(value);
  if (decimal < 0.75) return Math.floor(value) + 0.5;
  return Math.ceil(value);
}

function interpolateBand(raw: number, total: number): number {
  const ratio = raw / total;
  const band = ratio * 9;
  return roundToNearestHalf(Math.max(0, Math.min(9, band)));
}

export function bandToLevel(band: number): string {
  if (band >= 9.0) return 'Expert';
  if (band >= 8.0) return 'Very Good';
  if (band >= 7.0) return 'Good';
  if (band >= 6.0) return 'Competent';
  if (band >= 5.0) return 'Modest';
  if (band >= 4.0) return 'Limited';
  return 'Extremely Limited';
}

export function bandToDescription(band: number): string {
  if (band >= 9.0) return 'Has fully operational command of the language';
  if (band >= 8.0) return 'Has fully operational command with only occasional unsystematic inaccuracies';
  if (band >= 7.0) return 'Has operational command with occasional inaccuracies';
  if (band >= 6.0) return 'Has effective command despite some inaccuracies';
  if (band >= 5.0) return 'Has partial command in familiar situations';
  if (band >= 4.0) return 'Basic competence limited to familiar situations';
  return 'Frequent problems in understanding and expression';
}
