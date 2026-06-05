// ─── Types ────────────────────────────────────────────────────────────────────

export type Gender = 'male' | 'female';
export type BodyType = 'slim' | 'average' | 'athletic' | 'obese';

export interface Profile {
  gender: Gender;
  weight: number;
  height: number;
  age: number;
  bodyType: BodyType;
}

export interface PhaseConfig {
  preFastHours: number;
  fastDuration: number;
  refeedDays: number;
}

export interface BiomarkerRaw {
  glucose: number;
  insulin: number;
  glycogen: number;
  autophagy: number;
  ketones: number;
  ghrelin: number;
  stemCellsIntestinal: number;
  stemCellsHematopoietic: number;
  immuneReboot: number;
}

export interface ChartDataPoint {
  hour: number;
  // Raw values
  glucoseRaw: number;
  insulinRaw: number;
  glycogenRaw: number;
  autophagyRaw: number;
  ketonesRaw: number;
  ghrelinRaw: number;
  stemCellsIntestinalRaw: number;
  stemCellsHematopoieticRaw: number;
  immuneRebootRaw: number;
  hydrationRaw: number;
  // Normalized 0-100 values for chart
  glucose: number;
  insulin: number;
  glycogen: number;
  autophagy: number;
  ketones: number;
  ghrelin: number;
  stemCellsIntestinal: number;
  stemCellsHematopoietic: number;
  immuneReboot: number;
  hydration: number;
}

// ─── Profile Adjustments ──────────────────────────────────────────────────────

export function getTimeMultiplier(profile: Profile): number {
  let multiplier: number;
  switch (profile.bodyType) {
    case 'slim':
      multiplier = 1.15;
      break;
    case 'average':
      multiplier = 1.05;
      break;
    case 'athletic':
      multiplier = 1.0;
      break;
    case 'obese':
      multiplier = 0.85;
      break;
  }
  if (profile.gender === 'female') {
    multiplier *= 1.05;
  }
  return multiplier;
}

export function getPeakMultipliers(
  profile: Profile
): Record<string, number> {
  const multipliers: Record<string, number> = {
    glucose: 1.0,
    insulin: 1.0,
    glycogen: 1.0,
    autophagy: 1.0,
    ketones: 1.0,
    ghrelin: 1.0,
    stemCellsIntestinal: 1.0,
    stemCellsHematopoietic: 1.0,
    immuneReboot: 1.0,
  };

  if (profile.gender === 'female') {
    multipliers.ketones = 1.5;
    multipliers.glucose = 0.9;
  }

  if (profile.bodyType === 'obese') {
    multipliers.ketones = 0.7;
  }

  return multipliers;
}

// ─── Individual Biomarker Trajectories ────────────────────────────────────────

function computeGlucose(
  h: number,
  P: number,
  F: number,
  timeMultiplier: number,
  glucosePeakMult: number
): number {
  if (h < P) {
    // Pre-Fast
    return (95 + 15 * Math.sin((h / P) * Math.PI)) * glucosePeakMult;
  }
  const localHour = h - P;
  if (h < P + F) {
    // Fasting
    const adjusted = localHour * timeMultiplier;
    const value = 95 - 40 * Math.pow(adjusted / F, 0.7);
    return Math.max(50, value);
  }
  // Refeeding
  const refElapsed = h - P - F;
  return 55 + 37 * (1 - Math.exp(-refElapsed / 8));
}

function computeInsulin(
  h: number,
  P: number,
  F: number,
  timeMultiplier: number
): number {
  if (h < P) {
    // Pre-Fast
    return 12 + 25 * Math.sin((h / P) * Math.PI);
  }
  const localHour = h - P;
  if (h < P + F) {
    // Fasting
    const adjusted = localHour * timeMultiplier;
    const value = 1.0 + 11.0 * Math.exp(-adjusted / 8);
    return Math.max(0.5, value);
  }
  // Refeeding
  const refElapsed = h - P - F;
  return 1.0 + 11.0 * (1 - Math.exp(-refElapsed / 6));
}

function computeGlycogen(
  h: number,
  P: number,
  F: number,
  timeMultiplier: number
): number {
  if (h < P) {
    // Pre-Fast
    return 80 + 15 * Math.sin((h / P) * Math.PI);
  }
  const localHour = h - P;
  if (h < P + F) {
    // Fasting
    const adjusted = localHour * timeMultiplier;
    const value = 90.0 * Math.exp(-adjusted / 6);
    return Math.max(0, Math.min(100, value));
  }
  // Refeeding
  const refElapsed = h - P - F;
  return 90.0 * (1 - Math.exp(-refElapsed / 10));
}

