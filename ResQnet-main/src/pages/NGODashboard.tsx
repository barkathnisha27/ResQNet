import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SeverityBadge } from "@/components/dashboard/SeverityBadge";
import { MOCK_INCIDENTS, MOCK_NGOS, getSeverityColor } from "@/lib/mockData";
import { Users, Ambulance, Package, Fuel, TrendingUp, CheckCircle, Clock, AlertTriangle, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function NGODashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"incidents" | "resources" | "performance">("incidents");
  const ngo = MOCK_NGOS[0]; // Red Cross
  const assignedIncidents = MOCK_INCIDENTS.filter(i => i.assignedNgo === "n1");

  const perfData = [
    { name: "Week 1", score: 88 },
    { name: "Week 2", score: 91 },
    { name: "Week 3", score: 87 },
    { name: "Week 4", score: 94 },
  ];

  return (
    <div className="min-h-screen command-center-bg">
      <div className="scanline-overlay" />
      <div className="hex-pattern" />
      <DashboardHeader />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="Active Cases" value={assignedIncidents.length} icon={AlertTriangle} variant="warning" />
          <MetricCard title="Resolved Total" value={ngo.resolvedCases} icon={CheckCircle} variant="success" />
          <MetricCard title="Avg Response" value={ngo.avgResponseTime} suffix=" min" icon={Clock} />
          <MetricCard title="Performance" value={ngo.performanceScore} suffix="%" icon={TrendingUp} />
        </div>

        {/* Action bar with tabs and simulation button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {[
              { key: "incidents", label: "Assigned Incidents" },
              { key: "resources", label: "Resources" },
              { key: "performance", label: "Performance" },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  tab === t.key ? "bg-primary text-primary-foreground" : "glass-card text-foreground hover:bg-muted/50"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate("/ngo/simulation")}
            className="hidden md:inline-flex items-center gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-500/20 transition-all"
            title="Open AI Readiness Simulation"
          >
            <Zap className="h-4 w-4" />
            AI Readiness Simulation
          </button>
        </div>

        {tab === "incidents" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {assignedIncidents.map(inc => (
              <div key={inc.id} className={cn("glass-card rounded-xl p-5", inc.severity >= 5 && "border-l-4 border-l-severity-critical")}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-medium text-muted-foreground">{inc.id}</span>
                      <SeverityBadge level={getSeverityColor(inc.severity) as any} label={inc.type} pulse={inc.severity >= 5} />
                      <SeverityBadge level={inc.status === "In Progress" ? "high" : "info"} label={inc.status} />
                      {inc.urgencyKeywords.length > 0 && (
                        <SeverityBadge level="critical" label="URGENT" />
                      )}
                    </div>
                    <p className="text-sm text-foreground">{inc.description.slice(0, 150)}...</p>
                    <p className="text-xs text-muted-foreground mt-2">{inc.location.name}</p>
                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                      <span>Affected: <span className="font-mono text-foreground font-medium">{inc.peopleAffected.toLocaleString()}</span></span>
                      <span>Priority: <span className="font-mono text-foreground font-bold">{inc.priorityScore}</span></span>
                      <span>Survival: <span className={cn("font-mono font-semibold", inc.survivalWindow <= 4 ? "text-severity-critical" : "text-foreground")}>{inc.survivalWindow}h</span></span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button className="rounded-lg bg-severity-low/10 px-3 py-1.5 text-xs font-semibold text-severity-low border border-severity-low/30 hover:bg-severity-low/20 transition-colors">
                      Update
                    </button>
                    <button className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent border border-accent/30 hover:bg-accent/20 transition-colors">
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {tab === "resources" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-5">Resource Inventory</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: "Volunteers", value: ngo.volunteers, icon: Users, color: "text-accent" },
                  { label: "Ambulances", value: ngo.ambulances, icon: Ambulance, color: "text-severity-critical" },
                  { label: "Medical Kits", value: ngo.medicalKits, icon: Package, color: "text-severity-low" },
                  { label: "Food Supplies", value: ngo.foodSupplies, icon: Package, color: "text-severity-medium" },
                  { label: "Fuel Level", value: ngo.fuelPercent, icon: Fuel, color: "text-severity-high", suffix: "%" },
                ].map(r => (
                  <div key={r.label} className="rounded-xl border border-border/50 p-4 text-center">
                    <r.icon className={cn("h-6 w-6 mx-auto mb-2", r.color)} />
                    <p className="text-2xl font-bold font-mono text-foreground">{r.value}{r.suffix || ""}</p>
                    <p className="text-xs text-muted-foreground mt-1">{r.label}</p>
                  </div>
                ))}
              </div>
              {ngo.fuelPercent < 60 && (
                <div className="mt-4 rounded-lg bg-severity-high/5 border border-severity-high/20 p-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-severity-high" />
                  <span className="text-sm text-severity-high font-medium">Fuel supply below 60% — resupply recommended</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === "performance" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Response Efficiency Index</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perfData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} domain={[80, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {perfData.map((_, i) => (
                        <Cell key={i} fill={i === perfData.length - 1 ? "hsl(187, 80%, 42%)" : "hsl(220, 14%, 86%)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">NGO Leaderboard</h3>
              <div className="space-y-3">
                {MOCK_NGOS.sort((a, b) => b.performanceScore - a.performanceScore).map((n, i) => (
                  <div key={n.id} className={cn("flex items-center gap-3 rounded-lg p-3 border", n.id === "n1" ? "border-accent/30 bg-accent/5" : "border-border/30")}>
                    <span className={cn("h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold", i === 0 ? "bg-severity-medium/20 text-severity-medium" : "bg-muted text-muted-foreground")}>
                      #{i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{n.name}</p>
                      <p className="text-xs text-muted-foreground">{n.resolvedCases} cases resolved</p>
                    </div>
                    <span className="font-mono font-bold text-lg text-foreground">{n.performanceScore}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
