import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SensorData, SensorStatus } from '../types';
import { MAP_CENTER, DEFAULT_ZOOM, VIETNAM_BOUNDS } from '../constants';
import { Activity, Battery, CloudRain } from 'lucide-react';

// Fix for Leaflet default icon issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Public Mapbox Token for Demo purposes. 
// For production, replace with your own from mapbox.com
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_mu_obSp_biFJ84eQxyg';

interface SensorMapProps {
  sensors: SensorData[];
  selectedSensorId: string | null;
  onSelectSensor: (sensor: SensorData) => void;
}

// Custom Marker to look like the dark pins in the screenshot
const createCustomIcon = (id: string, status: SensorStatus) => {
  let borderColor = '#4b5563'; // gray-600
  if (status === SensorStatus.CRITICAL) borderColor = '#ef4444';
  else if (status === SensorStatus.WARNING) borderColor = '#eab308';
  else if (status === SensorStatus.NORMAL) borderColor = '#10b981';

  return L.divIcon({
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
    iconAnchor: [15, 42], // Tip of the pin
    popupAnchor: [0, -40]
  });
};

const SovereigntyLabel = ({ 
  position, 
  text, 
  subText, 
  size = 'normal', 
  type = 'sovereign' 
}: { 
  position: [number, number], 
  text: string, 
  subText?: string, 
  size?: 'small' | 'normal' | 'large',
  type?: 'sovereign' | 'city'
}) => {
  
  const isSovereign = type === 'sovereign';
  const color = isSovereign ? '#ce1126' : '#334155';
  const weight = isSovereign ? '900' : '600';
  const casing = '#ffffff';

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
    pointer-events: none;
    line-height: 1.2;
  `;

  const subLabelStyle = `
    color: ${color};
    text-shadow: 1px 0 ${casing}, -1px 0 ${casing}, 0 1px ${casing}, 0 -1px ${casing};
    font-family: 'Arial', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    margin-top: 1px;
    opacity: 0.9;
  `;

  let fontSize = '12px';
  if (size === 'normal') fontSize = '16px';
  if (size === 'large') fontSize = '22px';
  if (size === 'small') fontSize = '11px';

  const icon = L.divIcon({
    className: 'bg-transparent border-none',
    html: `
      <div class="flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300">
        <div style="${labelStyle} font-size: ${fontSize};">
          ${text}
        </div>
        ${subText ? `
          <div style="${subLabelStyle} font-size: 10px;">
             (${subText})
          </div>
        ` : ''}
      </div>
    `,
    iconSize: [200, 50], 
    iconAnchor: [100, 25] 
  });
  
  const zIndex = isSovereign ? 1000 : 400;

  return <Marker position={position} icon={icon} interactive={false} zIndexOffset={zIndex} />;
};

const MapController: React.FC<{ selectedSensor: SensorData | undefined }> = ({ selectedSensor }) => {
  const map = useMap();
  
  // Force map invalidation on mount to ensure correct rendering size
  useEffect(() => {
    map.invalidateSize();
    // Reset view to center slightly after mount to ensure bounds are respected correctly
    const timer = setTimeout(() => {
       if (!selectedSensor) {
         map.setView(MAP_CENTER, DEFAULT_ZOOM);
       }
    }, 100);
    return () => clearTimeout(timer);
  }, [map, selectedSensor]);

  useEffect(() => {
    if (selectedSensor) {
      map.flyTo([selectedSensor.location.lat, selectedSensor.location.lng], 10);
    }
  }, [selectedSensor, map]);

  // Home Button Control
  useEffect(() => {
    const HomeControl = L.Control.extend({
      onAdd: () => {
        const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
        btn.innerHTML = '🏠';
        btn.style.backgroundColor = 'white';
        btn.style.width = '30px';
        btn.style.height = '30px';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '18px';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.title = "Về toàn cảnh Việt Nam";
        
        btn.onclick = (e) => {
          L.DomEvent.stopPropagation(e);
          map.flyTo(MAP_CENTER, DEFAULT_ZOOM);
        };
        return btn;
      }
    });

    const homeControl = new HomeControl({ position: 'topleft' });
    map.addControl(homeControl);

    return () => {
      map.removeControl(homeControl);
    };
  }, [map]);

  return null;
};

const SensorMap: React.FC<SensorMapProps> = ({ sensors, selectedSensorId, onSelectSensor }) => {
  const selectedSensor = sensors.find(s => s.id === selectedSensorId);

  return (
    <div className="h-full w-full bg-white relative z-0">
      <MapContainer 
        center={MAP_CENTER} 
        zoom={DEFAULT_ZOOM} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        minZoom={5}
        maxZoom={18}
        maxBounds={VIETNAM_BOUNDS}
        maxBoundsViscosity={0.6}
        zoomControl={true}
      >
        {/* Mapbox Streets v12 Layer */}
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`}
          attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
        />
        
        {/* Sovereignty Labels - Overlay on top of Mapbox */}
        <SovereigntyLabel 
          position={[16.3, 112.0]} 
          text="Quần Đảo Hoàng Sa" 
          subText="Việt Nam"
        />
        <SovereigntyLabel 
          position={[10.0, 114.5]} 
          text="Quần Đảo Trường Sa" 
          subText="Việt Nam"
        />
        <SovereigntyLabel 
          position={[14.0, 113.0]} 
          text="Biển Đông" 
          size="large"
        />

        <MapController selectedSensor={selectedSensor} />

        {/* Sensor Markers - Dark Pins style */}
        {sensors.map((sensor) => (
          <Marker 
            key={sensor.id} 
            position={[sensor.location.lat, sensor.location.lng]}
            icon={createCustomIcon(sensor.id, sensor.status)}
            eventHandlers={{
              click: () => onSelectSensor(sensor),
            }}
          >
            <Popup className="min-w-[250px]">
              <div className="p-1">
                <h3 className="font-bold text-lg mb-2 text-slate-800">{sensor.name}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-slate-600">
                    <CloudRain size={14} />
                    <span>1h: <span className="font-semibold text-slate-900">{sensor.rainfall1h}mm</span></span>
                  </div>
                   <div className="flex items-center gap-1 text-slate-600">
                    <CloudRain size={14} />
                    <span>24h: <span className="font-semibold text-slate-900">{sensor.rainfall24h}mm</span></span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Activity size={14} />
                    <span>Level: <span className="font-semibold text-slate-900">{sensor.waterLevel}m</span></span>
                  </div>
                   <div className="flex items-center gap-1 text-slate-600">
                    <Battery size={14} />
                    <span>Bat: <span className="font-semibold text-slate-900">{sensor.batteryLevel}%</span></span>
                  </div>
                </div>
                <div className={`mt-3 text-xs px-2 py-1 rounded text-center font-bold text-white
                  ${sensor.status === SensorStatus.CRITICAL ? 'bg-red-500' : 
                    sensor.status === SensorStatus.WARNING ? 'bg-yellow-500' : 'bg-emerald-500'}`}>
                  {sensor.status.toUpperCase()}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend Overlay */}
      <div className="absolute bottom-6 right-2 bg-white/90 backdrop-blur-sm p-3 rounded shadow-md z-[400] text-xs space-y-2 border border-slate-300">
        <div className="font-bold text-slate-700 mb-1 uppercase">Trạng thái</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-700"></div> Bình thường</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-400 border-yellow-600"></div> Cảnh báo</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 border-red-700"></div> Nguy hiểm</div>
      </div>
    </div>
  );
};

export default SensorMap;