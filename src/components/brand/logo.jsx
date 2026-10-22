import { cn } from "@/lib/utils/cn";

export function LeafMark({ size = 40, className, id = "reset-leaf" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-gradient`} x1="12" y1="40" x2="40" y2="6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1F6A48" />
          <stop offset="0.55" stopColor="#2F8A60" />
          <stop offset="1" stopColor="#54B181" />
        </linearGradient>
      </defs>
      <path
        d="M41.2 6.4C26.4 6.6 13.1 15.2 10.6 28.7c-1.1 6 1 10.7 4.6 13.1 1.6 1.1 3.6 1.1 5.1 0 11.9-8.6 19.9-20.9 22-33.4.2-1.3-.3-2.1-1.1-2Z"
        fill={`url(#${id}-gradient)`}
      />
      <path
        d="M13.2 41.3C19.7 33.1 27.3 24.3 36.7 15.2"
        stroke="#F7FCF8"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.92"
      />
      <path
        d="M22.7 30.5c2.7.1 5.2.5 7.7 1.3M28.4 23.4c2.2.1 4.2.4 6.1 1M17.5 36.4c1.5 0 2.9.2 4.3.5"
        stroke="#F7FCF8"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export default function Logo({
  size = 34,
  showText = true,
  stacked = false,
  className,
  textClassName,
  subtitle,
  id = "reset-logo",
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center",
        stacked ? "flex-col gap-4" : "gap-2.5",
        className
      )}
    >
      <LeafMark size={size} id={id} />
      {showText ? (
        <span
          className={cn(
            "font-extrabold leading-none text-reset-dark",
            stacked ? "text-[30px] tracking-[0.22em]" : "text-[21px] tracking-[0.12em]",
            textClassName
          )}
        >
          RESET
        </span>
      ) : null}
      {subtitle ? (
        <span className="text-[12.5px] font-medium text-reset-muted">{subtitle}</span>
      ) : null}
    </div>
  );
}
