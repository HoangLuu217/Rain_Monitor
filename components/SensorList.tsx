import React from 'react';
import { SensorData, SensorStatus } from '../types';
import { AlertTriangle, CheckCircle, Search, BatteryCharging, Droplets } from 'lucide-react';

interface SensorListProps {
  sensors: SensorData[];
  onSelectSensor: (sensor: SensorData) => void;
  selectedSensorId: string | null;
}

const SensorList: React.FC<SensorListProps> = ({ sensors, onSelectSensor, selectedSensorId }) => {
  const [filter, setFilter] = React.useState('');

  const filteredSensors = sensors.filter(s => 
    s.name.toLowerCase().includes(filter.toLowerCase()) || 
    s.region.toLowerCase().includes(filter.toLowerCase())
  );

  const getStatusIcon = (status: SensorStatus) => {
    switch (status) {
      case SensorStatus.CRITICAL: return <AlertTriangle className="text-red-500" size={18} />;
      case SensorStatus.WARNING: return <AlertTriangle className="text-yellow-500" size={18} />;
      default: return <CheckCircle className="text-emerald-500" size={18} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-lg">
        <h2 className="font-bold text-slate-700">Device List ({filteredSensors.length})</h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search location..." 
            className="pl-8 pr-4 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3 text-right">Rain (1h)</th>
              <th className="px-4 py-3 text-right">Level</th>
              <th className="px-4 py-3 text-center">Battery</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSensors.map(sensor => (
              <tr 
                key={sensor.id}
                onClick={() => onSelectSensor(sensor)}
                className={`hover:bg-blue-50 cursor-pointer transition-colors ${selectedSensorId === sensor.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 font-medium">
                    {getStatusIcon(sensor.status)}
                    <span className={
                      sensor.status === SensorStatus.CRITICAL ? 'text-red-600' :
                      sensor.status === SensorStatus.WARNING ? 'text-yellow-600' : 'text-emerald-600'
                    }>{sensor.status}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800">{sensor.name}</div>
                  <div className="text-xs text-slate-500">{sensor.region}</div>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {sensor.rainfall1h > 0 ? (
                    <span className="font-bold text-blue-600">{sensor.rainfall1h}mm</span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Droplets size={14} className="text-sky-400" />
                    <span>{sensor.waterLevel}m</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-500">
                    <BatteryCharging size={14} />
                    {sensor.batteryLevel}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SensorList;