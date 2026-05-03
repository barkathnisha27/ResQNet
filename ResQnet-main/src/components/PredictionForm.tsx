import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, TrendingUp, Users, MapPin, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PredictionInput {
  disaster_type: string;
  severity: number;
  people_affected: number;
  latitude: number;
  longitude: number;
}

interface PredictionFormProps {
  onSubmit: (data: PredictionInput) => void;
  isLoading: boolean;
  error?: string;
}

const DISASTER_TYPES = [
  { value: "flood", label: "🌊 Flood" },
  { value: "earthquake", label: "🌍 Earthquake" },
  { value: "tsunami", label: "🌀 Tsunami" },
  { value: "drought", label: "☀️ Drought" },
  { value: "fire", label: "🔥 Fire" },
];

export function PredictionForm({ onSubmit, isLoading, error }: PredictionFormProps) {
  const [formData, setFormData] = useState<PredictionInput>({
    disaster_type: "flood",
    severity: 3,
    people_affected: 1000,
    latitude: 28.6139,
    longitude: 77.209,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof PredictionInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-7 space-y-6 border border-border/40"
    >
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent" />
          AI Prediction Engine
        </h2>
        <p className="text-sm text-muted-foreground">
          Input disaster parameters for real-time AI risk assessment
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-start gap-3 rounded-lg bg-severity-critical/5 border border-severity-critical/20 p-4"
        >
          <AlertCircle className="h-5 w-5 text-severity-critical flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-severity-critical">Error</p>
            <p className="text-xs text-severity-critical/80 mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Disaster Type - Dropdown */}
      <div>
        <label className="text-sm font-semibold text-foreground block mb-2">
          Disaster Type
        </label>
        <select
          value={formData.disaster_type}
          onChange={e => handleChange("disaster_type", e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-lg bg-muted border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent disabled:opacity-50 transition-all"
        >
          {DISASTER_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Severity - Slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-foreground">Severity Level</label>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-accent">{formData.severity}</span>
            <span className="text-xs text-muted-foreground">/5</span>
          </div>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          value={formData.severity}
          onChange={e => handleChange("severity", parseInt(e.target.value))}
          disabled={isLoading}
          className="w-full h-2 rounded-lg bg-muted appearance-none cursor-pointer disabled:opacity-50 accent-accent"
          style={{
            background: `linear-gradient(to right, hsl(187, 80%, 42%) 0%, hsl(25, 95%, 53%) ${(formData.severity - 1) * 25}%, hsl(220, 13%, 91%) ${(formData.severity - 1) * 25}%, hsl(220, 13%, 91%) 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Low</span>
          <span>Critical</span>
        </div>
      </div>

      {/* People Affected - Number Input */}
      <div>
        <label className="text-sm font-semibold text-foreground block mb-2 flex items-center gap-2">
          <Users className="h-4 w-4 text-accent" />
          People Affected
        </label>
        <input
          type="number"
          value={formData.people_affected}
          onChange={e => handleChange("people_affected", Math.max(0, parseInt(e.target.value) || 0))}
          disabled={isLoading}
          min="0"
          step="100"
          className="w-full px-4 py-3 rounded-lg bg-muted border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent disabled:opacity-50 transition-all"
          placeholder="e.g., 5000"
        />
      </div>

      {/* Coordinates - Latitude & Longitude */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" />
            Latitude
          </label>
          <input
            type="number"
            value={formData.latitude}
            onChange={e => handleChange("latitude", parseFloat(e.target.value) || 0)}
            disabled={isLoading}
            step="0.0001"
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent disabled:opacity-50 transition-all"
            placeholder="28.6139"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" />
            Longitude
          </label>
          <input
            type="number"
            value={formData.longitude}
            onChange={e => handleChange("longitude", parseFloat(e.target.value) || 0)}
            disabled={isLoading}
            step="0.0001"
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent disabled:opacity-50 transition-all"
            placeholder="77.209"
          />
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all",
          isLoading
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-accent hover:bg-accent/90 text-accent-foreground cursor-pointer"
        )}
      >
        <TrendingUp className="h-4 w-4" />
        {isLoading ? "Processing AI Model..." : "Run AI Prediction"}
      </motion.button>
    </motion.form>
  );
}
