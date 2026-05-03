import { useState } from "react";
import { useAuth, type UserRole } from "@/lib/authContext";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, Building2, Landmark, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const roles: { value: UserRole; label: string; desc: string; icon: typeof Eye }[] = [
  { value: "citizen", label: "Public Citizen", desc: "Report incidents & track responses", icon: Eye },
  { value: "ngo", label: "NGO Operator", desc: "Manage resources & respond to incidents", icon: Building2 },
  { value: "government", label: "Government Admin", desc: "Command center & full oversight", icon: Landmark },
];

const dashboardRoutes: Record<UserRole, string> = {
  citizen: "/citizen",
  ngo: "/ngo",
  government: "/command",
};

export default function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<UserRole>("citizen");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      login(email, password, role);
    } else {
      signup(name, email, password, role);
    }
    navigate(dashboardRoutes[role]);
  };

  return (
    <div className="min-h-screen command-center-bg flex">
      <div className="scanline-overlay" />
      <div className="hex-pattern" />
      {/* Left hero panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/20" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, hsla(187, 80%, 52%, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsla(187, 80%, 52%, 0.2) 0%, transparent 40%)"
        }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-accent/20 backdrop-blur-sm flex items-center justify-center border border-accent/30">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <span className="text-2xl font-bold text-primary-foreground tracking-tight">ResQNet</span>
          </div>
          <p className="text-primary-foreground/60 text-sm mt-1 font-mono">v2.4.1 • ACTIVE</p>
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-primary-foreground leading-tight">
            Autonomous Disaster<br />Intelligence System
          </h1>
          <p className="text-primary-foreground/70 text-lg max-w-md leading-relaxed">
            AI-driven orchestration platform for predictive risk modeling, dynamic resource optimization, and real-time coordination.
          </p>
          <div className="flex gap-6 pt-4">
            {[
              { label: "Active Incidents", value: "7" },
              { label: "NGOs Online", value: "4" },
              { label: "System Uptime", value: "99.97%" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-accent font-mono">{s.value}</p>
                <p className="text-xs text-primary-foreground/50 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-xs text-primary-foreground/40 font-mono">NDMA CERTIFIED • ISO 27001 • ENCRYPTED</p>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ResQNet</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {mode === "login" ? "Sign in to your account" : "Create your account"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login" ? "Access your disaster response dashboard" : "Join the disaster response network"}
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2">
            {roles.map(r => {
              const Icon = r.icon;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={cn(
                    "rounded-xl p-3 text-center border-2 transition-all duration-200",
                    role === r.value
                      ? "border-accent bg-accent/5 shadow-sm"
                      : "border-border/50 hover:border-border bg-card"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 mx-auto mb-1.5",
                    role === r.value ? "text-accent" : "text-muted-foreground"
                  )} />
                  <p className="text-xs font-semibold text-foreground leading-tight">{r.label}</p>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {mode === "login" ? "Sign In" : "Create Account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-semibold text-accent hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
