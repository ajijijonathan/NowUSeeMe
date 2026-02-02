
import { GoogleGenAI, Type } from "@google/genai";
import { Location, SearchResponse, PlaceResult, WeatherData, PlaceType } from "../types";

// Fix: Strictly following the initialization guidelines by using process.env.API_KEY directly
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const fetchWeatherForLocation = async (location: Location): Promise<WeatherData | null> => {
  try {
    const ai = getAIClient();
    // Fix: Using gemini-3-flash-preview for basic text Q&A tasks as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `What is the current weather at coordinates (${location.latitude}, ${location.longitude})? 
      Return only a JSON object with these keys: "temp" (string, e.g. "22°C"), "condition" (string, e.g. "Sunny"), "emoji" (string, e.g. "☀️"), "locationName" (string, e.g. "San Francisco"). 
      Identify the location accurately based on the coordinates.
      Do not include any text outside the JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    if (text.trim().startsWith('{')) {
       return JSON.parse(text.trim());
    }
    
    return null;
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
};

export const searchLocalContent = async (
  query: string,
  location: Location | null
): Promise<SearchResponse> => {
  try {
    const ai = getAIClient();
    // Fix: Maps grounding is only supported in Gemini 2.5 series models
    const modelName = 'gemini-2.5-flash';
    
    const config: any = {
      tools: [{ googleMaps: {} }, { googleSearch: {} }],
    };

    if (location) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
      };
    }

    const prompt = `Find "${query}" near ${location ? `the user at (${location.latitude}, ${location.longitude})` : 'me'}. 
    This is a global search. Classify each result as either a 'market', 'service', 'emergency', or 'lifestyle'.
    Provide a professional summary of the local scene in this specific area.
    Then, for the places found, provide their metadata in a structured way.
    FORMAT AT THE END: JSON_META: [{"title": "Name", "lat": 0.0, "lng": 0.0, "type": "market/service/emergency/lifestyle"}]`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: config,
    });

    const text = response.text || "Searching local area...";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    let metaMap: Record<string, {lat: number, lng: number, type: PlaceType}> = {};
    const jsonMatch = text.match(/JSON_META:\s*(\[[\s\S]*?\])/);
    if (jsonMatch) {
      try {
        const metas = JSON.parse(jsonMatch[1]);
        metas.forEach((m: any) => {
          if (m.title) metaMap[m.title.toLowerCase().trim()] = { lat: m.lat, lng: m.lng, type: m.type };
        });
      } catch (e) {
        console.warn("Meta parse failed", e);
      }
    }

    const places: PlaceResult[] = chunks
      .filter((chunk: any) => chunk.maps || chunk.web)
      .map((chunk: any, index: number) => {
        const title = chunk.maps?.title || chunk.web?.title || "Unknown Place";
        const cleanTitle = title.toLowerCase().trim();
        const meta = metaMap[cleanTitle];
        
        let distanceStr = undefined;
        if (location && meta?.lat) {
          const d = Math.sqrt(Math.pow(location.latitude - meta.lat, 2) + Math.pow(location.longitude - meta.lng, 2)) * 111;
          distanceStr = d.toFixed(1) + " km";
        }

        return {
          title,
          uri: chunk.maps?.uri || chunk.web?.uri || "#",
          isPromoted: index === 0 && Math.random() > 0.8, 
          isVerified: Math.random() > 0.4,
          lat: meta?.lat,
          lng: meta?.lng,
          type: meta?.type || 'market',
          distance: distanceStr
        };
      });

    const cleanText = text.replace(/JSON_META:[\s\S]*/, '').trim();

    return {
      text: cleanText,
      places,
    };
  } catch (error: any) {
    console.error("Search Error:", error);
    return {
      text: "Encountered a connectivity error. Please try again.",
      places: [],
      error: error.message,
    };
  }
};
