export function friendlyError(error, fallback = "Terjadi kesalahan. Coba lagi.") {
  const message = String(error?.message || error?.error_description || "").trim();
  const code = String(error?.code || "").toLowerCase();
  const lower = message.toLowerCase();

  if (
    code === "invalid_credentials" ||
    lower.includes("invalid login credentials")
  ) {
    return "Email atau password salah.";
  }
  if (lower.includes("email not confirmed")) {
    return "Email belum dikonfirmasi. Periksa kotak masuk emailmu.";
  }
  if (lower.includes("user already registered")) {
    return "Email ini sudah terdaftar.";
  }
  if (lower.includes("profiles_username_key") || lower.includes("duplicate key")) {
    return "Username sudah digunakan. Pilih username lain.";
  }
  if (code === "weak_password" || lower.includes("password should be at least")) {
    return "Password terlalu lemah. Gunakan minimal 8 karakter.";
  }
  if (code === "same_password" || lower.includes("should be different")) {
    return "Password baru harus berbeda dari password sebelumnya.";
  }
  if (lower.includes("rate limit") || code === "over_email_send_rate_limit") {
    return "Terlalu banyak percobaan. Tunggu beberapa saat lalu coba lagi.";
  }
  if (lower.includes("for security purposes")) {
    return "Tunggu beberapa detik sebelum mencoba lagi.";
  }
  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("network request failed")
  ) {
    return "Tidak dapat terhubung ke server. Periksa koneksi internetmu.";
  }
  if (lower.includes("jwt") || lower.includes("session")) {
    return "Sesi tidak valid atau sudah berakhir. Silakan masuk kembali.";
  }
  return message || fallback;
}

export function logError(label, error) {
  if (process.env.NODE_ENV !== "production") {
    console.error(label, error);
  }
}