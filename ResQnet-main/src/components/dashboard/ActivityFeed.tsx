import { SeverityBadge } from "./SeverityBadge";
import { type ActivityEvent } from "@/lib/mockData";
import { motion } from "framer-motion";

interface ActivityFeedProps {
  events: ActivityEvent[];
  maxItems?: number;
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

const typeIcons: Record<string, string> = {
  incident: "🔴",
  cluster: "⚠️",
  assignment: "📋",
  status: "🔄",
  camp: "🏕️",
  resource: "📦",
};

export function ActivityFeed({ events, maxItems = 8 }: ActivityFeedProps) {
  const items = events.slice(0, maxItems);
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Live Activity Feed</h3>
        <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </span>
      </div>
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {items.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex gap-3 rounded-lg border border-border/40 bg-background/50 p-3"
          >
            <span className="text-base mt-0.5">{typeIcons[event.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">{event.message}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <SeverityBadge level={event.severity} />
                <span className="text-xs text-muted-foreground font-mono">{timeAgo(event.timestamp)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
