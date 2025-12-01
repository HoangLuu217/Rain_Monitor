import React, { useState } from 'react';
import { SensorData, AnalysisResult } from '../types';
import { analyzeFloodRisk } from '../services/geminiService';
import { BrainCircuit, Loader2, AlertOctagon, CheckSquare } from 'lucide-react';

interface AiReportProps {
  sensors: SensorData[];
}

const AiReport: React.FC<AiReportProps> = ({ sensors }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    const analysis = await analyzeFloodRisk(sensors);
    setResult(analysis);
    setLoading(false);
  };

  if (!result && !loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-lg p-6 text-white shadow-xl flex flex-col items-center justify-center text-center h-full min-h-[200px]">
        <BrainCircuit size={48} className="mb-4 text-purple-300" />
        <h3 className="text-xl font-bold mb-2">AI Risk Assessment</h3>
        <p className="text-indigo-200 text-sm mb-6 max-w-xs">
          Use Gemini AI to analyze all sensor data across Vietnam and generate a flood risk report.
        </p>
        <button 
          onClick={handleAnalyze}
          className="bg-white text-indigo-900 px-6 py-2 rounded-full font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-lg"
        >
          Generate Report
        </button>
      </div>
    );
  }

  if (loading) {
     return (
      <div className="bg-white rounded-lg p-6 shadow border border-slate-200 flex flex-col items-center justify-center h-full min-h-[200px]">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-600 font-medium">Analyzing sensor data...</p>
        <p className="text-slate-400 text-sm mt-1">This uses Gemini 2.5 Flash</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border-l-4 border-indigo-500 overflow-hidden h-full">
      <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex justify-between items-center">
        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
          <BrainCircuit size={18} /> Flood Risk Analysis
        </h3>
        <button onClick={() => setResult(null)} className="text-xs text-indigo-600 hover:text-indigo-800 underline">
          Reset
        </button>
      </div>
      
      <div className="p-4 space-y-4 overflow-y-auto max-h-[300px]">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Risk</span>
          <div className="flex items-center gap-2 mt-1">
            <AlertOctagon className={
              result?.riskLevel.includes('High') || result?.riskLevel.includes('Severe') ? 'text-red-600' : 'text-yellow-600'
            } />
            <span className="text-lg font-bold text-slate-800">{result?.riskLevel}</span>
          </div>
        </div>

        <div>
           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Summary</span>
           <p className="text-sm text-slate-700 mt-1 leading-relaxed bg-slate-50 p-2 rounded">
             {result?.summary}
           </p>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recommendations</span>
          <ul className="mt-2 space-y-2">
            {result?.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-slate-700">
                <CheckSquare size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AiReport;