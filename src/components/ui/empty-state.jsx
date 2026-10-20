import { cn } from "@/lib/utils/cn";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-5 py-10 text-center",
        className
      )}
    >
      {Icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-reset-soft text-reset-primary">
          <Icon size={24} strokeWidth={1.7} />
        </div>
      ) : null}
      <h3 className="mt-4 text-[16px] font-bold text-reset-dark">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-xs text-[13.5px] leading-5 text-reset-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}