function computeAutophagy(
  h: number,
  P: number,
  F: number,
  timeMultiplier: number,
  isObese: boolean
): number {
  if (h < P) {
    // Pre-Fast
    return 5;
  }
  const localHour = h - P;
  if (h < P + F) {
    // Fasting
    const adjusted = localHour * timeMultiplier;
    let value: number;
    if (adjusted < 18) {
      value = 5;
    } else if (adjusted < 72) {
      value = 5 + 95 * ((adjusted - 18) / 54);
    } else {
      value = 100;
    }
    if (isObese) {
      value *= 0.7;
    }
    return value;
  }
  // Refeeding
  const refElapsed = h - P - F;
  return 100.0 * Math.exp(-refElapsed / 3);
}

function computeKetones(
  h: number,
  P: number,
  F: number,
  timeMultiplier: number,
  ketonesPeakMult: number
): number {
  if (h < P) {
    // Pre-Fast
    return 0.3;
  }
  const localHour = h - P;
  if (h < P + F) {
    // Fasting
    const adjusted = localHour * timeMultiplier;
    let value: number;
    if (adjusted < 24) {
      value = 0.3;
    } else if (adjusted < 48) {
      value = 0.3 + 0.9 * ((adjusted - 24) / 24);
    } else {
      value = 1.2 + 3.3 * Math.pow((adjusted - 48) / (F - 48), 1.2);
    }
    return value * ketonesPeakMult;
  }
  // Refeeding
  const refElapsed = h - P - F;
  return 4.5 * Math.exp(-refElapsed / 5) + 0.3;
}

function computeGhrelin(
  h: number,
  P: number,
  F: number,
  timeMultiplier: number
): number {
  if (h < P) {
    // Pre-Fast: standard hunger waves using cos^8
    const wave = Math.pow(Math.cos((h - 12) * 2 * Math.PI / 24), 8);
    return 25 + 50 * wave;
  }
  const localHour = h - P;
  if (h < P + F) {
    // Fasting
    const adjusted = localHour * timeMultiplier;
    const hungerWave = Math.pow(
      Math.cos((adjusted - 12) * 2 * Math.PI / 24),
      8
    );
    const spikeHeight = 50 * Math.max(0.25, 1.0 - adjusted / 120);
    const base = 25 + 10 * Math.exp(-adjusted / 48);
    const value = base + spikeHeight * hungerWave;
    return Math.max(15, Math.min(85, value));
  }
  // Refeeding
  const refElapsed = h - P - F;
  return 20 * Math.exp(-refElapsed / 6) + 15;
}

function computeStemCellsIntestinal(
  h: number,
  P: number,
  F: number,
  timeMultiplier: number
): number {
  if (h < P) {
    // Pre-Fast
    return 1.0;
  }
  const localHour = h - P;
  if (h < P + F) {
    // Fasting
    const adjusted = localHour * timeMultiplier;
    if (adjusted < 24) {
      return 1.0;
    } else if (adjusted < 48) {
      return 1.0 + 9.0 * (adjusted - 24) / 24;
    } else if (adjusted < 60) {
      return 10.0;
    } else if (adjusted < 72) {
      return 10.0 - 9.0 * (adjusted - 60) / 12;
    } else {
      return 1.0;
    }
  }
  // Refeeding (returns to baseline)
  return 1.0;
}

function computeStemCellsHematopoietic(
  h: number,
  P: number,
  F: number
): number {
  if (h < P + F) {
    // Pre-Fast & Fasting
    return 1.0;
  }
  // Refeeding: peaks at 10x at 36h
  const refElapsed = h - P - F;
  return (
    1.0 +
    9.0 *
      Math.pow(refElapsed / 36, 1.5) *
      Math.exp(1.5 * (1 - refElapsed / 36))
  );
}

function computeImmuneReboot(
  h: number,
  P: number,
  F: number
): number {
  if (h < P + F) {
    // Pre-Fast & Fasting
    return 0;
  }
  // Refeeding: peaks at 80% at 48h
  const refElapsed = h - P - F;
  return (
    80.0 *
    Math.pow(refElapsed / 48, 2) *
    Math.exp(2 * (1 - refElapsed / 48))
  );
}

// ─── Normalization ────────────────────────────────────────────────────────────

