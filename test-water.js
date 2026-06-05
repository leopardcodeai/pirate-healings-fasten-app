import test from "node:test";
import assert from "node:assert";

// 1. Timezone-safe local parsing function
function parseLocalDatetime(dateStr, timeStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [h, m] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, h, m, 0, 0);
}

// 2. Timezone-safe local formatting function
function formatLocalDateStr(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 3. Water loss calculation
function calculateHourlyWaterLoss(tbw, hoursElapsed) {
  const dailyLoss = 0.05 * tbw;
  const hourlyBaseLoss = dailyLoss / 24;
  const fastingMultiplier = 1.0 + 0.3 * Math.min(hoursElapsed / 48, 1.0);
  return hourlyBaseLoss * fastingMultiplier;
}

// 4. Hydration timeline simulation
function simulateHydrationTimeline(maxHours, startTimestamp, waterEntries, tbw, waterTarget) {
  const points = [];
  const dt = 0.1;
  let currentVolume = tbw;
  const sortedEntries = [...waterEntries].sort((a, b) => a.timestamp - b.timestamp);
  let entryIndex = 0;

  const totalSteps = Math.round(maxHours / dt);
  for (let step = 0; step <= totalSteps; step++) {
    const h = step * dt;
    const currentTS = startTimestamp + h * 3600 * 1000;

    while (entryIndex < sortedEntries.length) {
      const entry = sortedEntries[entryIndex];
      if (entry.timestamp <= currentTS) {
        currentVolume += entry.amount;
        entryIndex++;
      } else {
        break;
      }
    }

    const lossPerHour = calculateHourlyWaterLoss(tbw, h);
    currentVolume -= lossPerHour * dt;

    if (currentVolume < 0) currentVolume = 0;
    if (currentVolume > tbw * 1.2) currentVolume = tbw * 1.2;

    if (step % 5 === 0) {
      const pct = (currentVolume / tbw) * 100;
      points.push({
        hour: Math.round(h * 10) / 10,
        volume: currentVolume,
        percentage: Math.min(120, Math.max(0, pct))
      });
    }
  }
  return points;
}

test("Timezone-safe local parsing and formatting", () => {
  const dateStr = "2026-06-05";
  const timeStr = "09:45";
  const date = parseLocalDatetime(dateStr, timeStr);

  // Assert hours and minutes are exactly as parsed in local timezone
  assert.strictEqual(date.getHours(), 9);
  assert.strictEqual(date.getMinutes(), 45);
  
  // Assert formatting output matches input string
  const formatted = formatLocalDateStr(date);
  assert.strictEqual(formatted, dateStr);
});

test("Water entry simulation alignment", () => {
  const tbw = 48;
  const waterTarget = 3.0;
  
  // Setup: start the fast 14 hours ago relative to now
  const now = new Date();
  const start = new Date(now.getTime() - 14 * 3600 * 1000);
  
  const startTimestamp = start.getTime();
  const nowTimestamp = now.getTime();
  
  // Log a water entry "right now"
  const waterEntries = [
    { timestamp: nowTimestamp, amount: 0.5 }
  ];
  
  const maxHours = 36;
  const timeline = simulateHydrationTimeline(maxHours, startTimestamp, waterEntries, tbw, waterTarget);
  
  // Find timeline points before and after 14.0 hours
  const pointBefore = timeline.find(pt => pt.hour === 13.5);
  const pointAfter = timeline.find(pt => pt.hour === 14.0);
  
  assert.ok(pointBefore, "Point at 13.5 hours should exist");
  assert.ok(pointAfter, "Point at 14.0 hours should exist");
  
  // Water was added at hour 14.0. Compare the volumes.
  // The volume at 14.0 hours should be higher than at 13.5 hours despite ongoing decay.
  const expectedGain = 0.5 - calculateHourlyWaterLoss(tbw, 14.0) * 0.5;
  const actualDifference = pointAfter.volume - pointBefore.volume;
  
  assert.ok(actualDifference > 0, `Water should be added at hour 14.0. Diff was ${actualDifference}L`);
});
