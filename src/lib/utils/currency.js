function groupThousands(digits) {
  let out = "";
  for (let i = 0; i < digits.length; i += 1) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ".";
    out += digits[i];
  }
  return out;
}

export function formatRupiah(value, { withDecimals = false } = {}) {
  const num = Number(value) || 0;
  const negative = num < 0;
  const abs = Math.abs(num);
  const whole = Math.trunc(abs);
  let text = `${negative ? "-Rp " : "Rp "}${groupThousands(String(whole))}`;
  if (withDecimals) {
    const cents = Math.round((abs - whole) * 100);
    text += `,${String(cents).padStart(2, "0")}`;
  }
  return text;
}

export function parseAmountInput(raw) {
  const cleaned = String(raw || "").replace(/[^0-9.,]/g, "");
  if (!cleaned) return null;
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100) / 100;
}
