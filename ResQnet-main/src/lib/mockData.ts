export type DisasterType = "Flood" | "Earthquake" | "Fire" | "Cyclone" | "Landslide" | "Other";
export type IncidentStatus = "Pending" | "Assigned" | "In Progress" | "Resolved";
export type SeverityLevel = 1 | 2 | 3 | 4 | 5;

export interface Incident {
  id: string;
  type: DisasterType;
  severity: SeverityLevel;
  peopleAffected: number;
  description: string;
  location: { lat: number; lng: number; name: string };
  reportedBy: string;
  reportedAt: string;
  status: IncidentStatus;
  priorityScore: number;
  survivalWindow: number; // hours
  assignedNgo: string | null;
  hasImage: boolean;
  urgencyKeywords: string[];
  clusterMultiplier: number;
  reliabilityWeight: number;
  estimatedResponseTime: number; // minutes
}

export interface NGO {
  id: string;
  name: string;
  distance: number; // km
  volunteers: number;
  ambulances: number;
  medicalKits: number;
  foodSupplies: number;
  fuelPercent: number;
  performanceScore: number;
  currentWorkload: number;
  resolvedCases: number;
  avgResponseTime: number; // minutes
}

export interface ReliefCamp {
  id: string;
  name: string;
  capacity: number;
  occupied: number;
  medicalSupport: "High" | "Medium" | "Low";
  location: { lat: number; lng: number };
}

export interface ActivityEvent {
  id: string;
  type: "incident" | "cluster" | "assignment" | "status" | "camp" | "resource";
  message: string;
  timestamp: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
}

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: "INC-001", type: "Flood", severity: 5, peopleAffected: 2400,
    description: "Major flooding in riverside district. Multiple buildings collapsed, people trapped on rooftops. Urgent rescue needed, no oxygen supply.",
    location: { lat: 28.6139, lng: 77.209, name: "Yamuna Floodplain, Delhi" },
    reportedBy: "c1", reportedAt: "2026-02-27T08:12:00Z", status: "In Progress",
    priorityScore: 96, survivalWindow: 4.2, assignedNgo: "n1", hasImage: true,
    urgencyKeywords: ["trapped", "urgent", "collapsed", "no oxygen"],
    clusterMultiplier: 1.4, reliabilityWeight: 0.87, estimatedResponseTime: 35,
  },
  {
    id: "INC-002", type: "Earthquake", severity: 4, peopleAffected: 850,
    description: "6.2 magnitude earthquake, several structures damaged. Roads cracked, hospital partially collapsed.",
    location: { lat: 26.9124, lng: 75.7873, name: "Jaipur, Rajasthan" },
    reportedBy: "c2", reportedAt: "2026-02-27T09:45:00Z", status: "Assigned",
    priorityScore: 88, survivalWindow: 8.5, assignedNgo: "n2", hasImage: true,
    urgencyKeywords: ["collapsed"], clusterMultiplier: 1.0, reliabilityWeight: 0.92,
    estimatedResponseTime: 50,
  },
  {
    id: "INC-003", type: "Fire", severity: 3, peopleAffected: 120,
    description: "Factory fire spreading to residential area. Two buildings evacuated, minor injuries reported.",
    location: { lat: 19.076, lng: 72.8777, name: "Andheri, Mumbai" },
    reportedBy: "c3", reportedAt: "2026-02-27T11:20:00Z", status: "Pending",
    priorityScore: 72, survivalWindow: 12, assignedNgo: null, hasImage: false,
    urgencyKeywords: [], clusterMultiplier: 1.0, reliabilityWeight: 0.78,
    estimatedResponseTime: 0,
  },
  {
    id: "INC-004", type: "Cyclone", severity: 5, peopleAffected: 5200,
    description: "Category 4 cyclone making landfall. Massive evacuation underway, urgent shelter needed.",
    location: { lat: 13.0827, lng: 80.2707, name: "Chennai Coast, Tamil Nadu" },
    reportedBy: "c4", reportedAt: "2026-02-27T06:00:00Z", status: "In Progress",
    priorityScore: 98, survivalWindow: 2.8, assignedNgo: "n1", hasImage: true,
    urgencyKeywords: ["urgent"], clusterMultiplier: 1.6, reliabilityWeight: 0.95,
    estimatedResponseTime: 25,
  },
  {
    id: "INC-005", type: "Landslide", severity: 4, peopleAffected: 340,
    description: "Landslide blocking national highway. Village cut off, medical supplies needed urgently.",
    location: { lat: 30.3165, lng: 78.0322, name: "Dehradun, Uttarakhand" },
    reportedBy: "c5", reportedAt: "2026-02-27T10:15:00Z", status: "Assigned",
    priorityScore: 84, survivalWindow: 6, assignedNgo: "n3", hasImage: true,
    urgencyKeywords: ["urgently"], clusterMultiplier: 1.2, reliabilityWeight: 0.81,
    estimatedResponseTime: 90,
  },
  {
    id: "INC-006", type: "Flood", severity: 2, peopleAffected: 75,
    description: "Minor waterlogging in low-lying areas. Some roads inaccessible.",
    location: { lat: 28.58, lng: 77.22, name: "South Delhi" },
    reportedBy: "c6", reportedAt: "2026-02-27T12:00:00Z", status: "Pending",
    priorityScore: 38, survivalWindow: 48, assignedNgo: null, hasImage: false,
    urgencyKeywords: [], clusterMultiplier: 1.4, reliabilityWeight: 0.65,
    estimatedResponseTime: 0,
  },
  {
    id: "INC-007", type: "Fire", severity: 4, peopleAffected: 310,
    description: "Wildfire approaching residential zone. Evacuation in progress, strong winds accelerating spread.",
    location: { lat: 12.9716, lng: 77.5946, name: "Bangalore Outskirts" },
    reportedBy: "c7", reportedAt: "2026-02-27T07:30:00Z", status: "In Progress",
    priorityScore: 82, survivalWindow: 5, assignedNgo: "n2", hasImage: true,
    urgencyKeywords: [], clusterMultiplier: 1.0, reliabilityWeight: 0.9,
    estimatedResponseTime: 45,
  },
];

