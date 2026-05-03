import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type Incident, getSeverityColor } from "@/lib/mockData";

interface IncidentMapProps {
  incidents: Incident[];
  onSelectIncident?: (incident: Incident) => void;
  className?: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
  info: "#0ea5e9",
};

const CLUSTER_ZONES = [
  {
    center: [28.6, 77.215] as [number, number],
    radius: 15000,
    label: "Delhi NCR Cluster Zone",
    incidents: 3,
  },
];

export function IncidentMap({ incidents, onSelectIncident, className }: IncidentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([22.5, 78.5], 5);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Dark-themed tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Add cluster zones
    CLUSTER_ZONES.forEach((zone) => {
      const circle = L.circle(zone.center, {
        radius: zone.radius,
        color: "#f97316",
        fillColor: "#f97316",
        fillOpacity: 0.08,
        weight: 2,
        dashArray: "8 4",
      }).addTo(map);

      circle.bindPopup(
        `<div style="font-family: 'Space Grotesk', sans-serif; padding: 4px;">
          <p style="font-weight: 700; font-size: 13px; margin: 0 0 4px;">⚠ ${zone.label}</p>
          <p style="font-size: 11px; color: #888; margin: 0;">${zone.incidents} incidents detected — Risk multiplier active</p>
        </div>`
      );

      // Pulsing ring effect
      L.circle(zone.center, {
        radius: zone.radius * 1.15,
        color: "#f97316",
        fillOpacity: 0,
        weight: 1,
        opacity: 0.3,
        dashArray: "4 8",
      }).addTo(map);
    });

    // Add incident markers
    incidents.forEach((inc) => {
      const sevColor = SEVERITY_COLORS[getSeverityColor(inc.severity)] || "#0ea5e9";
      const isCritical = inc.severity >= 5;
      const size = isCritical ? 18 : 12;

      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="position: relative; width: ${size * 2}px; height: ${size * 2}px; display: flex; align-items: center; justify-content: center;">
            ${isCritical ? `<div style="position: absolute; inset: -4px; border-radius: 50%; border: 2px solid ${sevColor}; opacity: 0.4; animation: pulse-marker 2s infinite;"></div>` : ""}
            <div style="
              width: ${size}px; height: ${size}px;
              background: ${sevColor};
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 0 12px ${sevColor}88, 0 2px 8px rgba(0,0,0,0.3);
              ${isCritical ? "animation: pulse-glow 2s ease-in-out infinite;" : ""}
            "></div>
          </div>
        `,
        iconSize: [size * 2, size * 2],
        iconAnchor: [size, size],
      });

      const marker = L.marker([inc.location.lat, inc.location.lng], { icon }).addTo(map);

      marker.bindPopup(
        `<div style="font-family: 'Space Grotesk', sans-serif; min-width: 200px; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 12px;">${inc.id}</span>
            <span style="background: ${sevColor}22; color: ${sevColor}; border: 1px solid ${sevColor}44; border-radius: 6px; padding: 1px 8px; font-size: 10px; font-weight: 600;">${inc.type}</span>
          </div>
          <p style="font-size: 12px; color: #333; margin: 0 0 6px; line-height: 1.4;">${inc.description.slice(0, 100)}...</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px;">
            <div style="background: #f5f5f5; padding: 4px 6px; border-radius: 4px;">
              <span style="color: #888;">Priority</span><br/>
              <span style="font-weight: 700; font-family: monospace;">${inc.priorityScore}</span>
            </div>
            <div style="background: #f5f5f5; padding: 4px 6px; border-radius: 4px;">
              <span style="color: #888;">Survival</span><br/>
              <span style="font-weight: 700; font-family: monospace; ${inc.survivalWindow <= 4 ? "color: #ef4444;" : ""}">${inc.survivalWindow}h</span>
            </div>
            <div style="background: #f5f5f5; padding: 4px 6px; border-radius: 4px;">
              <span style="color: #888;">Affected</span><br/>
              <span style="font-weight: 700; font-family: monospace;">${inc.peopleAffected.toLocaleString()}</span>
            </div>
            <div style="background: #f5f5f5; padding: 4px 6px; border-radius: 4px;">
              <span style="color: #888;">Status</span><br/>
              <span style="font-weight: 600;">${inc.status}</span>
            </div>
          </div>
          ${inc.urgencyKeywords.length > 0 ? `<div style="margin-top: 6px; display: flex; gap: 4px; flex-wrap: wrap;">${inc.urgencyKeywords.map(k => `<span style="background: #ef444422; color: #ef4444; border: 1px solid #ef444444; border-radius: 10px; padding: 1px 6px; font-size: 9px; font-weight: 600;">${k}</span>`).join("")}</div>` : ""}
        </div>`,
        { maxWidth: 280 }
      );

      marker.on("click", () => onSelectIncident?.(inc));
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [incidents, onSelectIncident]);

  return (
    <div className={className}>
      <style>{`
        @keyframes pulse-marker {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 8px currentColor, 0 2px 8px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 2px 8px rgba(0,0,0,0.3); }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important;
          border: 1px solid rgba(0,0,0,0.08) !important;
        }
        .leaflet-popup-tip {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
      `}</style>
      <div ref={mapRef} className="h-full w-full rounded-xl overflow-hidden" />
    </div>
  );
}
