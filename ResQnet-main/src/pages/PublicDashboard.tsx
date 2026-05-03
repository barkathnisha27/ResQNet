import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SeverityBadge } from "@/components/dashboard/SeverityBadge";
import { useAuth } from "@/lib/authContext";
import { MOCK_INCIDENTS, getSeverityColor, type DisasterType, type Incident } from "@/lib/mockData";
import { FileText, AlertTriangle, CheckCircle, Clock, Send, Upload, MapPin, Shield, Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const disasterTypes: DisasterType[] = ["Flood", "Earthquake", "Fire", "Cyclone", "Landslide", "Other"];

export default function PublicDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"report" | "my-reports" | "profile">("report");

  // Report form state
  const [disasterType, setDisasterType] = useState<DisasterType>("Flood");
  const [severity, setSeverity] = useState(3);
  const [affected, setAffected] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const myReports = MOCK_INCIDENTS.filter(i => i.reportedBy === "c1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const reliabilityPct = user?.reliability || 87;
  const trustBadge = reliabilityPct >= 85 ? "Trusted Contributor" : reliabilityPct >= 60 ? "Verified Citizen" : "New Reporter";
  const trustColor = reliabilityPct >= 85 ? "low" : reliabilityPct >= 60 ? "info" : "medium";

  return (
    <div className="min-h-screen command-center-bg">
      <div className="scanline-overlay" />
      <div className="hex-pattern" />
      <DashboardHeader />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: "report", label: "Report Incident", icon: Send },
            { key: "my-reports", label: "My Reports", icon: FileText },
            { key: "profile", label: "My Profile", icon: Shield },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                tab === t.key ? "bg-primary text-primary-foreground" : "glass-card text-foreground hover:bg-muted/50"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Report Tab */}
        {tab === "report" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-5">Submit Incident Report</h2>
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <CheckCircle className="h-12 w-12 text-severity-low mx-auto" />
                <p className="text-lg font-semibold text-foreground">Report Submitted Successfully</p>
                <p className="text-sm text-muted-foreground">AI Priority Score: <span className="font-mono font-bold text-severity-high">78</span></p>
                <p className="text-sm text-muted-foreground">Estimated Response Window: <span className="font-mono font-bold">45 min</span></p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Disaster Type</label>
                    <select
                      value={disasterType}
                      onChange={e => setDisasterType(e.target.value as DisasterType)}
                      className="mt-1.5 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground"
                    >
                      {disasterTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">People Affected</label>
                    <input
                      type="number"
                      value={affected}
                      onChange={e => setAffected(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground"
                      placeholder="Estimated number"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Severity Level: <span className="font-mono text-foreground">{severity}/5</span>
                  </label>
                  <input
                    type="range"
                    min={1} max={5}
                    value={severity}
                    onChange={e => setSeverity(Number(e.target.value))}
                    className="mt-2 w-full accent-accent"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Minor</span><span>Moderate</span><span>Severe</span><span>Critical</span><span>Catastrophic</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground min-h-[100px]"
                    placeholder="Describe the situation in detail. Include keywords like 'trapped', 'urgent', 'collapsed' for priority boost."
                  />
                </div>
                <div className="flex gap-4">
                  <button type="button" className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted/50">
                    <Upload className="h-4 w-4" /> Upload Image
                  </button>
                  <button type="button" className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted/50">
                    <MapPin className="h-4 w-4" /> Auto-detect Location
                  </button>
                </div>
                <button type="submit" className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                  Submit Report
                </button>
              </form>
            )}
          </motion.div>
        )}

        {/* My Reports Tab */}
        {tab === "my-reports" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard title="Total Reports" value={12} icon={FileText} />
              <MetricCard title="Active" value={3} icon={AlertTriangle} variant="warning" />
              <MetricCard title="Resolved" value={8} icon={CheckCircle} variant="success" />
              <MetricCard title="Avg Response" value={42} suffix=" min" icon={Clock} />
            </div>
            <div className="space-y-3">
              {myReports.length > 0 ? myReports.map(inc => (
                <div key={inc.id} className="glass-card rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-medium text-muted-foreground">{inc.id}</span>
                        <SeverityBadge level={getSeverityColor(inc.severity) as any} label={inc.type} />
                        <SeverityBadge level={inc.status === "Resolved" ? "low" : "high"} label={inc.status} />
                      </div>
                      <p className="text-sm text-foreground mt-1">{inc.description.slice(0, 100)}...</p>
                      <p className="text-xs text-muted-foreground mt-2">{inc.location.name}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xs text-muted-foreground">Priority</p>
                      <p className="text-2xl font-bold font-mono text-foreground">{inc.priorityScore}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                    {inc.assignedNgo && <span>Assigned: <span className="text-foreground font-medium">Red Cross India</span></span>}
                    <span>Survival: <span className="font-mono text-foreground">{inc.survivalWindow}h</span></span>
                    <span>ETA: <span className="font-mono text-foreground">{inc.estimatedResponseTime}min</span></span>
                    {inc.hasImage && <span className="text-severity-info">✓ Image Verified</span>}
                  </div>
                </div>
              )) : (
                <div className="glass-card rounded-xl p-12 text-center">
                  <p className="text-muted-foreground">No reports yet. Submit your first incident report.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Profile Tab */}
        {tab === "profile" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-5">Citizen Reliability Intelligence</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <span className="text-3xl font-bold font-mono text-accent">{reliabilityPct}%</span>
                </div>
                <p className="text-sm font-semibold text-foreground">Reliability Score</p>
                <SeverityBadge level={trustColor as any} label={trustBadge} />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Verified Reports</span>
                  <span className="font-mono font-bold text-foreground">{user?.verifiedReports || 12}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">False Reports</span>
                  <span className="font-mono font-bold text-severity-critical">{user?.falseReports || 1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Trust Level</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={cn("h-4 w-4", s <= 4 ? "text-severity-medium fill-severity-medium" : "text-border")} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">How it works</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your reliability score influences priority weighting of your future reports. Verified reports increase your score, while false reports decrease it.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
