import React, { useState } from 'react';
import Header from './components/Header';
import SensorMap from './components/SensorMap';
import SensorList from './components/SensorList';
import { ViewMode, SensorData } from './types';
import { MOCK_SENSORS } from './constants';

function App() {
  const [view, setView] = useState<ViewMode>('combined');
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);

  // In a real app, this would use useEffect with a fetch call
  const sensors = MOCK_SENSORS;

  const handleSelectSensor = (sensor: SensorData) => {
    setSelectedSensorId(sensor.id);
    // If on mobile list view, switch to map to show location
    if (window.innerWidth < 768 && view === 'list') {
        setView('map');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <Header currentView={view} setView={setView} />

      <main className="flex-1 p-4 overflow-hidden relative">
        {view === 'combined' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4">
             {/* Main Map Area */}
            <div className="lg:col-span-8 h-[50vh] lg:h-full relative">
               <SensorMap 
                  sensors={sensors} 
                  selectedSensorId={selectedSensorId}
                  onSelectSensor={handleSelectSensor}
                />
            </div>
            
            {/* Sidebar with Analysis and List */}
            <div className="lg:col-span-4 h-full">
              <SensorList 
                sensors={sensors} 
                onSelectSensor={handleSelectSensor} 
                selectedSensorId={selectedSensorId}
              />
            </div>
          </div>
        )}

        {view === 'map' && (
          <div className="h-full w-full relative">
             <SensorMap 
                sensors={sensors} 
                selectedSensorId={selectedSensorId}
                onSelectSensor={handleSelectSensor}
              />
          </div>
        )}

        {view === 'list' && (
          <div className="h-full max-w-5xl mx-auto">
             <div className="h-full flex flex-col gap-4">
               <div className="flex-1 min-h-0">
                 <SensorList 
                    sensors={sensors} 
                    onSelectSensor={handleSelectSensor} 
                    selectedSensorId={selectedSensorId}
                  />
               </div>
             </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-2 px-6 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="font-black text-red-600 uppercase tracking-wide">
          Hoàng Sa, Trường Sa là của Việt Nam 🇻🇳
        </div>
        <div>
          Data refreshed: {new Date().toLocaleTimeString()}
        </div>
      </footer>
    </div>
  );
}

export default App;