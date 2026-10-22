"use client";

import { cn } from "@/lib/utils/cn";

export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onChange?.(!checked);
        }
      }}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full overflow-hidden transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reset-primary/40 focus-visible:ring-offset-2 disabled:opacity-50",
        checked ? "bg-[#23845B]" : "bg-[#CFD9D2]"
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-all duration-150",
          checked ? "left-[23px]" : "left-[3px]"
        )}
      />
    </button>
  );
}