import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { AlertTriangle, CheckCircle, AlertCircle, Zap, Users, Ambulance, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { NgoSimulationInput } from "./NgoSimulationForm";

export interface NgoSimulationResult {
  risk_score: number;
  confidence: number;
  disaster_type: string;
  // Calculated metrics
  response_complexity: number;
  required_volunteers: number;
  estimated_ambulances_needed: number;
  feasibility_score: number;
  feasibility_status: "sufficient" | "limited" | "insufficient";
  resource_deficit: {
    volunteers: number;
    ambulances: number;
    medical_kits: number;
  };
}

interface NgoResultPanelProps {
  simulationInput: NgoSimulationInput;
  apiResult: {
    risk_score: number;
    confidence: number;
  };
}

export function NgoResultPanel({ simulationInput, apiResult }: NgoResultPanelProps) {
  // Calculate NGO operational metrics
  const response_complexity = Math.round(apiResult.risk_score * 0.7);
  const required_volunteers = Math.round(simulationInput.people_affected * 0.2);
  const estimated_ambulances_needed = Math.ceil(simulationInput.people_affected / 150);
  const estimated_medical_kits_needed = Math.ceil(simulationInput.people_affected / 8);

  // Calculate deficits
  const volunteer_deficit = Math.max(0, required_volunteers - simulationInput.available_volunteers);
  const ambulance_deficit = Math.max(0, estimated_ambulances_needed - simulationInput.available_ambulances);
  const medical_kit_deficit = Math.max(0, estimated_medical_kits_needed - simulationInput.medical_kits);
  const total_deficit = volunteer_deficit + ambulance_deficit + medical_kit_deficit;

  // Calculate feasibility score (0-100)
  const volunteer_sufficiency = Math.min(100, (simulationInput.available_volunteers / required_volunteers) * 100);
  const ambulance_sufficiency = Math.min(100, (simulationInput.available_ambulances / estimated_ambulances_needed) * 100);
  const medical_kit_sufficiency = Math.min(100, (simulationInput.medical_kits / estimated_medical_kits_needed) * 100);
  const fuel_factor = simulationInput.fuel_capacity >= 60 ? 100 : (simulationInput.fuel_capacity / 60) * 100;

  const feasibility_score = Math.round(
    (volunteer_sufficiency * 0.4 + ambulance_sufficiency * 0.3 + medical_kit_sufficiency * 0.2 + fuel_factor * 0.1)
  );

  // Determine feasibility status
  const getFeasibilityStatus = (score: number) => {
    if (score >= 80) return "sufficient";
    if (score >= 50) return "limited";
    return "insufficient";
  };

  const feasibility_status = getFeasibilityStatus(feasibility_score);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "sufficient":
        return {
          label: "Deployment Ready",
          color: "text-green-600",
          bg: "bg-green-500/10",
          border: "border-green-500/30",
          icon: CheckCircle,
          recommendation: "Configure deployment plan. Resources are sufficient for operational response.",
        };
      case "limited":
        return {
          label: "Resource Constrained",
          color: "text-orange-600",
          bg: "bg-orange-500/10",
          border: "border-orange-500/30",
          icon: AlertCircle,
          recommendation: "Consider requesting additional resources or external NGO partnerships.",
        };
      default:
        return {
          label: "Insufficient Resources",
          color: "text-red-600",
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          icon: AlertTriangle,
          recommendation: "Critical resource shortage. Escalate to government coordination center.",
        };
    }
  };

  const statusInfo = getStatusInfo(feasibility_status);
  const StatusIcon = statusInfo.icon;

  // Animated number counter
  const AnimatedNumber = ({ value, duration = 1.5 }: { value: number; duration?: number }) => {
    const countRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const start = 0;
      const increment = value / (duration * 60);
      let current = start;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          current = value;
          clearInterval(timer);
        }
        if (countRef.current) {
          countRef.current.textContent = Math.round(current).toString();
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }, [value, duration]);

    return <div ref={countRef}>0</div>;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const chartData = [
    { name: "Risk", value: Math.round(apiResult.risk_score), color: "#ef4444" },
    { name: "Complexity", value: response_complexity, color: "#f97316" },
    { name: "Feasibility", value: feasibility_score, color: "#22c55e" },
  ];

  const resourceData = [
    { name: "Volunteers", value: simulationInput.available_volunteers, required: required_volunteers, fill: "#f59e0b" },
    { name: "Ambulances", value: simulationInput.available_ambulances, required: estimated_ambulances_needed, fill: "#ef4444" },
    { name: "Medical Kits", value: simulationInput.medical_kits, required: estimated_medical_kits_needed, fill: "#10b981" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Feasibility Status Card */}
      <motion.div
        variants={itemVariants}
        className={cn(
          "glass-card rounded-xl p-8 border",
          statusInfo.bg,
          statusInfo.border
        )}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <StatusIcon className={cn("h-6 w-6", statusInfo.color)} />
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Deployment Feasibility</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Scenario: <span className="font-mono font-bold text-foreground">{simulationInput.disaster_type.toUpperCase()}</span>
              </p>
            </div>
          </div>
          <motion.span
            className={cn("rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wider", statusInfo.color, statusInfo.bg)}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {statusInfo.label}
          </motion.span>
        </div>

        {/* Score Display */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-6xl font-bold font-mono tracking-tight">
              <AnimatedNumber value={feasibility_score} duration={1.5} />
            </div>
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
          <p className="text-sm text-muted-foreground">Feasibility Score</p>
        </div>

        {/* Feasibility Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Readiness Level</span>
            <span className="font-mono font-bold text-foreground">{feasibility_score}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                feasibility_score >= 80 ? "bg-green-500" : feasibility_score >= 50 ? "bg-orange-500" : "bg-red-500"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${feasibility_score}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Recommendation */}
        <div className="rounded-lg bg-foreground/5 p-4">
          <p className={cn("text-sm font-medium", statusInfo.color)}>
            {statusInfo.recommendation}
          </p>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Response Complexity",
            value: response_complexity,
            max: 100,
            icon: Zap,
            color: "text-orange-500",
          },
          {
            label: "Risk Score",
            value: Math.round(apiResult.risk_score),
            max: 100,
            icon: AlertTriangle,
            color: "text-red-500",
          },
          {
            label: "Model Confidence",
            value: Math.round(apiResult.confidence),
            max: 100,
            icon: CheckCircle,
            color: "text-green-500",
          },
          {
            label: "Feasibility",
            value: feasibility_score,
            max: 100,
            icon: Users,
            color: "text-blue-500",
          },
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              className="glass-card rounded-xl p-5 border border-border/40"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{metric.label}</p>
                <Icon className={cn("h-4 w-4", metric.color)} />
              </div>
              <div className="mb-3">
                <p className="text-3xl font-bold font-mono">
                  <AnimatedNumber value={metric.value} duration={1.5} />
                </p>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(metric.value / metric.max) * 100}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Resource Requirements vs Available */}
      <motion.div variants={itemVariants} className="glass-card rounded-xl p-6 border border-border/40">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-5">Resource Requirements vs Available</h3>
        <div className="space-y-4">
          {[
            {
              label: "Volunteers",
              available: simulationInput.available_volunteers,
              required: required_volunteers,
              deficit: volunteer_deficit,
              icon: Users,
              color: "#f59e0b",
            },
            {
              label: "Ambulances",
              available: simulationInput.available_ambulances,
              required: estimated_ambulances_needed,
              deficit: ambulance_deficit,
              icon: Ambulance,
              color: "#ef4444",
            },
            {
              label: "Medical Kits",
              available: simulationInput.medical_kits,
              required: estimated_medical_kits_needed,
              deficit: medical_kit_deficit,
              icon: Package,
              color: "#10b981",
            },
          ].map((resource, i) => {
            const Icon = resource.icon;
            const hasDeficit = resource.deficit > 0;
            return (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" style={{ color: resource.color }} />
                    <span className="text-sm font-medium text-foreground">{resource.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      {resource.available} / {resource.required}
                    </p>
                    {hasDeficit && (
                      <p className="text-xs text-severity-critical font-semibold">
                        Deficit: {resource.deficit}
                      </p>
                    )}
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-muted overflow-hidden flex gap-1">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: resource.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(resource.available / resource.required) * 100}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Total Deficit Alert */}
      {total_deficit > 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-severity-high/30 bg-severity-high/5 p-5 flex items-start gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-severity-high flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm text-severity-high">Resource Shortage Alert</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Your organization is short by <span className="font-bold text-severity-high">{total_deficit} resources</span> total.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Consider requesting assistance from partner NGOs or requesting government resources.
            </p>
          </div>
        </motion.div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Metrics Comparison */}
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6 border border-border/40">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Assessment Metrics</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sufficiency Metrics */}
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6 border border-border/40">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Resource Sufficiency</h3>
          <div className="space-y-3">
            {[
              { label: "Volunteers", value: Math.min(100, volunteer_sufficiency), color: "#f59e0b" },
              { label: "Ambulances", value: Math.min(100, ambulance_sufficiency), color: "#ef4444" },
              { label: "Medical Kits", value: Math.min(100, medical_kit_sufficiency), color: "#10b981" },
              { label: "Fuel Reserves", value: fuel_factor, color: "#3b82f6" },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground font-medium">{item.label}</span>
                  <span className="text-sm font-bold font-mono" style={{ color: item.color }}>
                    {Math.round(item.value)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Action Summary */}
      <motion.div
        variants={itemVariants}
        className={cn(
          "rounded-xl border p-5 space-y-3",
          feasibility_score >= 80
            ? "bg-green-500/5 border-green-500/20"
            : feasibility_score >= 50
              ? "bg-orange-500/5 border-orange-500/20"
              : "bg-red-500/5 border-red-500/20"
        )}
      >
        <h4 className={cn(
          "font-semibold text-sm",
          feasibility_score >= 80
            ? "text-green-600"
            : feasibility_score >= 50
              ? "text-orange-600"
              : "text-red-600"
        )}>
          Operational Readiness Assessment
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li>
            <strong>Estimated Volunteers Needed:</strong> {required_volunteers}
            {volunteer_deficit > 0 && <span className="text-severity-critical font-semibold"> (Deficit: {volunteer_deficit})</span>}
          </li>
          <li>
            <strong>Estimated Ambulances:</strong> {estimated_ambulances_needed}
            {ambulance_deficit > 0 && <span className="text-severity-critical font-semibold"> (Deficit: {ambulance_deficit})</span>}
          </li>
          <li>
            <strong>Medical Kits Required:</strong> {estimated_medical_kits_needed}
            {medical_kit_deficit > 0 && <span className="text-severity-critical font-semibold"> (Deficit: {medical_kit_deficit})</span>}
          </li>
          <li>
            <strong>Response Complexity Score:</strong> {response_complexity}/100
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
