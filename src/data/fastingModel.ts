import type { PhaseConfig } from './biomarkerModel';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PhaseInfo {
  name: string;
  start: number; // hours
  end: number; // hours
  color: string;
  description: string;
}

// ─── Phase Construction ───────────────────────────────────────────────────────

export function buildPhases(config: PhaseConfig): PhaseInfo[] {
  const P = config.preFastHours;
  const F = config.fastDuration;
  const R = config.refeedDays * 24;

  const phases: PhaseInfo[] = [
    {
      name: 'Fed State',
      start: 0,
      end: P,
      color: '#4ade80',
      description:
        'Pre-fast preparation. Body uses glucose from recent meals.',
    },
    {
      name: 'Glycogen Depletion',
      start: P,
      end: P + Math.min(24, F),
      color: '#fb923c',
      description:
        'Liver glycogen stores being depleted. Glucose drops steadily.',
    },
  ];

  if (F > 24) {
    phases.push({
      name: 'Fat Oxidation',
      start: P + 24,
      end: P + Math.min(48, F),
      color: '#f87171',
      description:
        'Body switches to fat burning. Ketone production begins.',
    });
  }

  if (F > 48) {
    phases.push({
      name: 'Ketosis & Autophagy',
      start: P + 48,
      end: P + Math.min(72, F),
      color: '#a78bfa',
      description:
        'Deep ketosis active. Cellular cleanup (autophagy) peaks.',
    });
  }

  if (F > 72) {
    phases.push({
      name: 'Deep Ketosis',
      start: P + 72,
      end: P + F,
      color: '#f472b6',
      description: 'Sustained deep ketosis. Maximum fat adaptation.',
    });
  }

  if (R > 0) {
    phases.push({
      name: 'Refeeding',
      start: P + F,
      end: P + F + R,
      color: '#60a5fa',
      description:
        'Controlled reintroduction of food. Stem cell regeneration peaks.',
    });
  }

  return phases;
}

// ─── Phase Lookup ─────────────────────────────────────────────────────────────

export function getPhaseAtHour(
  phases: PhaseInfo[],
  hour: number
): PhaseInfo | null {
  return (
    phases.find((p) => hour >= p.start && hour < p.end) ||
    phases[phases.length - 1] ||
    null
  );
}

// ─── Progress Tracking ────────────────────────────────────────────────────────

export function getPhaseProgress(
  phases: PhaseInfo[],
  hour: number
): {
  phase: PhaseInfo | null;
  phaseProgress: number;
  overallProgress: number;
} {
  const totalEnd =
    phases.length > 0 ? phases[phases.length - 1].end : 0;
  const overallProgress =
    totalEnd > 0 ? Math.min(hour / totalEnd, 1) : 0;
  const phase = getPhaseAtHour(phases, hour);
  const phaseProgress = phase
    ? Math.min((hour - phase.start) / (phase.end - phase.start), 1)
    : 0;
  return { phase, phaseProgress, overallProgress };
}

export function getFastingCompletionPercent(
  hoursElapsed: number,
  preFastHours: number,
  fastDuration: number
): number {
  const totalProtocol = preFastHours + fastDuration;
  if (totalProtocol <= 0) return 0;
  return Math.min(
    Math.max((hoursElapsed / totalProtocol) * 100, 0),
    100
  );
}

// ─── Protocol Naming ──────────────────────────────────────────────────────────

export function getProtocolName(fastDuration: number): string {
  if (fastDuration <= 18) return '18h Intermittent';
  if (fastDuration <= 24) return '24h OMAD';
  if (fastDuration <= 48) return '48h Extended';
  if (fastDuration <= 72) return '72h Autophagy';
  if (fastDuration <= 120) return '120h Deep Fast';
  return '168h+ Extended';
}
