export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-reset-soft">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-reset-primary"
            aria-hidden="true"
          >
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
        </div>
        <h1 className="mt-5 text-[24px] font-bold tracking-tight">Kamu sedang offline</h1>
        <p className="mt-2 text-[14.5px] leading-6 text-reset-muted">
          RESET membutuhkan koneksi internet untuk memuat data terbaru. Periksa
          koneksimu, lalu coba lagi.
        </p>
        <a href="/home" className="btn-primary mt-6 w-full">
          Coba lagi
        </a>
      </div>
    </main>
  );
}