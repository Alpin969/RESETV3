import Link from "next/link";
import AuthShell from "@/features/auth/auth-shell";

export const metadata = {
  title: "Selamat Datang",
};

export default function WelcomePage() {
  return (
    <AuthShell
      title="Welcome to RESET."
      subtitle="Bangun kebiasaan baik, mulai dari hari ini."
      footer={
        <span className="italic text-reset-muted/80">
          Discipline today, freedom tomorrow.
        </span>
      }
    >
      <div className="space-y-3">
        <Link href="/register" className="btn-primary w-full">
          Register
        </Link>
        <Link href="/login" className="btn-outline w-full">
          Login
        </Link>
      </div>
      <p className="mt-5 text-center text-[11.5px] leading-5 text-reset-muted/80">
        Lanjutkan perjalananmu, satu langkah kecil setiap hari.
      </p>
    </AuthShell>
  );
}