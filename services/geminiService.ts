import { GoogleGenAI, Type } from "@google/genai";
import { SensorData, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFloodRisk = async (sensors: SensorData[]): Promise<AnalysisResult> => {
  try {
    const sensorSummary = sensors.map(s => 
      `${s.name} (${s.region}): Rain 1h: ${s.rainfall1h}mm, Rain 24h: ${s.rainfall24h}mm, Level: ${s.waterLevel}m, Status: ${s.status}`
    ).join('\n');

    const prompt = `
      You are a hydrological expert analyzing real-time sensor data from Vietnam.
      
      Analyze the following sensor data:
      ${sensorSummary}

      Provide a structured JSON response with a short summary of the current situation, the overall risk level, and 3 specific recommendations for authorities.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A brief 2-sentence summary of the weather situation." },
            riskLevel: { type: Type.STRING, description: "Overall risk: Low, Moderate, High, or Severe." },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 3 specific actions authorities should take."
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    
    throw new Error("No data returned");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "Unable to generate analysis at this time due to connection issues.",
      riskLevel: "Unknown",
      recommendations: ["Check manual sensor feeds.", "Monitor local news.", "Verify device connectivity."]
    };
  }
};