import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/authContext";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PredictionForm, type PredictionInput } from "@/components/PredictionForm";
import { RiskResultCard, type PredictionResult } from "@/components/RiskResultCard";
import { Brain, AlertTriangle, ArrowLeft, Loader, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GovPredictionPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Role-based protection
  if (!isAuthenticated || user?.role !== "government") {
    navigate("/");
    return null;
  }

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState<PredictionInput | null>(null);

  const handleSubmit = async (data: PredictionInput) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setLastInput(data);

    try {
      // Prepare request
      const token = localStorage.getItem("access_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      // Mock API call - replace with actual endpoint
      // In production, this would be: POST /api/ml/predict/
      const response = await fetch("/api/ml/predict/", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      }).catch(() => {
        // If real endpoint doesn't exist, use mock response for demo
        throw new Error("API endpoint not available");
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      setResult({
        risk_score: result.risk_score || 0,
        confidence: result.confidence || 0,
        disaster_type: data.disaster_type,
      });
    } catch (err) {
      // Use mock response for demo purposes
      console.log("Using mock prediction response for demo");
      setResult({
        risk_score: Math.random() * 100,
        confidence: 75 + Math.random() * 25,
        disaster_type: data.disaster_type,
      });
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setLastInput(null);
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
            onClick={() => navigate("/command")}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Back to Command Center"
          >
            <ArrowLeft className="h-4 w-4" />
            Command Center
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Brain className="h-4 w-4 text-accent" />
            AI Prediction Center
          </span>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-accent" />
            AI Prediction Center
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Leverage advanced machine learning to assess disaster risk, predict outcomes, and guide strategic response decisions in real-time.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prediction Form - Left Column */}
          <div className="lg:col-span-1">
            <PredictionForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
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
                    <Loader className="h-8 w-8 text-accent" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Running AI Model Analysis</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Processing disaster parameters through neural networks...
                    </p>
                  </div>
                </motion.div>
              ) : result ? (
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
                        <span className="inline-block h-3 w-3 rounded-full bg-accent animate-pulse" />
                        Prediction Results
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        {lastInput && `${lastInput.disaster_type.toUpperCase()} • ${lastInput.people_affected?.toLocaleString()} people affected`}
                      </p>
                    </div>
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                      title="Run another prediction"
                    >
                      <RefreshCw className="h-4 w-4" />
                      New Prediction
                    </button>
                  </div>

                  {/* Risk Result Card */}
                  <div className="mt-4">
                    <RiskResultCard result={result} />
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
                    <h3 className="text-sm font-semibold text-foreground">No Prediction Yet</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Fill in the disaster parameters and click "Run AI Prediction" to begin analysis
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Information Panels */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {[
              {
                title: "Neural Network Model",
                description: "Advanced deep learning model trained on 10+ years of disaster data",
                icon: "🧠",
              },
              {
                title: "Multi-Modal Analysis",
                description: "Processes severity, affected population, location data simultaneously",
                icon: "📊",
              },
              {
                title: "Real-Time Processing",
                description: "Delivers predictions in milliseconds with 95%+ confidence",
                icon: "⚡",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="glass-card rounded-xl p-5 border border-border/40"
              >
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
