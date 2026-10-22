import { LeafMark } from "@/components/brand/logo";

export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-reset-soft">
          <LeafMark size={30} id="offline-leaf" />
        </div>
        <h1 className="mt-5 text-[24px] font-extrabold tracking-[-0.5px] text-reset-dark">You&apos;re offline</h1>
        <p className="mt-2 text-[14px] leading-6 text-reset-muted">
          RESET needs a connection to load your latest progress. Check your
          connection, then try again.
        </p>
        <a href="/home" className="btn-primary mt-6 w-full">
          Try again
        </a>
      </div>
    </main>
  );
}
