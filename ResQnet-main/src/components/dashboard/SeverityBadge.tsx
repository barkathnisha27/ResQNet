import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  level: "critical" | "high" | "medium" | "low" | "info";
  label?: string;
  pulse?: boolean;
  className?: string;
}

export function SeverityBadge({ level, label, pulse = false, className }: SeverityBadgeProps) {
  const text = label || level.charAt(0).toUpperCase() + level.slice(1);
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide border",
      `severity-${level}`,
      pulse && level === "critical" && "pulse-critical",
      className
    )}>
      {(level === "critical" || level === "high") && (
        <span className={cn(
          "h-1.5 w-1.5 rounded-full",
          level === "critical" ? "bg-red-500" : "bg-orange-500"
        )} />
      )}
      {text}
    </span>
  );
}
