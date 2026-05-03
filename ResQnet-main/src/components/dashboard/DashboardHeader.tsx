import { useAuth, type UserRole } from "@/lib/authContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Shield, Radio, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationSystem } from "./NotificationSystem";

const roleLabels: Record<UserRole, string> = {
  citizen: "Public Citizen",
  ngo: "NGO Operator",
  government: "Government Admin",
};

const roleColors: Record<UserRole, string> = {
  citizen: "bg-blue-100 text-blue-700",
  ngo: "bg-emerald-100 text-emerald-700",
  government: "bg-purple-100 text-purple-700",
};

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  const isGovernment = user.role === "government";
  const isOnPredictionPage = location.pathname === "/ai-prediction";

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-border/40 rounded-none">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">ResQNet</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-green-600 font-medium">
              <Radio className="h-3 w-3 animate-pulse" />
              System Online
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground font-mono">27 FEB 2026 • UTC+5:30</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationSystem />
          
          {/* AI Prediction Center Button for Government Users */}
          {isGovernment && (
            <button
              onClick={() => navigate(isOnPredictionPage ? "/command" : "/ai-prediction")}
              className={cn(
                "hidden md:inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isOnPredictionPage
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
              )}
              title={isOnPredictionPage ? "Back to Command Center" : "Open AI Prediction Center"}
            >
              <Brain className="h-4 w-4" />
              {isOnPredictionPage ? "Command Center" : "AI Prediction"}
            </button>
          )}
          
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", roleColors[user.role])}>
            {roleLabels[user.role]}
          </span>
          <span className="text-sm font-medium text-foreground hidden sm:inline">{user.name}</span>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
