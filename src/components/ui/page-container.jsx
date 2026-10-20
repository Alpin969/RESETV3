import { cn } from "@/lib/utils/cn";

export default function PageContainer({ children, className }) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-5xl px-4 pb-24 pt-5 tablet:px-7 tablet:pt-7 desktop:px-8 desktop:pb-10",
        className
      )}
    >
      {children}
    </div>
  );
}