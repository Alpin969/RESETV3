export const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,30}$/;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const MIN_PASSWORD_LENGTH = 8;

export function validateUsername(value) {
  const input = String(value || "").trim();
  if (!input) {
    return "Username wajib diisi.";
  }
  if (!USERNAME_PATTERN.test(input)) {
    return "Username 3-30 karakter, hanya huruf, angka, dan garis bawah.";
  }
  return null;
}

export function validateEmail(value) {
  const input = String(value || "").trim();
  if (!input) {
    return "Email wajib diisi.";
  }
  if (!EMAIL_PATTERN.test(input)) {
    return "Format email tidak valid.";
  }
  return null;
}

export function validatePassword(value) {
  const input = String(value || "");
  if (!input) {
    return "Password wajib diisi.";
  }
  if (input.length < MIN_PASSWORD_LENGTH) {
    return `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  }
  return null;
}

export function validateConfirmPassword(value, password) {
  const input = String(value || "");
  if (!input) {
    return "Konfirmasi password wajib diisi.";
  }
  if (input !== password) {
    return "Konfirmasi password tidak sama.";
  }
  return null;
}

export function validateTaskTitle(value) {
  const input = String(value || "").trim();
  if (!input) {
    return "Nama task wajib diisi.";
  }
  if (input.length > 200) {
    return "Nama task maksimal 200 karakter.";
  }
  return null;
}

export function validateNotes(value, max = 1000) {
  if (String(value || "").length > max) {
    return `Catatan maksimal ${max} karakter.`;
  }
  return null;
}

export function validatePositiveAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Nominal harus lebih dari 0.";
  }
  if (!Number.isInteger(amount)) {
    return "Nominal harus berupa angka bulat.";
  }
  return null;
}