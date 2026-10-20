import { cn } from "@/lib/utils/cn";

export default function Skeleton({ className }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-[#E8EEE9]", className)}
      aria-hidden="true"
    />
  );
}