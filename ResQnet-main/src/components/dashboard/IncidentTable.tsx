import { SeverityBadge } from "./SeverityBadge";
import { type Incident, getSeverityColor, getPriorityLabel } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Shield, Image, Clock, Users } from "lucide-react";

interface IncidentTableProps {
  incidents: Incident[];
  onSelect?: (incident: Incident) => void;
  compact?: boolean;
}

export function IncidentTable({ incidents, onSelect, compact = false }: IncidentTableProps) {
  const sorted = [...incidents].sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-5 border-b border-border/40">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
          AI Priority Intelligence
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Severity</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</th>
              {!compact && <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Survival</th>}
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Affected</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              {!compact && <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Flags</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((inc) => {
              const sevColor = getSeverityColor(inc.severity);
              const priLabel = getPriorityLabel(inc.priorityScore);
              return (
                <tr
                  key={inc.id}
                  onClick={() => onSelect?.(inc)}
                  className={cn(
                    "border-b border-border/20 transition-colors cursor-pointer hover:bg-accent/5",
                    inc.severity >= 5 && "bg-red-50/30"
                  )}
                >
                  <td className="px-4 py-3 font-mono text-xs font-medium">{inc.id}</td>
                  <td className="px-4 py-3 font-medium">{inc.type}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">{inc.location.name}</td>
                  <td className="px-4 py-3 text-center">
                    <SeverityBadge level={sevColor as any} label={`${inc.severity}`} pulse={inc.severity >= 5} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "font-mono font-bold text-sm",
                      inc.priorityScore >= 90 ? "text-red-600" :
                      inc.priorityScore >= 75 ? "text-orange-600" :
                      inc.priorityScore >= 50 ? "text-amber-600" : "text-green-600"
                    )}>
                      {inc.priorityScore}
                    </span>
                    <span className="ml-1 text-[10px] text-muted-foreground">{priLabel}</span>
                  </td>
                  {!compact && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className={cn(
                          "font-mono text-xs font-semibold",
                          inc.survivalWindow <= 4 ? "text-red-600" :
                          inc.survivalWindow <= 8 ? "text-orange-600" : "text-foreground"
                        )}>
                          {inc.survivalWindow}h
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="font-mono text-xs">{inc.peopleAffected.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <SeverityBadge
                      level={inc.status === "Resolved" ? "low" : inc.status === "In Progress" ? "high" : inc.status === "Assigned" ? "info" : "medium"}
                      label={inc.status}
                    />
                  </td>
                  {!compact && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {inc.hasImage && <span title="Image verified"><Image className="h-3.5 w-3.5 text-severity-info" /></span>}
                        {inc.urgencyKeywords.length > 0 && <span title="Urgency detected"><Shield className="h-3.5 w-3.5 text-severity-critical" /></span>}
                        {inc.clusterMultiplier > 1 && (
                          <span className="text-[10px] font-mono text-orange-600 font-bold" title="Cluster multiplier">
                            ×{inc.clusterMultiplier}
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
