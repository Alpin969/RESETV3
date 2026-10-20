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

if (!process.exitCode) console.log("All business-logic tests passed.");