export function normalizeForChart(biomarker: string, raw: number): number {
  switch (biomarker) {
    case 'glucose':
      return ((raw - 50) / 70) * 100;
    case 'ketones':
      return ((raw - 0.2) / 5.3) * 100;
    case 'insulin':
      return ((raw - 1.0) / 39) * 100;
    case 'ghrelin':
      return ((raw - 15) / 70) * 100;
    case 'stemCellsIntestinal':
    case 'stemCellsHematopoietic':
      return ((raw - 1.0) / 9.0) * 100;
    default:
      // autophagy, glycogen, immuneReboot, hydration already in 0-100 range
      return raw;
  }
}

// ─── Main Data Generation ─────────────────────────────────────────────────────

export function generateChartData(
  totalHours: number,
  config: PhaseConfig,
  profile: Profile,
  hydrationData: number[]
): ChartDataPoint[] {
  const P = config.preFastHours;
  const F = config.fastDuration;
  const timeMult = getTimeMultiplier(profile);
  const peakMults = getPeakMultipliers(profile);
  const isObese = profile.bodyType === 'obese';

  const points: ChartDataPoint[] = [];

  for (let h = 0; h <= totalHours; h++) {
    const glucoseRaw = computeGlucose(h, P, F, timeMult, peakMults.glucose);
    const insulinRaw = computeInsulin(h, P, F, timeMult);
    const glycogenRaw = computeGlycogen(h, P, F, timeMult);
    const autophagyRaw = computeAutophagy(h, P, F, timeMult, isObese);
    const ketonesRaw = computeKetones(h, P, F, timeMult, peakMults.ketones);
    const ghrelinRaw = computeGhrelin(h, P, F, timeMult);
    const stemCellsIntestinalRaw = computeStemCellsIntestinal(h, P, F, timeMult);
    const stemCellsHematopoieticRaw = computeStemCellsHematopoietic(h, P, F);
    const immuneRebootRaw = computeImmuneReboot(h, P, F);
    const hydrationRaw = h < hydrationData.length ? hydrationData[h] : 100;

    points.push({
      hour: h,
      // Raw values
      glucoseRaw,
      insulinRaw,
      glycogenRaw,
      autophagyRaw,
      ketonesRaw,
      ghrelinRaw,
      stemCellsIntestinalRaw,
      stemCellsHematopoieticRaw,
      immuneRebootRaw,
      hydrationRaw,
      // Normalized 0-100 values
      glucose: normalizeForChart('glucose', glucoseRaw),
      insulin: normalizeForChart('insulin', insulinRaw),
      glycogen: normalizeForChart('glycogen', glycogenRaw),
      autophagy: normalizeForChart('autophagy', autophagyRaw),
      ketones: normalizeForChart('ketones', ketonesRaw),
      ghrelin: normalizeForChart('ghrelin', ghrelinRaw),
      stemCellsIntestinal: normalizeForChart('stemCellsIntestinal', stemCellsIntestinalRaw),
      stemCellsHematopoietic: normalizeForChart('stemCellsHematopoietic', stemCellsHematopoieticRaw),
      immuneReboot: normalizeForChart('immuneReboot', immuneRebootRaw),
      hydration: normalizeForChart('hydration', hydrationRaw),
    });
  }

  return points;
}

// ─── Display Constants ────────────────────────────────────────────────────────

export const BIOMARKER_COLORS: Record<string, string> = {
  glucose: '#ff6b6b',
  insulin: '#ffa94d',
  glycogen: '#69db7c',
  autophagy: '#9775fa',
  ketones: '#4dabf7',
  ghrelin: '#ffd43b',
  stemCellsIntestinal: '#f06595',
  stemCellsHematopoietic: '#e599f7',
  immuneReboot: '#38d9a9',
  hydration: '#74c0fc',
};

export const BIOMARKER_LABELS: Record<string, string> = {
  glucose: 'Glucose',
  insulin: 'Insulin',
  glycogen: 'Glycogen',
  autophagy: 'Autophagy',
  ketones: 'Ketones',
  ghrelin: 'Ghrelin',
  stemCellsIntestinal: 'Intestinal SC',
  stemCellsHematopoietic: 'Hematopoietic SC',
  immuneReboot: 'Immune Reboot',
  hydration: 'Hydration',
};

export const BIOMARKER_UNITS: Record<string, string> = {
  glucose: 'mg/dL',
  insulin: 'uIU/mL',
  glycogen: '%',
  autophagy: '%',
  ketones: 'mmol/L',
  ghrelin: '%',
  stemCellsIntestinal: 'x',
  stemCellsHematopoietic: 'x',
  immuneReboot: '%',
  hydration: '%',
};
