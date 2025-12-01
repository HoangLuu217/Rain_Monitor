import React, { useEffect, useRef, useState } from 'react';
import { SensorData, SensorStatus } from '../types';
import { MAP_CENTER, DEFAULT_ZOOM } from '../constants';

// Use global L from Leaflet CDN
declare global {
  interface Window {
    L: any;
  }
}

interface SensorMapProps {
  sensors: SensorData[];
  selectedSensorId: string | null;
  onSelectSensor: (sensor: SensorData) => void;
}

const SensorMap: React.FC<SensorMapProps> = ({ sensors, selectedSensorId, onSelectSensor }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    const L = window.L;

    // 1. Create Map
    const map = L.map(mapContainerRef.current, {
      center: MAP_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false, // We'll add it manually to custom position if needed
      maxBounds: [
        [-5.0, 95.0],   // Southwest
        [30.0, 125.0]   // Northeast
      ],
      maxBoundsViscosity: 1.0
    });

    // 2. Add Google Maps Roadmap Layer
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi', {
      attribution: '&copy; Google Maps',
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    // 3. Add Controls
    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    L.control.scale({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;
    setIsMapLoaded(true);

    // 4. Add RainViewer Radar Layer
    addRainLayer(map, L);

    // 5. Add Sovereignty Labels
    addSovereigntyLabels(map, L);

    // Cleanup
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Fetch and Add RainViewer
  const addRainLayer = async (map: any, L: any) => {
    try {
      const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      if (!response.ok) return;
      
      const data = await response.json();
      // Get the last available past frame
      const latestFrame = data.radar?.past?.[data.radar.past.length - 1];
      
      if (latestFrame) {
        L.tileLayer(`${data.host}${latestFrame.path}/256/{z}/{x}/{y}/2/1_1.png`, {
          opacity: 0.6,
          zIndex: 10, // Ensure it sits above base map but below markers
          attribution: '&copy; RainViewer'
        }).addTo(map);
      }
    } catch (e) {
      console.warn("Could not load RainViewer layer:", e);
    }
  };

  // Add Custom Sovereignty Labels
  const addSovereigntyLabels = (map: any, L: any) => {
    const labels = [
      { text: "QUẦN ĐẢO HOÀNG SA", sub: "(VIỆT NAM)", lat: 16.5, lng: 111.6, size: '20px' },
      { text: "QUẦN ĐẢO TRƯỜNG SA", sub: "(VIỆT NAM)", lat: 10.5, lng: 115.0, size: '20px' },
      { text: "BIỂN ĐÔNG", sub: "", lat: 14.5, lng: 113.0, size: '32px' }
    ];

    labels.forEach(label => {
      const html = `
        <div class="sovereignty-text" style="font-size: ${label.size};">
          ${label.text}
          ${label.sub ? `<div style="font-size: 0.6em; margin-top: 2px;">${label.sub}</div>` : ''}
        </div>
      `;
      
      const icon = L.divIcon({
        html: html,
        className: 'sovereignty-label',
        iconSize: [400, 50],
        iconAnchor: [200, 25] // Center anchor
      });

      L.marker([label.lat, label.lng], { 
        icon: icon, 
        interactive: false,
        zIndexOffset: -100 // Keep below interactive markers
      }).addTo(map);
    });
  };

  // Update Sensor Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const map = mapInstanceRef.current;
    const L = window.L;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker: any) => map.removeLayer(marker));
    markersRef.current = {};

    sensors.forEach(sensor => {
      let colorClass = '#10b981'; // green
      if (sensor.status === SensorStatus.WARNING) colorClass = '#eab308'; // yellow
      if (sensor.status === SensorStatus.CRITICAL) colorClass = '#ef4444'; // red

      const iconHtml = `
        <div style="
          background-color: #1f2937;
          color: white;
          width: 30px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 3px 3px 6px rgba(0,0,0,0.4);
          position: relative;
          margin-top: -30px; /* Offset to align tip */
          margin-left: -15px;
        ">
          <div style="transform: rotate(45deg); font-weight: bold; font-family: sans-serif; font-size: 13px;">${sensor.id}</div>
          <div style="
            position: absolute; bottom: -2px; right: -2px; width: 10px; height: 10px;
            border-radius: 50%; background-color: ${colorClass}; border: 1px solid white;
          "></div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-pin',
        html: iconHtml,
        iconSize: [30, 40],
        iconAnchor: [15, 40], // Tip of the pin
        popupAnchor: [0, -45]
      });

      const marker = L.marker([sensor.location.lat, sensor.location.lng], { icon: icon }).addTo(map);

      // Popup Content
      const statusColor = sensor.status === SensorStatus.CRITICAL ? 'text-red-600' : 
                          sensor.status === SensorStatus.WARNING ? 'text-yellow-600' : 'text-emerald-600';

      const popupContent = `
        <div class="min-w-[200px] font-sans text-slate-800 p-4 bg-white">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-bold text-lg leading-tight m-0">${sensor.name}</h3>
          </div>
          <div class="text-xs font-bold ${statusColor} mb-2 uppercase border px-1 rounded inline-block">
            ${sensor.status}
          </div>
          <div class="text-sm space-y-1.5 border-t border-slate-100 pt-2">
            <div class="flex justify-between"><span>Rain 1h:</span> <b class="text-blue-600">${sensor.rainfall1h}mm</b></div>
            <div class="flex justify-between"><span>Rain 24h:</span> <b>${sensor.rainfall24h}mm</b></div>
            <div class="flex justify-between"><span>Level:</span> <b>${sensor.waterLevel}m</b></div>
            <div class="flex justify-between"><span>Battery:</span> <b>${sensor.batteryLevel}%</b></div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onSelectSensor(sensor);
      });

      markersRef.current[sensor.id] = marker;
    });

  }, [sensors, onSelectSensor]);

  // Handle External Selection FlyTo
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedSensorId || !markersRef.current[selectedSensorId]) return;
    const marker = markersRef.current[selectedSensorId];
    const map = mapInstanceRef.current;
    
    map.flyTo(marker.getLatLng(), 10, { duration: 1.5 });
    marker.openPopup();
  }, [selectedSensorId]);

  const handleGoHome = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(MAP_CENTER, DEFAULT_ZOOM);
    }
  };

  return (
    <div className="h-full w-full bg-slate-200 relative group">
      <div ref={mapContainerRef} className="h-full w-full z-0" />
      
      <div className="absolute top-4 left-4 z-[500]">
        <button 
          onClick={handleGoHome}
          className="bg-white w-8 h-8 flex items-center justify-center rounded shadow-md border border-slate-300 hover:bg-slate-50 text-slate-700 transition"
          title="Zoom to Vietnam"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </button>
      </div>

      <div className="absolute bottom-6 left-4 bg-white/90 backdrop-blur p-2 rounded shadow border border-slate-300 z-[500] text-[10px]">
        <div className="font-bold mb-1">Mật độ mưa (Rain Radar)</div>
        <div className="flex items-center gap-1">
          <div className="w-24 h-2 bg-gradient-to-r from-transparent via-blue-400 to-purple-600 rounded-full"></div>
        </div>
        <div className="flex justify-between text-slate-500 mt-1">
          <span>Nhẹ</span>
          <span>Vừa</span>
          <span>To</span>
        </div>
      </div>
    </div>
  );
};

export default SensorMap;