import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AlertTriangle, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PredictionResult {
  risk_score: number;
  confidence: number;
  disaster_type: string;
}

interface RiskResultCardProps {
  result: PredictionResult;
}

export function RiskResultCard({ result }: RiskResultCardProps) {
  const riskScore = Math.round(result.risk_score);
  const confidence = Math.round(result.confidence);
  
  const getRiskLevel = (score: number) => {
    if (score <= 40) return { label: "Low", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30", icon: CheckCircle };
    if (score <= 70) return { label: "Medium", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30", icon: AlertCircle };
    return { label: "Critical", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", icon: AlertTriangle };
  };

  const riskLevel = getRiskLevel(riskScore);
  const RiskIcon = riskLevel.icon;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // Animated number counter
  const AnimatedNumber = ({ value, duration = 2 }: { value: number; duration?: number }) => {
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

  const chartData = [
    { name: "Risk Score", value: riskScore, color: riskScore <= 40 ? "#22c55e" : riskScore <= 70 ? "#f97316" : "#ef4444" },
    { name: "Confidence", value: confidence, color: "#0ea5e9" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Main Risk Score Card */}
      <motion.div
        variants={itemVariants}
        className={cn(
          "glass-card rounded-xl p-8 border",
          riskLevel.bg,
          riskLevel.border
        )}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <RiskIcon className={cn("h-6 w-6", riskLevel.color)} />
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Risk Assessment</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI Model: <span className="font-mono font-bold text-foreground">{result.disaster_type.toUpperCase()}</span>
              </p>
            </div>
          </div>
          <motion.span
            className={cn("rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wider", riskLevel.color, riskLevel.bg)}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {riskLevel.label}
          </motion.span>
        </div>

        {/* Score Display */}
        <div className="mb-8">
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-6xl font-bold font-mono tracking-tight">
              <AnimatedNumber value={riskScore} duration={1.5} />
            </div>
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
          <p className="text-sm text-muted-foreground">Risk Score</p>
        </div>

        {/* Risk Score Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Threat Level</span>
            <span className="font-mono font-bold text-foreground">{riskScore}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                riskScore <= 40 ? "bg-green-500" : riskScore <= 70 ? "bg-orange-500" : "bg-red-500"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${riskScore}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Severity Zones */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg bg-green-500/10 border border-green-500/30 px-3 py-2 text-center">
            <span className="font-medium text-green-600">0–40</span>
            <p className="text-[11px] text-muted-foreground">Low Risk</p>
          </div>
          <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 px-3 py-2 text-center">
            <span className="font-medium text-orange-600">41–70</span>
            <p className="text-[11px] text-muted-foreground">Medium Risk</p>
          </div>
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-center">
            <span className="font-medium text-red-600">71–100</span>
            <p className="text-[11px] text-muted-foreground">Critical Risk</p>
          </div>
        </div>
      </motion.div>

      {/* Confidence & Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Confidence Card */}
        <motion.div
          variants={itemVariants}
          className="glass-card rounded-xl p-6 border border-border/40"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" />
            Model Confidence
          </h3>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-5xl font-bold font-mono">
                <AnimatedNumber value={confidence} duration={1.5} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Prediction Confidence</p>
            </div>
            <div className="flex-1">
              <div className="w-full h-32 flex items-end gap-1">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 bg-accent/40 rounded-t"
                    initial={{ height: 0 }}
                    animate={{
                      height: i < Math.round(confidence / 10) ? "100%" : "20%",
                    }}
                    transition={{ delay: i * 0.05, duration: 1.5 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chart Card */}
        <motion.div
          variants={itemVariants}
          className="glass-card rounded-xl p-6 border border-border/40"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Score Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
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
      </div>

      {/* Action Alert */}
      <motion.div
        variants={itemVariants}
        className={cn(
          "rounded-xl border p-5 flex items-start gap-4",
          riskScore <= 40
            ? "bg-green-500/5 border-green-500/20"
            : riskScore <= 70
              ? "bg-orange-500/5 border-orange-500/20"
              : "bg-red-500/5 border-red-500/20"
        )}
      >
        <RiskIcon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", riskLevel.color)} />
        <div className="flex-1">
          <h4 className={cn("font-semibold text-sm", riskLevel.color)}>
            {riskScore <= 40
              ? "Low Risk - Monitor Situation"
              : riskScore <= 70
                ? "Medium Risk - Activate Response Protocol"
                : "Critical Risk - Emergency Response Required"}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {riskScore <= 40
              ? "Current threat level is manageable. Continue standard monitoring procedures."
              : riskScore <= 70
                ? "Activate intermediate response measures. Alert NGO partners and mobilize resources."
                : "Activate emergency response. Mobilize all available resources and alert government agencies immediately."}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
