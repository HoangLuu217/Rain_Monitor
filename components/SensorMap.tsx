
import React, { useEffect, useRef, useState } from 'react';
import { SensorData, SensorStatus } from '../types';
import { MAP_CENTER, DEFAULT_ZOOM } from '../constants';

// Declare Windy and Leaflet global types
declare global {
  interface Window {
    windyInit: (options: any, callback: (windyAPI: any) => void) => void;
    L: any; // Use Windy's internal Leaflet instance
  }
}

interface SensorMapProps {
  sensors: SensorData[];
  selectedSensorId: string | null;
  onSelectSensor: (sensor: SensorData) => void;
}

const WINDY_API_KEY = 'AtUaQjhDQRnQBBXcDRanf6o5hw7hMh05';

const SensorMap: React.FC<SensorMapProps> = ({ sensors, selectedSensorId, onSelectSensor }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // Leaflet Map instance
  const markersLayerRef = useRef<any>(null); // LayerGroup
  const [isMapReady, setIsMapReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Helper to create icons using the correct Global L instance
  const createCustomIcon = (id: string, status: SensorStatus) => {
    if (!window.L) return null;

    let borderColor = '#4b5563'; // gray-600
    if (status === SensorStatus.CRITICAL) borderColor = '#ef4444';
    else if (status === SensorStatus.WARNING) borderColor = '#eab308';
    else if (status === SensorStatus.NORMAL) borderColor = '#10b981';

    return window.L.divIcon({
      className: 'custom-pin',
      html: `
        <div style="
          background-color: #333;
          color: white;
          width: 30px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 2px 2px 4px rgba(0,0,0,0.4);
          position: relative;
        ">
          <div style="
            transform: rotate(45deg);
            font-weight: bold;
            font-family: sans-serif;
            font-size: 14px;
          ">${id}</div>
          <div style="
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: ${borderColor};
            border: 1px solid white;
          "></div>
        </div>
      `,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -40]
    });
  };

  const createSovereigntyIcon = (text: string, subText: string | undefined, size: 'small' | 'normal' | 'large') => {
    if (!window.L) return null;
    
    const color = '#ce1126'; // Red color
    const casing = '#ffffff'; // White outline
    const weight = '900';
    
    let fontSize = '12px';
    if (size === 'normal') fontSize = '16px';
    if (size === 'large') fontSize = '22px';
    if (size === 'small') fontSize = '11px';

    const labelStyle = `
      color: ${color};
      text-shadow: 
        2px 0 ${casing}, -2px 0 ${casing}, 0 2px ${casing}, 0 -2px ${casing},
        1px 1px ${casing}, -1px -1px ${casing}, 1px -1px ${casing}, -1px 1px ${casing};
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-weight: ${weight};
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
      text-align: center;
      line-height: 1.2;
      pointer-events: none;
    `;

    const subLabelStyle = `
      color: ${color};
      text-shadow: 1px 0 ${casing}, -1px 0 ${casing}, 0 1px ${casing}, 0 -1px ${casing};
      font-family: 'Arial', sans-serif;
      font-weight: 700;
      text-transform: uppercase;
      margin-top: 1px;
      opacity: 0.9;
      font-size: 10px;
    `;

    return window.L.divIcon({
      className: 'bg-transparent border-none',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="${labelStyle} font-size: ${fontSize};">
            ${text}
          </div>
          ${subText ? `<div style="${subLabelStyle}">(${subText})</div>` : ''}
        </div>
      `,
      iconSize: [200, 50],
      iconAnchor: [100, 25]
    });
  };

  // Initialize Map
  useEffect(() => {
    // If map already initialized, skip
    if (mapInstanceRef.current) return;

    const scriptId = 'windy-boot-script';
    
    const initializeWindy = () => {
       const options = {
        key: WINDY_API_KEY,
        lat: MAP_CENTER[0],
        lon: MAP_CENTER[1],
        zoom: DEFAULT_ZOOM,
        verbose: false,
      };

      try {
        if (!window.windyInit) {
             setLoadError("Windy API loaded but initialization function not found.");
             return;
        }

        window.windyInit(options, (windyAPI) => {
          const { map } = windyAPI;
          mapInstanceRef.current = map;

          // Ensure we use the L instance from window (which Windy populates)
          if (window.L) {
            // Initialize Layer Group
            markersLayerRef.current = window.L.layerGroup().addTo(map);
            
            // Add Sovereignty Labels
            addSovereigntyLabels(map);
            
            setIsMapReady(true);
          } else {
            console.error("Windy Leaflet instance (window.L) not found.");
            setLoadError("Windy Leaflet instance not found.");
          }
        });
      } catch (e) {
        console.error("Error executing windyInit:", e);
        setLoadError("Error executing Windy initialization.");
      }
    };

    const waitForWindy = (attempts: number) => {
      if (window.windyInit) {
        initializeWindy();
        return;
      }
      
      if (attempts <= 0) {
        setLoadError("Timeout: Windy API failed to load from server.");
        return;
      }

      setTimeout(() => waitForWindy(attempts - 1), 200);
    };

    if (document.getElementById(scriptId)) {
      waitForWindy(50); // Try for 10 seconds
    } else {
      const script = document.createElement('script');
      script.id = scriptId;
      // Use the stable API URL
      script.src = 'https://api.windy.com/assets/map-forecast/libBoot.js';
      script.async = true;
      script.onload = () => waitForWindy(50);
      script.onerror = () => {
          console.error("Failed to load Windy script");
          setLoadError("Failed to connect to Windy servers.");
      };
      document.body.appendChild(script);
    }

    return () => {
      // Cleanup logic if needed
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !markersLayerRef.current || !window.L) return;

    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();

    sensors.forEach(sensor => {
      const icon = createCustomIcon(sensor.id, sensor.status);
      if (!icon) return;

      const marker = window.L.marker([sensor.location.lat, sensor.location.lng], { icon });

      const statusColor = sensor.status === SensorStatus.CRITICAL ? 'bg-red-500' : 
                          sensor.status === SensorStatus.WARNING ? 'bg-yellow-500' : 'bg-emerald-500';
      
      const popupContent = `
        <div class="min-w-[200px] font-sans">
          <h3 class="font-bold text-lg mb-2 text-slate-800">${sensor.name}</h3>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="flex items-center gap-1 text-slate-600">
              <span>Rain 1h: <span class="font-semibold text-slate-900">${sensor.rainfall1h}mm</span></span>
            </div>
             <div class="flex items-center gap-1 text-slate-600">
              <span>Rain 24h: <span class="font-semibold text-slate-900">${sensor.rainfall24h}mm</span></span>
            </div>
            <div class="flex items-center gap-1 text-slate-600">
              <span>Level: <span class="font-semibold text-slate-900">${sensor.waterLevel}m</span></span>
            </div>
             <div class="flex items-center gap-1 text-slate-600">
              <span>Bat: <span class="font-semibold text-slate-900">${sensor.batteryLevel}%</span></span>
            </div>
          </div>
          <div class="mt-3 text-xs px-2 py-1 rounded text-center font-bold text-white ${statusColor}">
            ${sensor.status.toUpperCase()}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => onSelectSensor(sensor));
      
      if (selectedSensorId === sensor.id) {
        setTimeout(() => marker.openPopup(), 100);
      }

      layerGroup.addLayer(marker);
    });

  }, [isMapReady, sensors, selectedSensorId, onSelectSensor]);

  const addSovereigntyLabels = (map: any) => {
    if (!window.L) return;

    const hsIcon = createSovereigntyIcon("Quần Đảo Hoàng Sa", "Việt Nam", 'normal');
    const tsIcon = createSovereigntyIcon("Quần Đảo Trường Sa", "Việt Nam", 'normal');
    const bdIcon = createSovereigntyIcon("Biển Đông", undefined, 'large');

    if (hsIcon) window.L.marker([16.3, 112.0], { icon: hsIcon, interactive: false, zIndexOffset: 1000 }).addTo(map);
    if (tsIcon) window.L.marker([10.0, 114.5], { icon: tsIcon, interactive: false, zIndexOffset: 1000 }).addTo(map);
    if (bdIcon) window.L.marker([14.0, 113.0], { icon: bdIcon, interactive: false, zIndexOffset: 900 }).addTo(map);
  };

  const handleGoHome = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(MAP_CENTER, DEFAULT_ZOOM);
    }
  };

  return (
    <div className="h-full w-full bg-slate-100 relative z-0">
      {/* Explicitly set ID for Windy */}
      <div id="windy" ref={mapContainerRef} className="h-full w-full absolute inset-0 z-0" />
      
      {/* Loading State */}
      {!isMapReady && !loadError && (
        <div className="absolute inset-0 bg-slate-100 z-[500] flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-600 font-medium">Đang tải bản đồ Windy...</p>
        </div>
      )}

      {/* Error State */}
      {loadError && (
         <div className="absolute inset-0 bg-red-50 z-[500] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
              <div className="text-red-500 font-bold text-xl mb-2">Lỗi tải bản đồ</div>
              <p className="text-slate-700 mb-4">{loadError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Tải lại trang
              </button>
            </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
        <button 
          onClick={handleGoHome}
          className="bg-white w-8 h-8 flex items-center justify-center rounded shadow-md border border-slate-300 hover:bg-slate-50 cursor-pointer text-slate-700"
          title="Về toàn cảnh Việt Nam"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </button>
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-6 right-14 bg-white/95 backdrop-blur-sm p-3 rounded shadow-md z-[400] text-xs space-y-2 border border-slate-300">
        <div className="font-bold text-slate-700 mb-1 uppercase">Trạng thái</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-700"></div> Bình thường</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-400 border-yellow-600"></div> Cảnh báo</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 border-red-700"></div> Nguy hiểm</div>
      </div>
    </div>
  );
};

export default SensorMap;
