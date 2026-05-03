import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Users, Ambulance, Package, Fuel, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NgoSimulationInput {
  disaster_type: string;
  severity: number;
  people_affected: number;
  latitude: number;
  longitude: number;
  available_volunteers: number;
  available_ambulances: number;
  medical_kits: number;
  fuel_capacity: number;
}

interface NgoSimulationFormProps {
  onSubmit: (data: NgoSimulationInput) => void;
  isLoading: boolean;
  error?: string;
  ngoResources?: {
    volunteers: number;
    ambulances: number;
    medicalKits: number;
    fuelPercent: number;
  };
}

const DISASTER_TYPES = [
  { value: "flood", label: "🌊 Flood" },
  { value: "earthquake", label: "🌍 Earthquake" },
  { value: "tsunami", label: "🌀 Tsunami" },
  { value: "drought", label: "☀️ Drought" },
  { value: "fire", label: "🔥 Fire" },
];

export function NgoSimulationForm({ 
  onSubmit, 
  isLoading, 
  error,
  ngoResources = { volunteers: 50, ambulances: 8, medicalKits: 120, fuelPercent: 75 }
}: NgoSimulationFormProps) {
  const [formData, setFormData] = useState<NgoSimulationInput>({
    disaster_type: "flood",
    severity: 3,
    people_affected: 1000,
    latitude: 28.6139,
    longitude: 77.209,
    available_volunteers: ngoResources.volunteers,
    available_ambulances: ngoResources.ambulances,
    medical_kits: ngoResources.medicalKits,
    fuel_capacity: ngoResources.fuelPercent,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof NgoSimulationInput, value: any) => {
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
          <Zap className="h-5 w-5 text-orange-500" />
          Operational Simulation
        </h2>
        <p className="text-sm text-muted-foreground">
          Model disaster scenarios and assess your deployment readiness
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

      {/* Disaster Parameters Section */}
      <div className="space-y-4 pb-4 border-b border-border/20">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Disaster Parameters</h3>

        {/* Disaster Type */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">Disaster Type</label>
          <select
            value={formData.disaster_type}
            onChange={e => handleChange("disaster_type", e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent disabled:opacity-50 transition-all"
          >
            {DISASTER_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-foreground">Severity Level</label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono text-orange-500">{formData.severity}</span>
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
            className="w-full h-2 rounded-lg bg-muted appearance-none cursor-pointer disabled:opacity-50 accent-orange-500"
            style={{
              background: `linear-gradient(to right, hsl(187, 80%, 42%) 0%, hsl(25, 95%, 53%) ${(formData.severity - 1) * 25}%, hsl(220, 13%, 91%) ${(formData.severity - 1) * 25}%, hsl(220, 13%, 91%) 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Low Impact</span>
            <span>Critical</span>
          </div>
        </div>

        {/* People Affected & Coordinates */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">People Affected</label>
            <input
              type="number"
              value={formData.people_affected}
              onChange={e => handleChange("people_affected", Math.max(0, parseInt(e.target.value) || 0))}
              disabled={isLoading}
              min="0"
              step="100"
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent disabled:opacity-50 transition-all text-sm"
              placeholder="5000"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Latitude</label>
            <input
              type="number"
              value={formData.latitude}
              onChange={e => handleChange("latitude", parseFloat(e.target.value) || 0)}
              disabled={isLoading}
              step="0.0001"
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent disabled:opacity-50 transition-all text-sm"
              placeholder="28.61"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Longitude</label>
            <input
              type="number"
              value={formData.longitude}
              onChange={e => handleChange("longitude", parseFloat(e.target.value) || 0)}
              disabled={isLoading}
              step="0.0001"
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent disabled:opacity-50 transition-all text-sm"
              placeholder="77.21"
            />
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Current Resources</h3>

        {/* Volunteers */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-orange-500" />
            Available Volunteers
          </label>
          <input
            type="number"
            value={formData.available_volunteers}
            onChange={e => handleChange("available_volunteers", Math.max(0, parseInt(e.target.value) || 0))}
            disabled={isLoading}
            min="0"
            step="1"
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent disabled:opacity-50 transition-all"
            placeholder="50"
          />
          <p className="text-xs text-muted-foreground mt-1">Current: {ngoResources.volunteers} available</p>
        </div>

        {/* Ambulances */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2 flex items-center gap-2">
            <Ambulance className="h-4 w-4 text-severity-critical" />
            Available Ambulances
          </label>
          <input
            type="number"
            value={formData.available_ambulances}
            onChange={e => handleChange("available_ambulances", Math.max(0, parseInt(e.target.value) || 0))}
            disabled={isLoading}
            min="0"
            step="1"
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent disabled:opacity-50 transition-all"
            placeholder="8"
          />
          <p className="text-xs text-muted-foreground mt-1">Current: {ngoResources.ambulances} available</p>
        </div>

        {/* Medical Kits */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2 flex items-center gap-2">
            <Package className="h-4 w-4 text-severity-low" />
            Medical Kits
          </label>
          <input
            type="number"
            value={formData.medical_kits}
            onChange={e => handleChange("medical_kits", Math.max(0, parseInt(e.target.value) || 0))}
            disabled={isLoading}
            min="0"
            step="1"
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent disabled:opacity-50 transition-all"
            placeholder="120"
          />
          <p className="text-xs text-muted-foreground mt-1">Current: {ngoResources.medicalKits} available</p>
        </div>

        {/* Fuel */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2 flex items-center gap-2">
            <Fuel className="h-4 w-4 text-severity-high" />
            Fuel Capacity
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={formData.fuel_capacity}
              onChange={e => handleChange("fuel_capacity", Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
              disabled={isLoading}
              min="0"
              max="100"
              step="5"
              className="flex-1 px-4 py-3 rounded-lg bg-muted border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent disabled:opacity-50 transition-all"
              placeholder="75"
            />
            <span className="text-sm font-semibold text-muted-foreground w-8 text-right">%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Current: {ngoResources.fuelPercent}%</p>
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
            : "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
        )}
      >
        <Zap className="h-4 w-4" />
        {isLoading ? "Simulating..." : "Simulate Deployment Impact"}
      </motion.button>
    </motion.form>
  );
}
