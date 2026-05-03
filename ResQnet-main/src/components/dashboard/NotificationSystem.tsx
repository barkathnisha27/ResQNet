import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Volume2, VolumeX, Bell } from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  timestamp: Date;
  read: boolean;
}

const SIMULATED_ALERTS: Omit<Notification, "id" | "timestamp" | "read">[] = [
  { title: "CRITICAL: Cyclone Landfall", message: "Category 4 cyclone making landfall at Chennai Coast. 5,200 people at risk.", severity: "critical" },
  { title: "Cluster Zone Expanded", message: "Delhi NCR cluster zone now includes 4 incidents. Risk multiplier increased to 1.6×", severity: "high" },
  { title: "Resource Shortage", message: "Mercy Corps fuel supply critically low at 55%. Resupply urgently needed.", severity: "high" },
  { title: "Camp Overcrowding", message: "River Basin Shelter at 97.5% capacity. Redirect incoming evacuees.", severity: "high" },
  { title: "New Incident", message: "Wildfire reported near Bangalore outskirts. 310 people affected.", severity: "medium" },
  { title: "NGO Assignment", message: "NDRF Unit 7 auto-assigned to earthquake response in Jaipur.", severity: "info" },
  { title: "CRITICAL: Survival Window", message: "INC-001 survival window dropping below 4 hours. Immediate action required.", severity: "critical" },
  { title: "Road Blockage", message: "National Highway blocked by landslide near Dehradun. Alternate routes being calculated.", severity: "medium" },
];

// Simple beep using Web Audio API
function playAlertSound(severity: "critical" | "high" | "medium" | "low" | "info") {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (severity === "critical") {
      osc.frequency.value = 880;
      osc.type = "square";
      gain.gain.value = 0.15;
      osc.start();
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      osc.stop(ctx.currentTime + 0.45);
    } else if (severity === "high") {
      osc.frequency.value = 660;
      osc.type = "sine";
      gain.gain.value = 0.1;
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.frequency.value = 520;
      osc.type = "sine";
      gain.gain.value = 0.06;
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }

    osc.onended = () => ctx.close();
  } catch {
    // Audio not available
  }
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toast, setToast] = useState<Notification | null>(null);
  const alertIndexRef = useRef(0);

  const addNotification = useCallback((alert: Omit<Notification, "id" | "timestamp" | "read">) => {
    const notif: Notification = {
      ...alert,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [notif, ...prev].slice(0, 50));
    setToast(notif);
    if (soundEnabled) playAlertSound(notif.severity);
    setTimeout(() => setToast(prev => prev?.id === notif.id ? null : prev), 5000);
  }, [soundEnabled]);

  useEffect(() => {
    // Initial batch
    const initialTimeout = setTimeout(() => {
      addNotification(SIMULATED_ALERTS[0]);
    }, 3000);

    // Periodic alerts
    const interval = setInterval(() => {
      alertIndexRef.current = (alertIndexRef.current + 1) % SIMULATED_ALERTS.length;
      addNotification(SIMULATED_ALERTS[alertIndexRef.current]);
    }, 12000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <>
      {/* Notification bell button */}
      <button
        onClick={() => { setShowPanel(!showPanel); if (!showPanel) markAllRead(); }}
        className="relative rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        title={soundEnabled ? "Mute alerts" : "Enable alerts"}
      >
        {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </button>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 400, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed top-4 right-4 z-[100] max-w-sm rounded-xl border p-4 shadow-2xl backdrop-blur-xl",
              toast.severity === "critical"
                ? "bg-destructive/10 border-destructive/40 shadow-destructive/20"
                : toast.severity === "high"
                ? "bg-severity-high/10 border-severity-high/40"
                : "glass-card border-border"
            )}
          >
            <div className="flex items-start gap-3">
              {toast.severity === "critical" && (
                <AlertTriangle className="h-5 w-5 text-destructive animate-pulse flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-foreground">{toast.title}</p>
                  <SeverityBadge level={toast.severity} />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification panel */}
      <AnimatePresence>
        {showPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90]"
              onClick={() => setShowPanel(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed top-14 right-4 z-[95] w-96 max-h-[70vh] rounded-xl glass-card border border-border shadow-2xl overflow-hidden"
            >
              <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border p-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Live Alerts</h3>
                <span className="text-xs text-muted-foreground font-mono">{notifications.length} events</span>
              </div>
              <div className="overflow-y-auto max-h-[calc(70vh-56px)] p-2 space-y-1.5">
                {notifications.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">No alerts yet</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "rounded-lg p-3 border transition-colors",
                        n.severity === "critical"
                          ? "bg-destructive/5 border-destructive/20"
                          : n.severity === "high"
                          ? "bg-severity-high/5 border-severity-high/20"
                          : "bg-background/50 border-border/40"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold text-foreground flex-1">{n.title}</p>
                        <SeverityBadge level={n.severity} />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 font-mono mt-1.5">
                        {n.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
