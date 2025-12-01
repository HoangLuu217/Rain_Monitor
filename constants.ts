import { SensorData, SensorStatus } from './types';

// Adjusted to sit perfectly in the center of the viewport for the S-shape
// Shifted slightly to [16.0, 108.0] to balance the mainland and the islands (Hoang Sa/Truong Sa)
export const MAP_CENTER: [number, number] = [16.0, 107.5]; 
export const DEFAULT_ZOOM = 6;

// Relaxed bounds significantly to ensure Vietnam can be centered on wide screens without snapping to edges
// [[South, West], [North, East]]
export const VIETNAM_BOUNDS: [[number, number], [number, number]] = [
  [-5.0, 90.0],   // South West (Deep into Indian Ocean to allow scrolling south to Truong Sa/Ca Mau)
  [30.0, 130.0]   // North East (Covers up to China/Philippines border area widely)
];

// Locations are still useful for data, but we won't manually render them on the Google Map to avoid double labels
export const VIETNAM_LOCATIONS = [
  // Major Cities
  { name: "HÀ NỘI", lat: 21.0285, lng: 105.8542, type: 'capital' },
  { name: "TP. HỒ CHÍ MINH", lat: 10.7769, lng: 106.7009, type: 'city' },
  { name: "ĐÀ NẴNG", lat: 16.0544, lng: 108.2022, type: 'city' },
  { name: "HẢI PHÒNG", lat: 20.8449, lng: 106.6881, type: 'city' },
  { name: "CẦN THƠ", lat: 10.0452, lng: 105.7469, type: 'city' },
  
  // Strategic Border/Island Locations
  { name: "HÀ GIANG", lat: 22.8233, lng: 104.9839, type: 'province' },
  { name: "CÀ MAU", lat: 9.1769, lng: 105.1500, type: 'province' },
  { name: "PHÚ QUỐC", lat: 10.2899, lng: 103.9840, type: 'island' },
  { name: "CÔN ĐẢO", lat: 8.6835, lng: 106.6067, type: 'island' }
];

// Mock Data representing devices placed across Vietnam
export const MOCK_SENSORS: SensorData[] = [
  {
    id: '1',
    name: 'Tram Ha Noi - Hoan Kiem',
    location: { lat: 21.0285, lng: 105.8542 },
    rainfall1h: 0,
    rainfall24h: 12.5,
    waterLevel: 4.2,
    batteryLevel: 98,
    lastUpdated: new Date().toISOString(),
    status: SensorStatus.NORMAL,
    region: 'North',
  },
  {
    id: '2',
    name: 'Tram Ha Giang - Song Lo',
    location: { lat: 22.8233, lng: 104.9839 },
    rainfall1h: 45,
    rainfall24h: 120,
    waterLevel: 8.5,
    batteryLevel: 85,
    lastUpdated: new Date().toISOString(),
    status: SensorStatus.WARNING,
    region: 'North',
  },
  {
    id: '3',
    name: 'Tram Da Nang - Song Han',
    location: { lat: 16.0544, lng: 108.2022 },
    rainfall1h: 2.5,
    rainfall24h: 5.0,
    waterLevel: 2.1,
    batteryLevel: 92,
    lastUpdated: new Date().toISOString(),
    status: SensorStatus.NORMAL,
    region: 'Central',
  },
  {
    id: '4',
    name: 'Tram Hue - Huong River',
    location: { lat: 16.4637, lng: 107.5909 },
    rainfall1h: 85,
    rainfall24h: 210,
    waterLevel: 11.2,
    batteryLevel: 76,
    lastUpdated: new Date().toISOString(),
    status: SensorStatus.CRITICAL,
    region: 'Central',
  },
  {
    id: '5',
    name: 'Tram TP.HCM - Nha Be',
    location: { lat: 10.7769, lng: 106.7009 },
    rainfall1h: 15,
    rainfall24h: 45,
    waterLevel: 1.8,
    batteryLevel: 100,
    lastUpdated: new Date().toISOString(),
    status: SensorStatus.NORMAL,
    region: 'South',
  },
  {
    id: '6',
    name: 'Tram Can Tho - Ninh Kieu',
    location: { lat: 10.0452, lng: 105.7469 },
    rainfall1h: 10,
    rainfall24h: 30,
    waterLevel: 2.5,
    batteryLevel: 45,
    lastUpdated: new Date().toISOString(),
    status: SensorStatus.WARNING,
    region: 'South',
  },
  {
    id: '7',
    name: 'Tram Dak Lak - Buon Ma Thuot',
    location: { lat: 12.6667, lng: 108.0500 },
    rainfall1h: 0,
    rainfall24h: 2,
    waterLevel: 3.0,
    batteryLevel: 88,
    lastUpdated: new Date().toISOString(),
    status: SensorStatus.NORMAL,
    region: 'Highlands',
  },
   {
    id: '8',
    name: 'Tram Quang Ninh - Ha Long',
    location: { lat: 20.9599, lng: 107.0425 },
    rainfall1h: 55,
    rainfall24h: 150,
    waterLevel: 6.5,
    batteryLevel: 60,
    lastUpdated: new Date().toISOString(),
    status: SensorStatus.CRITICAL,
    region: 'North',
  }
];