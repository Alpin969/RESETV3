const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const MONTHS_LONG = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAYS_LONG = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export const WEEKDAY_OPTIONS = [
  { value: 1, short: "Sen", long: "Senin" },
  { value: 2, short: "Sel", long: "Selasa" },
  { value: 3, short: "Rab", long: "Rabu" },
  { value: 4, short: "Kam", long: "Kamis" },
  { value: 5, short: "Jum", long: "Jumat" },
  { value: 6, short: "Sab", long: "Sabtu" },
  { value: 7, short: "Min", long: "Minggu" },
];

export function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value) || 0);
}

export function formatDuration(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  return `${hours}j ${mins}m`;
}

export function formatHoursDecimal(minutes) {
  return `${((Number(minutes) || 0) / 60).toFixed(1)}j`;
}

export function monthShort(value) {
  return MONTHS_SHORT[value.getMonth()];
}

export function monthLong(value) {
  return MONTHS_LONG[value.getMonth()];
}

export function monthTitle(value) {
  return `${MONTHS_LONG[value.getMonth()]} ${value.getFullYear()}`;
}

export function dayLong(value) {
  return DAYS_LONG[value.getDay()];
}

export function fullDate(value) {
  return `${DAYS_LONG[value.getDay()]}, ${value.getDate()} ${
    MONTHS_LONG[value.getMonth()]
  } ${value.getFullYear()}`;
}

export function shortDate(value) {
  return `${value.getDate()} ${MONTHS_SHORT[value.getMonth()]} ${value.getFullYear()}`;
}

export function compactDate(value) {
  return `${value.getDate()} ${MONTHS_SHORT[value.getMonth()]}`;
}

export function formatTime(value) {
  const hours = value.getHours().toString().padStart(2, "0");
  const minutes = value.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function timeFromMinutes(totalMinutes) {
  const safe = Math.max(0, Math.min(1439, Math.round(Number(totalMinutes) || 0)));
  const hours = Math.floor(safe / 60).toString().padStart(2, "0");
  const minutes = (safe % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function minutesFromTime(time) {
  if (typeof time !== "string") {
    return 0;
  }
  const [hours, minutes] = time.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 11) {
    return { text: "Good morning", icon: "sunrise" };
  }
  if (hour < 15) {
    return { text: "Good afternoon", icon: "sun" };
  }
  if (hour < 19) {
    return { text: "Good evening", icon: "sunset" };
  }
  return { text: "Good night", icon: "moon" };
}

export function clockLabel(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function weekdaySummary(days) {
  if (!Array.isArray(days) || days.length === 0) {
    return "Tidak ada hari";
  }
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.length === 7) {
    return "Setiap hari";
  }
  const names = sorted
    .map((day) => WEEKDAY_OPTIONS.find((item) => item.value === day)?.short)
    .filter(Boolean);
  return names.join(", ");
}

export function initials(name) {
  if (!name) {
    return "R";
  }
  return name
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function possessive(name) {
  if (!name) {
    return "Your";
  }
  return `${name}'s`;
}

export function titleCase(value) {
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function truncate(value, length = 40) {
  if (!value) {
    return "";
  }
  return value.length > length ? `${value.slice(0, length - 1)}...` : value;
}

export function relativeTime(value) {
  if (!value) {
    return "";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) {
    return "Baru saja";
  }
  if (minutes < 60) {
    return `${minutes} menit lalu`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} jam lalu`;
  }
  const days = Math.round(hours / 24);
  if (days < 30) {
    return `${days} hari lalu`;
  }
  return shortDate(date);
}