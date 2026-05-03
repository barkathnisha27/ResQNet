import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { IncidentTable } from "@/components/dashboard/IncidentTable";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { SeverityBadge } from "@/components/dashboard/SeverityBadge";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";
import { IncidentMap } from "@/components/dashboard/IncidentMap";
import {
  MOCK_INCIDENTS, MOCK_NGOS, MOCK_CAMPS, MOCK_ACTIVITY,
  getSeverityColor, type Incident
} from "@/lib/mockData";
import {
  AlertTriangle, Activity, Layers, Clock, BarChart3, Building2,
  Zap, TrendingUp, PlayCircle, Pause, Settings2, Map
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts";

const severityDistribution = [
  { name: "Critical (5)", value: 2, color: "hsl(0, 84%, 50%)" },
  { name: "High (4)", value: 3, color: "hsl(25, 95%, 53%)" },
  { name: "Medium (3)", value: 1, color: "hsl(38, 92%, 50%)" },
  { name: "Low (1-2)", value: 1, color: "hsl(142, 71%, 45%)" },
];

const responseTimeTrend = [
  { time: "06:00", avg: 45 },
  { time: "07:00", avg: 38 },
  { time: "08:00", avg: 52 },
  { time: "09:00", avg: 35 },
  { time: "10:00", avg: 42 },
  { time: "11:00", avg: 30 },
  { time: "12:00", avg: 28 },
];

export default function GovernmentDashboard() {
  const [simMode, setSimMode] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [autoAssigning, setAutoAssigning] = useState(false);

  const criticalCount = MOCK_INCIDENTS.filter(i => i.severity >= 5).length;
  const clusterCount = 2; // Mock
  const avgResponse = 38;

  const handleAutoAssign = () => {
    setAutoAssigning(true);
    setTimeout(() => setAutoAssigning(false), 2500);
  };

  return (
    <div className="min-h-screen command-center-bg">
      <div className="scanline-overlay" />
      <div className="hex-pattern" />
      <div className="radar-sweep" />
      <DashboardHeader />

      <div className="relative z-10 px-4 lg:px-6 py-5 space-y-5">
        {/* Top command bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Command Center</h1>
            <p className="text-sm text-muted-foreground">Real-time disaster intelligence & coordination</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSimMode(!simMode)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all border",
                simMode
                  ? "bg-severity-high/10 border-severity-high/30 text-severity-high"
                  : "glass-card text-foreground hover:bg-muted/50"
              )}
            >
              {simMode ? <Pause className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
              {simMode ? "Exit Simulation" : "Simulation Mode"}
            </button>
            <button
              onClick={handleAutoAssign}
              disabled={autoAssigning}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              {autoAssigning ? "Optimizing..." : "Auto Optimize Allocation"}
            </button>
          </div>
        </div>

        {/* Simulation banner */}
        <AnimatePresence>
          {simMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border-2 border-dashed border-severity-high/40 bg-severity-high/5 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Settings2 className="h-5 w-5 text-severity-high" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-severity-high">Simulation Mode Active</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: "Rainfall +", value: "40%" },
                  { label: "Earthquake Mag", value: "7.2" },
                  { label: "Road Blocked", value: "25%" },
                  { label: "Hospital Cap", value: "-30%" },
                  { label: "NGO Resources", value: "-20%" },
                ].map(s => (
                  <div key={s.label} className="rounded-lg bg-background/80 p-3 text-center">
                    <p className="text-lg font-bold font-mono text-severity-high">{s.value}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto-assign result */}
        <AnimatePresence>
          {autoAssigning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card rounded-xl p-5 border-accent/30 border"
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-accent animate-pulse" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-accent">AI Allocation Engine Processing</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>→ INC-003 (Fire, Mumbai) → <span className="text-foreground font-medium">Save the Children</span> — closest, 0 workload, 86 perf score</p>
                <p>→ INC-006 (Flood, Delhi) → <span className="text-foreground font-medium">Red Cross India</span> — within cluster zone, high reliability</p>
                <p className="text-xs text-accent font-mono mt-2">Estimated total arrival improvement: -18 minutes avg</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <MetricCard title="Active Incidents" value={MOCK_INCIDENTS.length} icon={AlertTriangle} variant="warning" />
          <MetricCard title="Critical Cases" value={criticalCount} icon={Activity} variant="critical" />
          <MetricCard title="Cluster Zones" value={clusterCount} icon={Layers} variant="warning" />
          <MetricCard title="Avg Response" value={avgResponse} suffix=" min" icon={Clock} trend={{ value: -12, label: "vs yesterday" }} />
          <MetricCard title="NGO Efficiency" value={89} suffix="%" icon={TrendingUp} variant="success" />
          <MetricCard title="Camp Occupancy" value={72} suffix="%" icon={Building2} />
        </div>

        {/* Live Intelligence Map */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Live Multimodal Disaster Intelligence Map</h3>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Real-time
            </span>
          </div>
          <IncidentMap
            incidents={MOCK_INCIDENTS}
            onSelectIncident={setSelectedIncident}
            className="h-[420px]"
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Incident table - 2 cols */}
          <div className="lg:col-span-2">
            <IncidentTable incidents={MOCK_INCIDENTS} onSelect={setSelectedIncident} />
          </div>

          {/* Activity feed */}
          <div>
            <ActivityFeed events={MOCK_ACTIVITY} />
          </div>
        </div>

        {/* Bottom row: Charts + Camps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Severity distribution */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Severity Distribution</h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={severityDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                    {severityDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {severityDistribution.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Response time trend */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Response Time Trend</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={responseTimeTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit="m" />
                  <Tooltip />
                  <Area type="monotone" dataKey="avg" stroke="hsl(187, 80%, 42%)" fill="hsl(187, 80%, 42%)" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Relief camps */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Relief Camps</h3>
            <div className="space-y-3">
              {MOCK_CAMPS.map(camp => {
                const pct = Math.round((camp.occupied / camp.capacity) * 100);
                const isOvercrowded = pct >= 90;
                return (
                  <div key={camp.id} className={cn("rounded-lg border p-3", isOvercrowded ? "border-severity-critical/30 bg-severity-critical/5" : "border-border/40")}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">{camp.name}</p>
                      <SeverityBadge
                        level={isOvercrowded ? "critical" : pct >= 70 ? "medium" : "low"}
                        label={`${pct}%`}
                      />
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          isOvercrowded ? "bg-severity-critical" : pct >= 70 ? "bg-severity-medium" : "bg-severity-low"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                      <span>{camp.occupied}/{camp.capacity} beds</span>
                      <span>Medical: {camp.medicalSupport}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected incident detail */}
        <AnimatePresence>
          {selectedIncident && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="glass-card rounded-xl p-6 border-accent/20 border"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-foreground">{selectedIncident.id}</span>
                    <SeverityBadge level={getSeverityColor(selectedIncident.severity) as any} label={selectedIncident.type} pulse={selectedIncident.severity >= 5} />
                  </div>
                  <p className="text-sm text-foreground mt-1">{selectedIncident.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{selectedIncident.location.name}</p>
                </div>
                <button onClick={() => setSelectedIncident(null)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Priority Score</p>
                  <p className="text-2xl font-bold font-mono text-foreground">{selectedIncident.priorityScore}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Survival Window</p>
                  <p className={cn("text-2xl font-bold font-mono", selectedIncident.survivalWindow <= 4 ? "text-severity-critical" : "text-foreground")}>
                    {selectedIncident.survivalWindow}h
                  </p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">People Affected</p>
                  <p className="text-2xl font-bold font-mono text-foreground">{selectedIncident.peopleAffected.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Cluster Multiplier</p>
                  <p className="text-2xl font-bold font-mono text-foreground">×{selectedIncident.clusterMultiplier}</p>
                </div>
              </div>
              {selectedIncident.urgencyKeywords.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-severity-critical">Urgency Keywords:</span>
                  {selectedIncident.urgencyKeywords.map(k => (
                    <span key={k} className="rounded-full bg-severity-critical/10 px-2 py-0.5 text-xs font-mono text-severity-critical border border-severity-critical/20">{k}</span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
