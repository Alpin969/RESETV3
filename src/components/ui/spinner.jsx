import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function Spinner({ size = 18, className }) {
  return (
    <Loader2
      size={size}
      aria-hidden="true"
      className={cn("animate-spin", className)}
    />
  );
}