/**
 * Pure TypeScript Speech Pacing & Filler-Word Analyzer.
 * Computes live speaking cadence, filler density, and concise coaching cues.
 */

export type PacingStatus = "too-slow" | "ideal" | "too-fast" | "idle";

export interface FillerBreakdownItem {
  word: string;
  count: number;
}

export interface SpeechMetrics {
  wordCount: number;
  wpm: number;
  pacingStatus: PacingStatus;
  fillerCount: number;
  fillerRate: number;
  fillerBreakdown: FillerBreakdownItem[];
  concisenessHint: string;
}

const FILLER_PHRASES: readonly string[] = [
  "you know",
  "sort of",
  "kind of",
  "i mean",
  "basically",
  "actually",
  "literally",
  "like",
  "um",
  "uh",
];

const IDEAL_WPM_MIN = 120;
const IDEAL_WPM_MAX = 160;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getConcisenessHint(
  wordCount: number,
  pacingStatus: PacingStatus,
  fillerCount: number,
  fillerRate: number,
): string {
  if (wordCount === 0 || pacingStatus === "idle") {
    return "Start speaking or typing your answer to track live pacing and filler words.";
  }

  if (fillerRate >= 6 || fillerCount >= 4) {
    return "Pause silently for a beat instead of using filler words to sound more deliberate.";
  }

  if (pacingStatus === "too-fast") {
    return "Slow down slightly between points so the interviewer can absorb your key metrics.";
  }

  if (pacingStatus === "too-slow") {
    return "Pick up your cadence slightly to keep the story energetic and focused.";
  }

  if (wordCount > 260) {
    return "Wrap up with your measurable outcome soon to keep your answer tight and memorable.";
  }

  return "Steady conversational pace — anchor your closing with a concrete, measurable result.";
}

export function analyzeSpeechMetrics(
  transcript: string,
  elapsedSeconds: number,
): SpeechMetrics {
  const trimmed = transcript.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  const wpm =
    elapsedSeconds < 2 || wordCount === 0
      ? 0
      : Math.round((wordCount / elapsedSeconds) * 60);

  let pacingStatus: PacingStatus = "idle";
  if (wordCount > 0 && elapsedSeconds >= 2) {
    if (wpm < IDEAL_WPM_MIN) {
      pacingStatus = "too-slow";
    } else if (wpm > IDEAL_WPM_MAX) {
      pacingStatus = "too-fast";
    } else {
      pacingStatus = "ideal";
    }
  }

  const normalized = trimmed.toLowerCase();
  const breakdown: FillerBreakdownItem[] = [];
  let fillerCount = 0;

  if (normalized) {
    for (const phrase of FILLER_PHRASES) {
      const pattern = new RegExp(`\\b${escapeRegex(phrase)}\\b`, "gi");
      const matches = normalized.match(pattern);
      const count = matches ? matches.length : 0;
      if (count > 0) {
        fillerCount += count;
        breakdown.push({ word: phrase, count });
      }
    }
  }

  breakdown.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

  const fillerRate =
    wordCount > 0 ? Math.round((fillerCount / wordCount) * 1000) / 10 : 0;

  const concisenessHint = getConcisenessHint(
    wordCount,
    pacingStatus,
    fillerCount,
    fillerRate,
  );

  return {
    wordCount,
    wpm,
    pacingStatus,
    fillerCount,
    fillerRate,
    fillerBreakdown: breakdown,
    concisenessHint,
  };
}
