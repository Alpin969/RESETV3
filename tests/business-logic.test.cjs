function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    console.error(`FAIL ${label}: expected ${expected}, got ${actual}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS ${label}`);
  }
}

// completionRateForMonth parity with V2 HistoryController:
// starts at 100, -3 per zero-completion day, -1 per missed task, floor 0.
function completionRateForMonth({ tasks, completedByDate, month, today }) {
  const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const isCurrent = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();
  const lastDay = isCurrent ? today.getDate() : lastDayOfMonth;
  const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  let penalty = 0;
  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    const active = tasks.filter((t) => {
      if (date < t.startsOn) return false;
      if (!t.archivedOn) return true;
      return date < t.archivedOn;
    });
    if (active.length === 0) continue;
    const done = active.filter((t) => (completedByDate[keyOf(date)] || new Set()).has(t.id)).length;
    penalty += done === 0 ? 3 : active.length - done;
  }
  return Math.max(0, 100 - penalty);
}

const month = new Date(2026, 9, 1);
const today = new Date(2026, 9, 5);
const tasks = [
  { id: "a", startsOn: new Date(2026, 9, 1), archivedOn: null },
  { id: "b", startsOn: new Date(2026, 9, 1), archivedOn: null },
];

// Day 1: both done. Day 2: one missed (-1). Day 3: zero done (-3).
// Day 4: zero done (-3). Day 5: both done. Total penalty 7 -> 93.
const completedByDate = {
  "2026-10-01": new Set(["a", "b"]),
  "2026-10-02": new Set(["a"]),
  "2026-10-05": new Set(["a", "b"]),
};

assertEqual(
  completionRateForMonth({ tasks, completedByDate, month, today }),
  93,
  "completion rate 100-1-3-3=93"
);

assertEqual(
  completionRateForMonth({ tasks: [], completedByDate: {}, month, today }),
  100,
  "days with no tasks are skipped"
);

function formatRupiah(value, { withDecimals = false } = {}) {
  const num = Number(value) || 0;
  const abs = Math.abs(num);
  const whole = Math.trunc(abs);
  let grouped = "";
  const digits = String(whole);
  for (let i = 0; i < digits.length; i += 1) {
    if (i > 0 && (digits.length - i) % 3 === 0) grouped += ".";
    grouped += digits[i];
  }
  let text = `${num < 0 ? "-Rp " : "Rp "}${grouped}`;
  if (withDecimals) {
    const cents = Math.round((abs - whole) * 100);
    text += `,${String(cents).padStart(2, "0")}`;
  }
  return text;
}

assertEqual(formatRupiah(50000), "Rp 50.000", "rupiah grouping");
assertEqual(formatRupiah(1500000, { withDecimals: true }), "Rp 1.500.000,00", "rupiah decimals");

function resolveSleepCrossesMidnight(bedHour, wakeHour) {
  return bedHour >= wakeHour ? "previous-day" : "same-day";
}

assertEqual(resolveSleepCrossesMidnight(22, 6), "previous-day", "sleep crosses midnight");
assertEqual(resolveSleepCrossesMidnight(6, 7), "same-day", "sleep same day");

// Streak parity with V3 rule: one completed task makes the day count.
function localDay(year, month, day) {
  return new Date(year, month - 1, day);
}

function localDayKey(value) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function progressRow(day, completedCount, totalTasks) {
  return { day, completedCount, totalTasks };
}

