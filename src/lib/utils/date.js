export function dateOnly(value) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function localToday(now = new Date()) {
  return dateOnly(now);
}

export function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDateParam(value) {
  const year = value.getFullYear().toString().padStart(4, "0");
  const month = (value.getMonth() + 1).toString().padStart(2, "0");
  const day = value.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateParam(value) {
  if (typeof value !== "string" || value.length < 10) {
    return null;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return null;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function parseTimestamp(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function firstDayOfMonth(value) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

export function lastDayOfMonth(value) {
  return new Date(value.getFullYear(), value.getMonth() + 1, 0);
}

export function daysInMonth(value) {
  return lastDayOfMonth(value).getDate();
}

export function addMonths(value, amount) {
  return new Date(value.getFullYear(), value.getMonth() + amount, 1);
}

export function addDays(value, amount) {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate() + amount
  );
}

export function isBeforeDay(a, b) {
  return dateOnly(a).getTime() < dateOnly(b).getTime();
}

export function isAfterDay(a, b) {
  return dateOnly(a).getTime() > dateOnly(b).getTime();
}

export function isActiveOn(task, date) {
  const day = dateOnly(date);
  if (isBeforeDay(day, task.startsOn)) {
    return false;
  }
  if (!task.archivedOn) {
    return true;
  }
  return isBeforeDay(day, task.archivedOn);
}

export function sameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}