export const MOCK_NGOS: NGO[] = [
  { id: "n1", name: "Red Cross India", distance: 12, volunteers: 85, ambulances: 8, medicalKits: 120, foodSupplies: 2000, fuelPercent: 72, performanceScore: 94, currentWorkload: 2, resolvedCases: 148, avgResponseTime: 32 },
  { id: "n2", name: "NDRF Unit 7", distance: 28, volunteers: 120, ambulances: 15, medicalKits: 200, foodSupplies: 5000, fuelPercent: 85, performanceScore: 91, currentWorkload: 2, resolvedCases: 203, avgResponseTime: 28 },
  { id: "n3", name: "Mercy Corps", distance: 45, volunteers: 40, ambulances: 3, medicalKits: 60, foodSupplies: 800, fuelPercent: 55, performanceScore: 78, currentWorkload: 1, resolvedCases: 67, avgResponseTime: 52 },
  { id: "n4", name: "Save the Children", distance: 18, volunteers: 55, ambulances: 5, medicalKits: 90, foodSupplies: 1500, fuelPercent: 68, performanceScore: 86, currentWorkload: 0, resolvedCases: 95, avgResponseTime: 38 },
];

export const MOCK_CAMPS: ReliefCamp[] = [
  { id: "camp1", name: "Central Relief Hub", capacity: 500, occupied: 430, medicalSupport: "High", location: { lat: 28.62, lng: 77.21 } },
  { id: "camp2", name: "South District Camp", capacity: 300, occupied: 120, medicalSupport: "Medium", location: { lat: 28.55, lng: 77.25 } },
  { id: "camp3", name: "River Basin Shelter", capacity: 200, occupied: 195, medicalSupport: "Low", location: { lat: 28.64, lng: 77.18 } },
  { id: "camp4", name: "Highway Emergency Point", capacity: 150, occupied: 45, medicalSupport: "Medium", location: { lat: 28.70, lng: 77.15 } },
];

export const MOCK_ACTIVITY: ActivityEvent[] = [
  { id: "a1", type: "incident", message: "New critical incident: Cyclone making landfall at Chennai Coast", timestamp: "2026-02-27T06:00:00Z", severity: "critical" },
  { id: "a2", type: "cluster", message: "Cluster Risk Zone detected: 3 incidents in Delhi NCR region", timestamp: "2026-02-27T08:30:00Z", severity: "high" },
  { id: "a3", type: "assignment", message: "Red Cross India auto-assigned to INC-001 (Flood, Delhi)", timestamp: "2026-02-27T08:15:00Z", severity: "info" },
  { id: "a4", type: "status", message: "INC-004 status updated: In Progress → Evacuation 60% complete", timestamp: "2026-02-27T09:00:00Z", severity: "medium" },
  { id: "a5", type: "camp", message: "⚠ River Basin Shelter at 97.5% capacity — overcrowding alert", timestamp: "2026-02-27T10:00:00Z", severity: "high" },
  { id: "a6", type: "resource", message: "Mercy Corps fuel supply below 60% — resupply recommended", timestamp: "2026-02-27T10:30:00Z", severity: "medium" },
  { id: "a7", type: "assignment", message: "NDRF Unit 7 assigned to INC-002 (Earthquake, Jaipur)", timestamp: "2026-02-27T09:50:00Z", severity: "info" },
  { id: "a8", type: "incident", message: "New incident reported: Factory fire in Andheri, Mumbai", timestamp: "2026-02-27T11:20:00Z", severity: "medium" },
];

export function getSeverityColor(severity: SeverityLevel | number): string {
  if (severity >= 5) return "critical";
  if (severity >= 4) return "high";
  if (severity >= 3) return "medium";
  if (severity >= 2) return "low";
  return "info";
}

export function getStatusColor(status: IncidentStatus): string {
  switch (status) {
    case "Pending": return "medium";
    case "Assigned": return "info";
    case "In Progress": return "high";
    case "Resolved": return "low";
  }
}

export function getPriorityLabel(score: number): string {
  if (score >= 90) return "CRITICAL";
  if (score >= 75) return "HIGH";
  if (score >= 50) return "MEDIUM";
  return "LOW";
}
