
import React, { useState, useEffect, useRef } from 'react';
import { IMAGES } from '../constants';
import { CapacitorService } from '../services/CapacitorService';
import { GoogleGenAI } from "@google/genai";
import InteractiveMap from '../components/InteractiveMap';

interface SearchResult {
  display_name: string;
  lat: number;
  lon: number;
  id: string;
  description?: string;
  type?: string;
}

interface RequestRideScreenProps {
  onOpenProfile: () => void;
  onBack: () => void;
}

const DEFAULT_KEYWORDS = [
  { label: 'Airport', icon: 'flight_takeoff' },
  { label: 'Business', icon: 'work' },
  { label: 'Hotels', icon: 'hotel' },
  { label: 'Clubs', icon: 'nightlife' },
  { label: 'Parks', icon: 'park' }
];

const RequestRideScreen: React.FC<RequestRideScreenProps> = ({ onOpenProfile, onBack }) => {
  const [rideType, setRideType] = useState<'now' | 'schedule'>('now');
  const [isSearching, setIsSearching] = useState(false);
  
  const [pickupLocation, setPickupLocation] = useState('Acquiring location...');
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [pickupResults, setPickupResults] = useState<SearchResult[]>([]);
  const [isTrackingLive, setIsTrackingLive] = useState(true);
  
  const [destination, setDestination] = useState('');
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [destResults, setDestResults] = useState<SearchResult[]>([]);
  
  const [activeSearchField, setActiveSearchField] = useState<'pickup' | 'destination' | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.5244, 3.3792]);
  const [userRealTimePos, setUserRealTimePos] = useState<[number, number] | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number>(0);
  const [areaKeywords, setAreaKeywords] = useState(DEFAULT_KEYWORDS);

  const searchTimeout = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  const aiResolveLocation = async (query: string, field: 'pickup' | 'destination') => {
    if (!query || query.length < 2 || !process.env.API_KEY) return;
    
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Locate this place in Nigeria: "${query}". Return the top 3 best matching specific locations. Format: Name|Lat|Lon|ShortDescription`,
        config: { tools: [{ googleSearch: {} }] },
      });

      const text = response.text || "";
      const lines = text.split('\n').filter(l => l.includes('|'));
      const results: SearchResult[] = lines.map((line, i) => {
        const [name, lat, lon, desc] = line.split('|');
        return {
          display_name: name.trim(),
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          description: desc?.trim(),
          id: `ai-${i}-${Date.now()}`
        };
      }).filter(r => !isNaN(r.lat));

      if (field === 'pickup') setPickupResults(results);
      else setDestResults(results);

      setAiInsight(results.length > 0 ? `I've mapped out direct locations for "${query}".` : "Finding best direct route...");
    } catch (error) {
      console.error("AI resolution failed", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchAreaKeywords = async (lat: number, lon: number) => {
    if (!process.env.API_KEY) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Give me 5 trending destination categories near coordinates ${lat}, ${lon} in Nigeria. Return as a short comma-separated list.`,
        config: { tools: [{ googleSearch: {} }] }
      });
      const keywords = response.text?.split(',').map(k => k.trim()) || [];
      if (keywords.length > 0) {
        setAreaKeywords(keywords.map(k => ({ label: k, icon: 'explore' })));
      }
    } catch (e) {}
  };

  const smartReverseGeocode = async (lat: number, lon: number): Promise<string> => {
    if (!process.env.API_KEY) return "Direct Location";
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `What is the specific place name or building at ${lat}, ${lon}? Return ONLY the name.`,
        config: { tools: [{ googleSearch: {} }] }
      });
      return response.text?.trim() || "My Current Location";
    } catch (error) {
      return "Direct Location";
    }
  };

  useEffect(() => {
    const initLocation = async () => {
      const pos = await CapacitorService.getCurrentLocation();
      if (pos) {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserRealTimePos(coords);
        setPickupCoords(coords);
        setMapCenter(coords);
        setLocationAccuracy(pos.coords.accuracy || 0);
        const name = await smartReverseGeocode(coords[0], coords[1]);
        setPickupLocation(name);
        fetchAreaKeywords(coords[0], coords[1]);
      }

      if ("geolocation" in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition((p) => {
          const c: [number, number] = [p.coords.latitude, p.coords.longitude];
          setUserRealTimePos(c);
          setLocationAccuracy(p.coords.accuracy || 0);
          if (isTrackingLive) {
            setPickupCoords(c);
            setMapCenter(c);
          }
        }, null, { enableHighAccuracy: true });
      }
    };

    initLocation();
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const handleInputChange = (val: string, field: 'pickup' | 'destination') => {
    if (field === 'pickup') {
      setPickupLocation(val);
      setIsTrackingLive(false);
    } else {
      setDestination(val);
    }
    setActiveSearchField(field);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => aiResolveLocation(val, field), 1500);
  };

  const handleManualSearch = (field: 'pickup' | 'destination') => {
    CapacitorService.triggerHaptic();
    const query = field === 'pickup' ? pickupLocation : destination;
    aiResolveLocation(query, field);
  };

  const selectResult = (res: SearchResult, field: 'pickup' | 'destination') => {
    const coords: [number, number] = [res.lat, res.lon];
    if (field === 'pickup') {
      setPickupLocation(res.display_name);
      setPickupCoords(coords);
    } else {
      setDestination(res.display_name);
      setDestCoords(coords);
    }
    setMapCenter(coords);
    setActiveSearchField(null);
    CapacitorService.triggerHaptic();
  };

  const handleMarkerDragEnd = async (id: string, newPos: [number, number]) => {
    CapacitorService.triggerHaptic();
    const name = await smartReverseGeocode(newPos[0], newPos[1]);
    if (id === 'pickup') {
      setPickupCoords(newPos);
      setPickupLocation(name);
      setIsTrackingLive(false);
    } else {
      setDestCoords(newPos);
      setDestination(name);
    }
  };

  const handleLocateMe = async () => {
    CapacitorService.triggerHaptic();
    setIsTrackingLive(true);
    if (userRealTimePos) {
      setMapCenter(userRealTimePos);
      setPickupCoords(userRealTimePos);
      const name = await smartReverseGeocode(userRealTimePos[0], userRealTimePos[1]);
      setPickupLocation(name);
    }
  };

  // Added handleKeywordTap to resolve "Cannot find name 'handleKeywordTap'" error
  const handleKeywordTap = (label: string) => {
    CapacitorService.triggerHaptic();
    setDestination(label);
    setActiveSearchField('destination');
    aiResolveLocation(label, 'destination');
  };

  const mapMarkers: any[] = [];
  if (userRealTimePos) mapMarkers.push({ id: 'live', position: userRealTimePos, title: 'Live Pulse', icon: 'user' });
  if (pickupCoords) mapMarkers.push({ id: 'pickup', position: pickupCoords, title: 'Direct Pickup', icon: 'pickup', draggable: true });
  if (destCoords) mapMarkers.push({ id: 'destination', position: destCoords, title: 'Direct Drop-off', icon: 'destination', draggable: true });

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col relative bg-background-dark">
      <div className="absolute inset-0 z-0">
        <InteractiveMap 
          center={mapCenter} 
          zoom={pickupCoords ? 17 : 14}
          markers={mapMarkers} 
          onMarkerDragEnd={handleMarkerDragEnd}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/40 via-transparent to-background-dark/95 pointer-events-none"></div>
      </div>

      {/* Floating UI Overlay */}
      <div className="relative z-30 flex items-center justify-between p-4 pt-10">
        <button onClick={onBack} className="bg-surface-dark/95 backdrop-blur-3xl text-white size-12 flex items-center justify-center rounded-2xl shadow-2xl border border-white/10 active:scale-90 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        
        {locationAccuracy > 0 && (
          <div className="bg-accent/10 backdrop-blur-xl border border-accent/30 px-4 py-2 rounded-full flex items-center gap-2 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            <span className="text-[10px] font-black text-accent uppercase tracking-widest">Accuracy Lock</span>
          </div>
        )}

        <button onClick={onOpenProfile} className="bg-surface-dark/95 backdrop-blur-3xl text-white size-12 flex items-center justify-center rounded-2xl shadow-2xl border border-white/10 active:scale-90 transition-all">
          <span className="material-symbols-outlined">person</span>
        </button>
      </div>

      <div className="flex-1"></div>

      {/* Re-center Control */}
      <div className="relative z-30 p-4 flex justify-end">
        <button 
          onClick={handleLocateMe}
          className={`relative bg-white text-primary p-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.6)] active:scale-90 transition-all ${isTrackingLive ? 'ring-4 ring-primary/40' : ''}`}
        >
          <span className={`material-symbols-outlined text-2xl ${isTrackingLive ? 'filled' : ''}`}>my_location</span>
          {isTrackingLive && <div className="absolute inset-0 rounded-full border-4 border-accent/20 animate-ping"></div>}
        </button>
      </div>

      {/* Main Bottom Interface */}
      <div className="relative z-20 w-full bg-surface-dark rounded-t-[3.5rem] shadow-[0_-30px_80px_rgba(0,0,0,0.9)] border-t border-white/5 flex flex-col max-h-[85vh]">
        <div className="w-full flex justify-center py-5"><div className="h-1.5 w-16 rounded-full bg-slate-700/40"></div></div>
        
        <div className="px-7 pb-12 flex flex-col gap-6 overflow-y-auto no-scrollbar">
          {/* Related Discovery Chips */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Popular Nearby</span>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
              {areaKeywords.map((kw, i) => (
                <button 
                  key={i}
                  onClick={() => handleKeywordTap(kw.label)}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-input-dark/60 border border-white/5 hover:border-accent/50 hover:bg-accent/10 transition-all shrink-0 active:scale-95 group shadow-lg"
                >
                  <span className="material-symbols-outlined text-sm text-slate-500 group-hover:text-accent transition-colors">{kw.icon}</span>
                  <span className="text-[11px] font-black text-slate-300 group-hover:text-white uppercase tracking-wider">{kw.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex p-1.5 bg-input-dark rounded-[2rem] border border-white/5 shadow-inner">
            <button onClick={() => setRideType('now')} className={`flex-1 py-4 rounded-3xl text-[11px] font-black uppercase tracking-[0.15em] transition-all ${rideType === 'now' ? 'bg-primary text-white shadow-2xl' : 'text-slate-500'}`}>Ride Now</button>
            <button onClick={() => setRideType('schedule')} className={`flex-1 py-4 rounded-3xl text-[11px] font-black uppercase tracking-[0.15em] transition-all ${rideType === 'schedule' ? 'bg-primary text-white shadow-2xl' : 'text-slate-500'}`}>Schedule</button>
          </div>

          <div className="flex gap-5">
            <div className="flex flex-col items-center pt-8 pb-4">
              <div className="w-4 h-4 rounded-full border-2 border-accent shadow-[0_0_12px_rgba(241,118,6,0.5)]"></div>
              <div className="w-0.5 flex-1 bg-gradient-to-b from-accent via-accent/40 to-slate-800 my-2 rounded-full opacity-50"></div>
              <div className="w-4 h-4 rounded-lg bg-primary shadow-[0_0_12px_rgba(4,88,40,0.5)]"></div>
            </div>

            <div className="flex flex-col gap-8 flex-1">
              {/* Pickup */}
              <div className="relative">
                <div className="flex items-center justify-between mb-2 ml-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Direct Pickup</label>
                  {isTrackingLive && <span className="text-[9px] font-black text-accent uppercase bg-accent/10 px-2 py-0.5 rounded">Live Map</span>}
                </div>
                <div className={`flex items-center bg-input-dark rounded-[1.5rem] px-5 h-16 border transition-all shadow-xl ${activeSearchField === 'pickup' ? 'border-primary shadow-primary/10' : 'border-white/5'}`}>
                  <input 
                    className="bg-transparent border-none text-white text-[16px] font-bold w-full focus:ring-0 p-0 placeholder-slate-700" 
                    placeholder="Where are you?"
                    value={pickupLocation}
                    onChange={(e) => handleInputChange(e.target.value, 'pickup')}
                    onFocus={() => setActiveSearchField('pickup')}
                  />
                  <button onClick={() => handleManualSearch('pickup')} className="p-2 text-slate-400 hover:text-accent transition-colors active:scale-90">
                    <span className="material-symbols-outlined text-2xl">search</span>
                  </button>
                  {isAiLoading && activeSearchField === 'pickup' && <span className="material-symbols-outlined animate-spin text-accent ml-1">progress_activity</span>}
                </div>
                {activeSearchField === 'pickup' && pickupResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-surface-dark rounded-3xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] z-[60] overflow-hidden animate-scale-in max-h-64 overflow-y-auto">
                    {pickupResults.map(res => (
                      <button key={res.id} onClick={() => selectResult(res, 'pickup')} className="w-full p-5 text-left border-b border-white/5 hover:bg-primary/10 flex flex-col gap-1 group transition-all">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-slate-500 group-hover:text-accent transition-colors">location_on</span>
                          <span className="text-white text-[15px] font-bold truncate">{res.display_name}</span>
                        </div>
                        {res.description && <span className="text-[10px] text-slate-400 font-medium ml-8 leading-tight">{res.description}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Destination */}
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2 block ml-1">Destination Address</label>
                <div className={`flex items-center bg-input-dark rounded-[1.5rem] px-5 h-16 border transition-all shadow-xl ${activeSearchField === 'destination' ? 'border-primary shadow-primary/10' : 'border-white/5'}`}>
                  <input 
                    className="bg-transparent border-none text-white text-[16px] font-bold w-full focus:ring-0 p-0 placeholder-slate-700" 
                    placeholder="Where to?"
                    value={destination}
                    onChange={(e) => handleInputChange(e.target.value, 'destination')}
                    onFocus={() => setActiveSearchField('destination')}
                  />
                  <button onClick={() => handleManualSearch('destination')} className="p-2 text-slate-400 hover:text-accent transition-colors active:scale-90">
                    <span className="material-symbols-outlined text-2xl">search</span>
                  </button>
                  {isAiLoading && activeSearchField === 'destination' && <span className="material-symbols-outlined animate-spin text-accent ml-1">progress_activity</span>}
                </div>
                {activeSearchField === 'destination' && destResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-surface-dark rounded-3xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] z-[60] overflow-hidden animate-scale-in max-h-64 overflow-y-auto">
                    {destResults.map(res => (
                      <button key={res.id} onClick={() => selectResult(res, 'destination')} className="w-full p-5 text-left border-b border-white/5 hover:bg-primary/10 flex flex-col gap-1 group transition-all">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-slate-500 group-hover:text-accent transition-colors">map</span>
                          <span className="text-white text-[15px] font-bold truncate">{res.display_name}</span>
                        </div>
                        {res.description && <span className="text-[10px] text-slate-400 font-medium ml-8 leading-tight">{res.description}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {aiInsight && !isAiLoading && (
            <div className="bg-primary/10 border border-primary/30 rounded-3xl p-6 flex gap-5 animate-slide-up shadow-xl">
              <div className="bg-primary/20 p-3 rounded-2xl shrink-0 h-fit">
                <span className="material-symbols-outlined text-accent text-2xl filled">auto_awesome</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">AI Direct Intelligence</span>
                <p className="text-[13px] text-slate-300 leading-relaxed font-bold italic opacity-90">{aiInsight}</p>
              </div>
            </div>
          )}

          {/* Pricing & Booking */}
          <div className="mt-6 space-y-10">
            <div className="flex items-center justify-between px-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.25em] mb-2">Estimated Fare</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-[34px] font-black text-white tracking-tighter">₦15,000</span>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Fixed</span>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-input-dark/80 px-6 py-4 rounded-3xl border border-white/10 shadow-lg">
                <span className="material-symbols-outlined text-slate-400 text-xl">credit_card</span>
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">VISA • 4288</span>
              </div>
            </div>
            
            <button 
              onClick={() => {
                CapacitorService.triggerHaptic();
                setIsSearching(true);
                setTimeout(() => { setIsSearching(false); alert("Requesting Professional Chauffeur..."); }, 1500);
              }}
              disabled={!destination || isSearching}
              className={`w-full h-20 rounded-[2rem] font-black text-[17px] uppercase tracking-[0.15em] flex items-center justify-center gap-4 shadow-[0_25px_60px_rgba(0,0,0,0.5)] transition-all active:scale-[0.97] ${
                isSearching ? 'bg-slate-700' : 
                destination ? 'bg-primary text-white hover:brightness-110 shadow-primary/30' : 
                'bg-slate-800 text-slate-600'
              }`}
            >
              {isSearching ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : (
                <>
                  <span>Request Driver</span>
                  <span className="material-symbols-outlined text-3xl">trending_flat</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestRideScreen;
