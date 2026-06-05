import type { Profile } from './biomarkerModel';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WaterEntry {
  id: string;
  timestamp: string; // ISO string
  amount: number; // in liters
}

// ─── Total Body Water (Watson Formula) ────────────────────────────────────────

export function calculateTBW(profile: Profile): number {
  if (profile.gender === 'male') {
    return (
      2.447 -
      0.09156 * profile.age +
      0.1074 * profile.height +
      0.3362 * profile.weight
    );
  }
  return -2.097 + 0.1069 * profile.height + 0.2466 * profile.weight;
}

// ─── Daily Water Target ───────────────────────────────────────────────────────

export function calculateWaterTarget(profile: Profile): number {
  let target = profile.weight * 0.035;
  if (profile.bodyType === 'athletic') target *= 1.1;
  if (profile.gender === 'female') target *= 0.9;
  return target;
}

// ─── Hydration Simulation ─────────────────────────────────────────────────────

export function simulateHydration(
  totalHours: number,
  tbw: number,
  waterEntries: WaterEntry[],
  fastStartISO: string,
  preFastHours: number
): number[] {
  const result: number[] = [];
  const fastStartMs = new Date(fastStartISO).getTime();
  const dailyLoss = 0.05 * tbw; // 5% of TBW per day
  const hourlyBaseLoss = dailyLoss / 24;

  let currentHydration = 100; // Start at 100%

  for (let h = 0; h <= totalHours; h++) {
    // Calculate water entries that fall in this hour
    const hourStartMs = fastStartMs + h * 3600000;
    const hourEndMs = hourStartMs + 3600000;

    let waterAddedLiters = 0;
    for (const entry of waterEntries) {
      const entryMs = new Date(entry.timestamp).getTime();
      if (entryMs >= hourStartMs && entryMs < hourEndMs) {
        waterAddedLiters += entry.amount;
      }
    }

    // Add water (convert liters to % of TBW)
    if (waterAddedLiters > 0 && tbw > 0) {
      currentHydration += (waterAddedLiters / tbw) * 100;
    }

    // Fasting natriuresis multiplier (increases loss by up to 30% over 48h)
    const hoursIntoFast = Math.max(0, h - preFastHours);
    const natriuresisMultiplier =
      1.0 + 0.3 * Math.min(hoursIntoFast / 48, 1.0);
    const hourlyLoss = hourlyBaseLoss * natriuresisMultiplier;

    // Convert loss to % of TBW
    if (tbw > 0) {
      currentHydration -= (hourlyLoss / tbw) * 100;
    }

    // Clamp 0 to 120
    currentHydration = Math.max(0, Math.min(120, currentHydration));
    result.push(currentHydration);
  }

  return result;
}
