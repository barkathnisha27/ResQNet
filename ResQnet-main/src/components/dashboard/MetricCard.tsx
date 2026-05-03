import { AnimatedCounter } from "./AnimatedCounter";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: "default" | "critical" | "success" | "warning";
  className?: string;
}

const variantStyles = {
  default: "border-border/50",
  critical: "border-red-200 bg-red-50/50",
  success: "border-green-200 bg-green-50/50",
  warning: "border-amber-200 bg-amber-50/50",
};

const iconStyles = {
  default: "bg-accent/20 text-accent",
  critical: "bg-red-100 text-red-600",
  success: "bg-green-100 text-green-600",
  warning: "bg-amber-100 text-amber-600",
};

export function MetricCard({ title, value, suffix, prefix, decimals, icon: Icon, trend, variant = "default", className }: MetricCardProps) {
  return (
    <div className={cn("glass-card rounded-xl p-5 animate-fade-in", variantStyles[variant], className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            <AnimatedCounter end={value} prefix={prefix} suffix={suffix} decimals={decimals} />
          </p>
        </div>
        <div className={cn("rounded-lg p-2.5", iconStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className={cn(
            "font-semibold",
            trend.value > 0 ? "text-red-500" : "text-green-500"
          )}>
            {trend.value > 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