function computeStreakStats(progress, today) {
  const byDate = new Map();
  for (const row of progress) {
    const day = localDay(row.day.getFullYear(), row.day.getMonth() + 1, row.day.getDate());
    const key = localDayKey(day);
    const existing = byDate.get(key);
    if (existing) {
      existing.completedCount = Math.max(existing.completedCount, row.completedCount);
      existing.totalTasks = Math.max(existing.totalTasks, row.totalTasks);
    } else {
      byDate.set(key, { day, completedCount: row.completedCount, totalTasks: row.totalTasks });
    }
  }

  const days = [...byDate.values()].sort((a, b) => a.day - b.day);
  const distance = (from, to) => Math.round((to.getTime() - from.getTime()) / 86400000);
  let run = 0;
  let lastRun = 0;
  let longestStreak = 0;
  let totalSuccessDays = 0;
  let lastSuccessDate = null;
  let previous = null;

  for (const row of days) {
    if (row.totalTasks > 0 && row.completedCount > 0) {
      totalSuccessDays += 1;
      lastSuccessDate = row.day;
      run = previous && distance(previous, row.day) === 1 ? run + 1 : 1;
      lastRun = run;
      longestStreak = Math.max(longestStreak, run);
    } else {
      run = 0;
    }
    previous = row.day;
  }

  const fromToday = lastSuccessDate ? distance(lastSuccessDate, today) : null;
  const currentStreak = fromToday !== null && fromToday >= 0 && fromToday <= 1 ? lastRun : 0;
  return { currentStreak, longestStreak, totalSuccessDays, lastSuccessDate };
}

const streakDay1 = localDay(2026, 10, 1);
const streakDay2 = localDay(2026, 10, 2);
const streakDay3 = localDay(2026, 10, 3);

let streak = computeStreakStats([progressRow(streakDay1, 0, 5)], streakDay1);
assertEqual(streak.currentStreak, 0, "streak: 0/5 is not counted");
assertEqual(streak.totalSuccessDays, 0, "streak: 0/5 success days");

for (const completed of [1, 3, 5]) {
  streak = computeStreakStats([progressRow(streakDay1, completed, 5)], streakDay1);
  assertEqual(streak.currentStreak, 1, `streak: ${completed}/5 counts as one day`);
  assertEqual(streak.totalSuccessDays, 1, `streak: ${completed}/5 success days`);
}

streak = computeStreakStats([
  progressRow(streakDay1, 1, 5),
  progressRow(streakDay1, 4, 5),
], streakDay1);
assertEqual(streak.currentStreak, 1, "streak: same date only counts once");
assertEqual(streak.totalSuccessDays, 1, "streak: same date success days once");

streak = computeStreakStats([progressRow(streakDay1, 0, 5)], streakDay1);
assertEqual(streak.currentStreak, 0, "streak: unchecking the only task resets the day");

streak = computeStreakStats([
  progressRow(streakDay1, 1, 5),
  progressRow(streakDay2, 2, 5),
  progressRow(streakDay3, 5, 5),
], streakDay3);
assertEqual(streak.currentStreak, 3, "streak: consecutive active days add up");
assertEqual(streak.longestStreak, 3, "streak: longest consecutive days");
assertEqual(streak.totalSuccessDays, 3, "streak: total active days");

streak = computeStreakStats([
  progressRow(streakDay1, 1, 5),
  progressRow(streakDay2, 1, 5),
  progressRow(streakDay3, 0, 5),
], streakDay3);
assertEqual(streak.currentStreak, 2, "streak: yesterday tolerance still applies");
assertEqual(streak.totalSuccessDays, 2, "streak: tolerance keeps success days");

streak = computeStreakStats([
  progressRow(streakDay1, 1, 5),
  progressRow(streakDay2, 0, 5),
  progressRow(streakDay3, 0, 5),
], streakDay3);
assertEqual(streak.currentStreak, 0, "streak: two missed days break the streak");
assertEqual(streak.longestStreak, 1, "streak: longest preserved after break");

streak = computeStreakStats([
  progressRow(streakDay1, 1, 5),
  progressRow(streakDay2, 0, 5),
  progressRow(streakDay3, 1, 5),
], streakDay3);
assertEqual(streak.currentStreak, 1, "streak: a gap starts a new run");
assertEqual(streak.totalSuccessDays, 2, "streak: history counts all active days");

streak = computeStreakStats([
  progressRow(streakDay1, 1, 5),
  progressRow(streakDay2, 5, 5),
  progressRow(streakDay3, 3, 5),
], streakDay3);
assertEqual(streak.currentStreak, 3, "streak: history/progress share one rule");
assertEqual(streak.lastSuccessDate && localDayKey(streak.lastSuccessDate), localDayKey(streakDay3), "streak: last success date");

if (!process.exitCode) console.log("All business-logic tests passed.");
