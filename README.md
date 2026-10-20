# RESET V3 — Migrasi Flutter (V2) ke Next.js

RESET V3 adalah migrasi 1:1 dari aplikasi Flutter RESET V2 ke Next.js App Router.
Backend tetap memakai proyek Supabase V2 yang sama — tidak ada database baru,
tidak ada perubahan skema, dan akun V2 bisa langsung login di V3.

- Referensi V2: https://github.com/Alpin969/RESETV2.git (commit 42bae43)
- Supabase URL: https://wmnzrwwdsclqvwqazeva.supabase.co
- Stack: Next.js App Router, JavaScript + JSX, Tailwind CSS v4,
  @supabase/supabase-js, @supabase/ssr, lucide-react, recharts, PWA.

## Cara menjalankan

npm install, salin .env.example ke .env.local dan isi publishable key,
lalu jalankan npm run dev dan buka http://localhost:3000.

Perintah lain: npm run test (uji logika bisnis), npm run build, npm start.

## Environment

- NEXT_PUBLIC_SUPABASE_URL (wajib): URL proyek Supabase V2 yang sama.
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (wajib): publishable key, bukan service_role.
- NEXT_PUBLIC_SITE_URL (opsional): untuk redirect email; fallback ke origin browser.

## Struktur

- src/app/(auth): welcome, login, register, forgot/reset password.
- src/app/(app): home, history, progress, sleep, savings, reminders,
  archived-tasks, settings, export (semuanya protected).
- src/features: API Supabase + hooks + komponen per fitur.
- src/components/ui: modal, toast, kartu, skeleton, dsb.
- public/icons, public/sw.js, src/app/manifest.js: PWA.
- tests/business-logic.test.cjs: uji paritas logika V2.

## Catatan migrasi

- Streak, completion rate History, dan ringkasan sleep/savings mengikuti V2,
  termasuk RPC get_streak_stats, get_daily_progress, get_sleep_summary,
  dan get_savings_summary.
- Weekday reminder memakai 1 = Senin ... 7 = Minggu seperti V2.
- Export JSON memakai struktur V2 (app RESET V2, version 2) agar kompatibel;
  nama file CSV memakai awalan reset-v2-.
- Web Push belum diaktifkan — CRUD reminder tetap jalan dan UI menjelaskan
  bahwa pengiriman notifikasi belum tersedia.
- Supabase membutuhkan internet — saat offline tampil halaman /offline
  dan pesan koneksi yang jelas, bukan status sukses palsu.

## Sebelum deploy ke Vercel

1. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
2. Di Supabase Dashboard, daftarkan Site URL produksi dan redirect
   /auth/callback untuk produksi dan http://localhost:3000/auth/callback.
3. Jalankan npm run build sampai lolos, lalu deploy via Vercel tanpa
   mengubah database, RLS, atau storage V2.
