import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/authContext";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NgoSimulationForm, type NgoSimulationInput } from "@/components/NgoSimulationForm";
import { NgoResultPanel } from "@/components/NgoResultPanel";
import { Brain, AlertTriangle, ArrowLeft, Loader, RefreshCw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock NGO resources (would come from context/real data in production)
const MOCK_NGO_RESOURCES = {
  volunteers: 50,
  ambulances: 8,
  medicalKits: 120,
  fuelPercent: 75,
};

export default function NgoSimulationPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Role-based protection
  if (!isAuthenticated || user?.role !== "ngo") {
    navigate("/ngo");
    return null;
  }

  const [simulationInput, setSimulationInput] = useState<NgoSimulationInput | null>(null);
  const [apiResult, setApiResult] = useState<{ risk_score: number; confidence: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async (data: NgoSimulationInput) => {
    setIsLoading(true);
    setError(null);
    setApiResult(null);
    setSimulationInput(data);

    try {
      // Prepare request
      const token = localStorage.getItem("access_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      // Make API call to /api/ml/predict/
      const response = await fetch("/api/ml/predict/", {
        method: "POST",
        headers,
        body: JSON.stringify({
          disaster_type: data.disaster_type,
          severity: data.severity,
          people_affected: data.people_affected,
          latitude: data.latitude,
          longitude: data.longitude,
        }),
      }).catch(() => {
        throw new Error("API endpoint not available");
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      setApiResult({
        risk_score: result.risk_score || 0,
        confidence: result.confidence || 0,
      });
    } catch (err) {
      // Use mock response for demo purposes
      console.log("Using mock prediction response for demo");
      setApiResult({
        risk_score: Math.random() * 100,
        confidence: 70 + Math.random() * 25,
      });
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSimulationInput(null);
    setApiResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen command-center-bg">
      <div className="scanline-overlay" />
      <div className="hex-pattern" />
      <DashboardHeader />

      <div className="relative z-10 px-4 lg:px-6 py-6 space-y-6">
        {/* Navigation & Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate("/ngo")}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Back to NGO Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
            NGO Dashboard
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-orange-500" />
            AI Readiness Simulation
          </span>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight flex items-center gap-3 mb-2">
            <Zap className="h-8 w-8 text-orange-500" />
            AI Readiness & Impact Simulation
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Model operational scenarios, assess deployment readiness, and identify resource gaps before they become critical in the field.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulation Form - Left Column */}
          <div className="lg:col-span-1">
            <NgoSimulationForm
              onSubmit={handleSimulate}
              isLoading={isLoading}
              error={error}
              ngoResources={MOCK_NGO_RESOURCES}
            />
          </div>

          {/* Results - Right Column (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card rounded-xl p-12 border border-border/40 flex flex-col items-center justify-center min-h-[500px] gap-4"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  >
                    <Zap className="h-8 w-8 text-orange-500" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Running Operational Analysis</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Calculating resource requirements and feasibility metrics...
                    </p>
                  </div>
                </motion.div>
              ) : apiResult && simulationInput ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  {/* Result Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded-full bg-orange-500 animate-pulse" />
                        Simulation Results
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        {simulationInput.disaster_type.toUpperCase()} • {simulationInput.people_affected?.toLocaleString()} affected • {simulationInput.severity}/5 severity
                      </p>
                    </div>
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                      title="Run another simulation"
                    >
                      <RefreshCw className="h-4 w-4" />
                      New Simulation
                    </button>
                  </div>

                  {/* Result Panel */}
                  <div className="mt-4">
                    <NgoResultPanel simulationInput={simulationInput} apiResult={apiResult} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card rounded-xl p-12 border border-border/40 flex flex-col items-center justify-center min-h-[500px] gap-4 text-center"
                >
                  <div className="rounded-full bg-muted p-4">
                    <Brain className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Ready for Simulation</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter a disaster scenario and your current resources to simulate deployment feasibility
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Information Panels */}
        {!apiResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {[
              {
                title: "Operational Planning",
                description: "Simulate realistic scenarios to understand deployment complexity and identify gaps",
                icon: "📋",
              },
              {
                title: "Resource Analysis",
                description: "Compare available resources against estimated requirements for each scenario",
                icon: "📊",
              },
              {
                title: "Readiness Score",
                description: "Get a quantified measure of your NGO's ability to handle the disaster scenario",
                icon: "🎯",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="glass-card rounded-xl p-5 border border-border/40"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Current Resources Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-6 border border-border/40"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-5 flex items-center gap-2">
            <Zap className="h-4 w-4 text-orange-500" />
            Current Organization Resources
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Volunteers", value: MOCK_NGO_RESOURCES.volunteers, icon: "👥" },
              { label: "Ambulances", value: MOCK_NGO_RESOURCES.ambulances, icon: "🚑" },
              { label: "Medical Kits", value: MOCK_NGO_RESOURCES.medicalKits, icon: "🏥" },
              { label: "Fuel Level", value: `${MOCK_NGO_RESOURCES.fuelPercent}%`, icon: "⛽" },
            ].map((resource, i) => (
              <div key={i} className="rounded-lg border border-border/40 bg-muted/20 p-4 text-center">
                <div className="text-2xl mb-2">{resource.icon}</div>
                <p className="text-xl font-bold font-mono text-foreground">{resource.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{resource.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            These resources are used to calculate deployment feasibility scores in simulations
          </p>
        </motion.div>
      </div>
    </div>
  );
}
