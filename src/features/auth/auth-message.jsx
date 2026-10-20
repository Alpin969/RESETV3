import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function AuthMessage({ message, type = "error" }) {
  if (!message) {
    return null;
  }
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      className={cn(
        "mb-4 flex items-start gap-2.5 rounded-[12px] px-3.5 py-3 text-[13px] leading-5",
        type === "success"
          ? "bg-reset-soft text-[#1B5C3E]"
          : "bg-[#FBEDEC] text-[#8F211A]"
      )}
      role={type === "error" ? "alert" : "status"}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <span className="min-w-0 flex-1">{message}</span>
    </div>
  );
}