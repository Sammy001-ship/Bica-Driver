
import React, { useState, useEffect, useRef } from 'react';
import { IMAGES } from '../constants';
import { CapacitorService } from '../services/CapacitorService';
import { GoogleGenAI } from "@google/genai";
import InteractiveMap from '../components/InteractiveMap';
import { Geolocation } from '@capacitor/geolocation';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string | number;
}

interface AiPlace {
  title: string;
  uri: string;
  lat?: number;
  lng?: number;
}

interface RequestRideScreenProps {
  onOpenProfile: () => void;
  onBack: () => void;
}

const RequestRideScreen: React.FC<RequestRideScreenProps> = ({ onOpenProfile, onBack }) => {
  const [rideType, setRideType] = useState<'now' | 'schedule'>('now');
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'standard' | 'smart'>('standard');
  
  const [pickupLocation, setPickupLocation] = useState('Locating...');
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [pickupResults, setPickupResults] = useState<SearchResult[]>([]);
  const [isTrackingLive, setIsTrackingLive] = useState(true);
  
  const [destination, setDestination] = useState('');
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [destResults, setDestResults] = useState<SearchResult[]>([]);
  const [aiPlaces, setAiPlaces] = useState<AiPlace[]>([]);
  
  const [activeSearchField, setActiveSearchField] = useState<'pickup' | 'destination' | null>(null);
  
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.5244, 3.3792]);
  const [userRealTimePos, setUserRealTimePos] = useState<[number, number] | null>(null);
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: ''
  });

  const searchTimeout = useRef<any>(null);
  const aiGeocodeTimeout = useRef<any>(null);
  const watchIdRef = useRef<string | null>(null);

  const isScheduleValid = rideType === 'now' || (scheduleData.date && scheduleData.time);

  /**
   * Smart Reverse Geocode using Google Maps Grounding via Gemini.
   * This avoids showing raw digits and gives human-friendly landmark names.
   */
  const smartReverseGeocode = async (lat: number, lon: number): Promise<string> => {
    if (!process.env.API_KEY) return "My Location";

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Tell me the name of the specific street or nearest landmark at these coordinates. Return ONLY the name, no extra text.",
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: { latitude: lat, longitude: lon }
            }
          }
        },
      });

      const result = response.text?.trim();
      if (result && !result.includes('{') && result.length < 100) {
        return result;
      }
      
      // Fallback to standard Nominatim if AI response is weird
      const osmRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await osmRes.json();
      return data.address?.road || data.address?.suburb || data.display_name?.split(',')[0] || "Lagos Street";
    } catch (error) {
      console.error("Smart geocode failed", error);
      return "Current Location";
    }
  };

  useEffect(() => {
    const startTracking = async () => {
      try {
        const id = await Geolocation.watchPosition({
          enableHighAccuracy: true,
          timeout: 10000
        }, (position) => {
          if (position) {
            const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
            setUserRealTimePos(coords);
            
            if (isTrackingLive) {
              setPickupCoords(coords);
              setMapCenter(coords);
              
              // Debounce AI Reverse Geocoding to avoid slamming the API while moving
              if (aiGeocodeTimeout.current) clearTimeout(aiGeocodeTimeout.current);
              aiGeocodeTimeout.current = setTimeout(async () => {
                const friendlyAddress = await smartReverseGeocode(coords[0], coords[1]);
                setPickupLocation(friendlyAddress);
              }, 2000);
            }
          }
        });
        watchIdRef.current = id;
      } catch (e) {
        console.error("Tracking error", e);
      }
    };

    startTracking();

    return () => {
      if (watchIdRef.current) {
        Geolocation.clearWatch({ id: watchIdRef.current });
      }
      if (aiGeocodeTimeout.current) clearTimeout(aiGeocodeTimeout.current);
    };
  }, [isTrackingLive]);

  const handleGetLocation = async () => {
    CapacitorService.triggerHaptic();
    setIsTrackingLive(true);
    setPickupLocation("Identifying landmark...");
    if (userRealTimePos) {
      setMapCenter(userRealTimePos);
      setPickupCoords(userRealTimePos);
      const address = await smartReverseGeocode(userRealTimePos[0], userRealTimePos[1]);
      setPickupLocation(address);
    }
  };

  const searchPlaces = async (query: string, field: 'pickup' | 'destination') => {
    if (query.length < 3) {
      field === 'pickup' ? setPickupResults([]) : setDestResults([]);
      return;
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ng`);
      const data = await response.json();
      field === 'pickup' ? setPickupResults(data) : setDestResults(data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const performSmartSearch = async (query: string) => {
    if (!query || query.length < 3 || !process.env.API_KEY || !pickupCoords) return;
    
    setIsAiLoading(true);
    setAiPlaces([]);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `I am looking for: ${query}. Use real Google Maps data to find specific, highly-rated locations near me.`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: pickupCoords[0],
                longitude: pickupCoords[1]
              }
            }
          }
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const foundPlaces: AiPlace[] = [];
      
      for (const chunk of chunks) {
        if (chunk.maps) {
          foundPlaces.push({
            title: chunk.maps.title,
            uri: chunk.maps.uri
          });
        }
      }

      const enrichedPlaces = await Promise.all(foundPlaces.map(async (p) => {
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(p.title)}&limit=1&countrycodes=ng`);
          const geoData = await geoRes.json();
          if (geoData && geoData[0]) {
            return { ...p, lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) };
          }
        } catch (e) {}
        return p;
      }));

      setAiPlaces(enrichedPlaces);
      setAiInsight(response.text || "Here's what I found via Google Maps.");
    } catch (error) {
      console.error("Smart Search Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleInputChange = (val: string, field: 'pickup' | 'destination') => {
    if (field === 'pickup') {
      setPickupLocation(val);
      setActiveSearchField('pickup');
      setIsTrackingLive(false); 
    } else {
      setDestination(val);
      setActiveSearchField('destination');
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      if (searchMode === 'smart' && field === 'destination') {
        performSmartSearch(val);
      } else {
        searchPlaces(val, field);
      }
    }, 800);
  };

  const handleManualSearch = (field: 'pickup' | 'destination') => {
    CapacitorService.triggerHaptic();
    const query = field === 'pickup' ? pickupLocation : destination;
    setActiveSearchField(field);
    searchPlaces(query, field);
  };

  const selectResult = (result: SearchResult, field: 'pickup' | 'destination') => {
    const coords: [number, number] = [parseFloat(result.lat), parseFloat(result.lon)];
    if (field === 'pickup') {
      setPickupLocation(result.display_name.split(',')[0]); 
      setPickupCoords(coords);
      setPickupResults([]);
      setIsTrackingLive(false);
    } else {
      setDestination(result.display_name.split(',')[0]);
      setDestCoords(coords);
      setDestResults([]);
      setAiPlaces([]);
    }
    setMapCenter(coords);
    setActiveSearchField(null);
    CapacitorService.triggerHaptic();
  };

  const selectAiPlace = async (place: AiPlace) => {
    setDestination(place.title);
    if (place.lat && place.lng) {
      const coords: [number, number] = [place.lat, place.lng];
      setDestCoords(coords);
      setMapCenter(coords);
    } else {
      searchPlaces(place.title, 'destination');
    }
    setAiPlaces([]);
    setActiveSearchField(null);
    CapacitorService.triggerHaptic();
  };

  const handleMarkerDragEnd = async (id: string, newPos: [number, number]) => {
    CapacitorService.triggerHaptic();
    const address = await smartReverseGeocode(newPos[0], newPos[1]);
    
    if (id === 'pickup') {
      setIsTrackingLive(false);
      setPickupCoords(newPos);
      setPickupLocation(address);
    } else {
      setDestCoords(newPos);
      setDestination(address);
    }
  };

  const handleMainAction = () => {
    CapacitorService.triggerHaptic();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      alert(rideType === 'now' ? "Connecting you with the closest Bicadriver." : "Ride Scheduled! We'll notify you 15 mins before.");
    }, 2000);
  };

  const mapMarkers: any[] = [];
  if (userRealTimePos) mapMarkers.push({ id: 'user-live', position: userRealTimePos, title: 'Real-time GPS', icon: 'user', draggable: false });
  if (pickupCoords) mapMarkers.push({ id: 'pickup', position: pickupCoords, title: 'Pick-up', icon: 'pickup', draggable: true });
  if (destCoords) mapMarkers.push({ id: 'destination', position: destCoords, title: 'Destination', icon: 'destination', draggable: true });
  
  aiPlaces.forEach((p, idx) => {
    if (p.lat && p.lng) {
      mapMarkers.push({ id: `ai-${idx}`, position: [p.lat, p.lng], title: p.title, icon: 'pickup', draggable: false });
    }
  });

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col relative bg-background-dark">
      <div className="absolute inset-0 z-0">
        <InteractiveMap 
          center={mapCenter} 
          markers={mapMarkers} 
          onMarkerDragEnd={handleMarkerDragEnd}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#101622]/60 via-transparent to-[#101622]/90 pointer-events-none"></div>
      </div>

      <div className="relative z-30 flex items-center justify-between p-4 pt-8 pb-4">
        <button onClick={onBack} className="bg-surface-dark/80 backdrop-blur-md text-white size-10 flex items-center justify-center rounded-full shadow-lg active:scale-95 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex bg-surface-dark/80 backdrop-blur-md rounded-full p-1 border border-white/10">
          <button 
            onClick={() => { CapacitorService.triggerHaptic(); setSearchMode('standard'); setAiPlaces([]); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${searchMode === 'standard' ? 'bg-primary text-white' : 'text-slate-400'}`}
          >
            Direct
          </button>
          <button 
            onClick={() => { CapacitorService.triggerHaptic(); setSearchMode('smart'); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${searchMode === 'smart' ? 'bg-primary text-white' : 'text-slate-400'}`}
          >
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            Smart
          </button>
        </div>
        <button onClick={onOpenProfile} className="bg-surface-dark/80 backdrop-blur-md text-white size-10 flex items-center justify-center rounded-full shadow-lg active:scale-95 transition-all">
          <span className="material-symbols-outlined">person</span>
        </button>
      </div>

      <div className="flex-1"></div>

      <div className="relative z-30 flex flex-col gap-2 p-4 items-end mb-2">
        <button 
          onClick={handleGetLocation} 
          className={`bg-white text-primary p-3 rounded-full shadow-2xl active:scale-90 transition-all ${isTrackingLive ? 'ring-4 ring-primary/20' : ''}`}
        >
          <span className={`material-symbols-outlined ${isTrackingLive ? 'filled' : ''}`}>my_location</span>
        </button>
      </div>

      <div className="relative z-20 w-full bg-surface-dark rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="w-full flex justify-center pt-3 pb-1"><div className="h-1.5 w-12 rounded-full bg-slate-600"></div></div>
        
        <div className="p-6 pt-2 pb-8 flex flex-col gap-6 overflow-y-auto no-scrollbar">
          <div className="flex p-1 bg-input-dark rounded-xl">
            <button onClick={() => setRideType('now')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${rideType === 'now' ? 'bg-primary text-white shadow-md' : 'text-slate-400'}`}>Ride Now</button>
            <button onClick={() => setRideType('schedule')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${rideType === 'schedule' ? 'bg-primary text-white shadow-md' : 'text-slate-400'}`}>Schedule</button>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center pt-4 pb-2">
              <div className="w-4 h-4 rounded-full border-2 border-primary bg-transparent shrink-0"></div>
              <div className="w-0.5 flex-1 bg-gradient-to-b from-primary to-slate-600 my-1 rounded-full"></div>
              <div className="w-4 h-4 rounded-sm bg-primary shrink-0"></div>
            </div>

            <div className="flex flex-col gap-4 flex-1">
              <div className="group relative">
                <div className="flex items-center justify-between mb-1 pl-1">
                  <label className="text-xs font-medium text-slate-400">Pick-up Location</label>
                  {isTrackingLive && (
                    <span className="text-[10px] font-bold text-primary flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Live GPS
                    </span>
                  )}
                </div>
                <div className="flex items-center bg-input-dark rounded-xl px-4 h-12 border border-slate-700/50 focus-within:border-primary/50 transition-colors">
                  <input 
                    className="bg-transparent border-none text-white text-sm font-bold w-full focus:ring-0 p-0" 
                    placeholder="Resolving landmark..." 
                    type="text" 
                    value={pickupLocation} 
                    onChange={(e) => handleInputChange(e.target.value, 'pickup')} 
                    onFocus={() => setActiveSearchField('pickup')}
                  />
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleManualSearch('pickup')} className="active:scale-90 p-1 text-slate-500 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">search</span>
                    </button>
                    <button onClick={handleGetLocation} className={`active:scale-90 p-1 transition-colors ${isTrackingLive ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}>
                      <span className="material-symbols-outlined text-[20px]">my_location</span>
                    </button>
                  </div>
                </div>
                {activeSearchField === 'pickup' && pickupResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-input-dark rounded-xl border border-slate-700/50 shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                    {pickupResults.map((res) => (
                      <button key={res.place_id} onClick={() => selectResult(res, 'pickup')} className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-700/50 border-b border-slate-700/30 last:border-0 flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-500 text-[18px]">location_on</span>
                        <div className="flex flex-col">
                          <span className="truncate font-bold">{res.display_name.split(',')[0]}</span>
                          <span className="truncate text-[10px] text-slate-500">{res.display_name.split(',').slice(1).join(',')}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="group relative">
                <label className="text-xs font-medium text-slate-400 mb-1 block pl-1">Destination {searchMode === 'smart' && <span className="text-primary font-bold">(Smart Mode)</span>}</label>
                <div className="flex items-center bg-input-dark rounded-xl px-4 h-12 border border-slate-700/50 focus-within:border-primary/50 transition-colors">
                  <input 
                    className="bg-transparent border-none text-white text-sm font-bold w-full focus:ring-0 p-0" 
                    placeholder={searchMode === 'smart' ? "Search by mood or place type..." : "Enter your destination"} 
                    type="text" 
                    value={destination} 
                    onChange={(e) => handleInputChange(e.target.value, 'destination')} 
                    onFocus={() => setActiveSearchField('destination')}
                  />
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleManualSearch('destination')} className={`active:scale-90 p-1 transition-colors ${isAiLoading ? 'text-primary animate-pulse' : 'text-slate-500 hover:text-primary'}`}>
                      <span className="material-symbols-outlined text-[20px]">
                        {searchMode === 'smart' ? 'auto_awesome' : 'search'}
                      </span>
                    </button>
                  </div>
                </div>
                
                {activeSearchField === 'destination' && (destResults.length > 0 || aiPlaces.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-input-dark rounded-xl border border-slate-700/50 shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto">
                    {searchMode === 'smart' ? aiPlaces.map((p, idx) => (
                      <div key={idx} className="border-b border-slate-700/30 last:border-0">
                        <button onClick={() => selectAiPlace(p)} className="w-full px-4 py-3 text-left text-sm text-white hover:bg-slate-700/50 flex flex-col gap-0.5">
                          <span className="font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[16px]">stars</span>{p.title}</span>
                          <span className="text-[10px] text-slate-500">Google Grounded AI Result</span>
                        </button>
                        <a href={p.uri} target="_blank" rel="noopener noreferrer" className="block px-4 pb-2 text-[10px] text-primary hover:underline font-bold">Details on Google Maps</a>
                      </div>
                    )) : destResults.map((res) => (
                      <button key={res.place_id} onClick={() => selectResult(res, 'destination')} className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-700/50 border-b border-slate-700/30 last:border-0 flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-500 text-[18px]">map</span>
                        <div className="flex flex-col">
                          <span className="truncate font-bold">{res.display_name.split(',')[0]}</span>
                          <span className="truncate text-[10px] text-slate-500">{res.display_name.split(',').slice(1).join(',')}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {(aiInsight || isAiLoading) && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
              <span className={`material-symbols-outlined text-primary text-[20px] shrink-0 ${isAiLoading ? 'animate-spin' : ''}`}>
                {isAiLoading ? 'progress_activity' : 'auto_awesome'}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Map Grounding Engine</span>
                <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                  {isAiLoading ? "Resolving Google Maps metadata..." : aiInsight}
                </p>
              </div>
            </div>
          )}

          <div className="mt-2 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Estimated Fare</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">₦15,000</span>
                  <span className="text-sm font-medium text-slate-400">- ₦20,000</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-input-dark px-3 py-1.5 rounded-lg border border-slate-700/50 shadow-inner">
                <span className="material-symbols-outlined text-slate-400 text-[16px]">credit_card</span>
                <span className="text-xs font-semibold text-slate-300">Personal • 4288</span>
              </div>
            </div>
            
            <button 
              onClick={handleMainAction}
              disabled={isSearching || !isScheduleValid || !destination}
              className={`w-full ${isSearching ? 'bg-slate-600' : isScheduleValid && destination ? 'bg-primary hover:bg-blue-600' : 'bg-slate-700 opacity-50 cursor-not-allowed'} text-white font-black text-lg py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2`}
            >
              {isSearching ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span>{rideType === 'now' ? 'Find My Bicadriver' : 'Confirm Schedule'}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestRideScreen;
