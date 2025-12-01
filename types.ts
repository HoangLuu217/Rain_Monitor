export type ViewMode = 'map' | 'list' | 'combined';

export enum SensorStatus {
  NORMAL = 'Normal',
  WARNING = 'Warning',
  CRITICAL = 'Critical',
  OFFLINE = 'Offline'
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface SensorData {
  id: string;
  name: string;
  location: GeoLocation;
  rainfall1h: number; // mm
  rainfall24h: number; // mm
  waterLevel: number; // meters
  batteryLevel: number; // percentage
  lastUpdated: string;
  status: SensorStatus;
  region: string;
}

export interface AnalysisResult {
  summary: string;
  riskLevel: string;
  recommendations: string[];
}