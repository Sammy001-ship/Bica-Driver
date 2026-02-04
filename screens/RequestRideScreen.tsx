
import React, { useState, useEffect } from 'react';
import { IMAGES } from '../constants';
import { CapacitorService } from '../services/CapacitorService';
import { GoogleGenAI } from "@google/genai";
import { Config } from '../services/Config';

interface RequestRideScreenProps {
  onOpenProfile: () => void;
  onBack: () => void;
}

const RequestRideScreen: React.FC<RequestRideScreenProps> = ({ onOpenProfile, onBack }) => {
  const [rideType, setRideType] = useState<'now' | 'schedule'>('now');
  const [isSearching, setIsSearching] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('Current Location');
  const [destination, setDestination] = useState('');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: ''
  });

  const isScheduleValid = rideType === 'now' || (scheduleData.date && scheduleData.time);

  const handleGetLocation = async () => {
    CapacitorService.triggerHaptic();
    setPickupLocation('Fetching location...');
    const pos = await CapacitorService.getCurrentLocation();
    if (pos) {
      setPickupLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
    } else {
      setPickupLocation('Location Error');
      setTimeout(() => setPickupLocation('Current Location'), 2000);
    }
  };

  const getAiInsight = async (dest: string) => {
    if (!dest || dest.length < 3 || !Config.apiKey) return;
    
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: Config.apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a very short (max 15 words) helpful travel tip or traffic insight for a car trip to: ${dest} in the context of Lagos, Nigeria. Be professional and concise.`,
      });
      setAiInsight(response.text || "Safe journey ahead!");
    } catch (error) {
      console.error("AI Insight Error:", error);
      setAiInsight(null);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (destination) getAiInsight(destination);
    }, 1200);
    return () => clearTimeout(timer);
  }, [destination]);

  const handleMainAction = () => {
    CapacitorService.triggerHaptic();
    
    if (rideType === 'schedule') {
      if (!scheduleData.date || !scheduleData.time) {
        alert("Please select both a date and time for your trip.");
        return;
      }
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
        alert(`Success! Your ride for ${scheduleData.date} at ${scheduleData.time} has been scheduled. We'll remind you 30 minutes before.`);
      }, 1500);
    } else {
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
        alert("Search initiated! We are connecting you with the nearest professional driver.");
      }, 2000);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col relative bg-background-dark">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-slate-800 relative overflow-hidden">
          <img 
            alt="Dark themed map" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay" 
            src={IMAGES.MAP_BG}
          />
          <div className="absolute inset-0 bg-[#101622]/40 backdrop-grayscale-[0.5]"></div>
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="bg-primary/20 p-2 rounded-full animate-pulse">
              <div className="bg-primary text-white p-2 rounded-full shadow-lg shadow-primary/40">
                <span className="material-symbols-outlined text-[24px]">local_taxi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between p-4 pt-8 pb-4 bg-gradient-to-b from-background-dark/90 to-transparent">
        <button 
          onClick={onBack}
          className="bg-surface-dark/80 backdrop-blur-md text-white flex size-10 items-center justify-center rounded-full shadow-lg hover:bg-surface-dark transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-white text-lg font-bold tracking-tight drop-shadow-md">Request a Driver</h2>
          {Config.isSandbox && <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Sandbox Mode</span>}
        </div>
        <button 
          onClick={onOpenProfile}
          className="bg-surface-dark/80 backdrop-blur-md text-white flex size-10 items-center justify-center rounded-full shadow-lg hover:bg-surface-dark transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined">person</span>
        </button>
      </div>

      <div className="flex-1"></div>

      <div className="relative z-20 w-full bg-surface-dark rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.4)] flex flex-col max-h-[90vh]">
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-slate-600"></div>
        </div>
        
        <div className="p-6 pt-2 pb-8 flex flex-col gap-6 overflow-y-auto no-scrollbar">
          <div className="flex p-1 bg-input-dark rounded-xl">
            <button 
              onClick={() => { CapacitorService.triggerHaptic(); setRideType('now'); }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                rideType === 'now' ? 'bg-primary text-white shadow-md' : 'text-slate-400'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              Ride Now
            </button>
            <button 
              onClick={() => { CapacitorService.triggerHaptic(); setRideType('schedule'); }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                rideType === 'schedule' ? 'bg-primary text-white shadow-md' : 'text-slate-400'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">event</span>
              Schedule
            </button>
          </div>

          {rideType === 'schedule' && (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
                <span className="text-sm font-bold text-white">Set Departure Time</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Date</label>
                  <div className="relative flex items-center bg-input-dark rounded-xl px-4 h-12 border border-slate-700/50 focus-within:border-primary/50 transition-colors">
                    <input 
                      className="bg-transparent border-none text-white text-sm font-medium w-full focus:ring-0 p-0 [color-scheme:dark]" 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={scheduleData.date}
                      onChange={(e) => setScheduleData({...scheduleData, date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Time</label>
                  <div className="relative flex items-center bg-input-dark rounded-xl px-4 h-12 border border-slate-700/50 focus-within:border-primary/50 transition-colors">
                    <input 
                      className="bg-transparent border-none text-white text-sm font-medium w-full focus:ring-0 p-0 [color-scheme:dark]" 
                      type="time" 
                      value={scheduleData.time}
                      onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              {scheduleData.date && scheduleData.time && (
                <p className="text-[11px] text-primary/80 font-medium italic">
                  Trip scheduled for {new Date(scheduleData.date).toLocaleDateString()} at {scheduleData.time}.
                </p>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex flex-col items-center pt-4 pb-2">
              <div className="w-4 h-4 rounded-full border-2 border-primary bg-transparent shrink-0"></div>
              <div className="w-0.5 flex-1 bg-gradient-to-b from-primary to-slate-600 my-1 rounded-full"></div>
              <div className="w-4 h-4 rounded-sm bg-primary shrink-0"></div>
            </div>

            <div className="flex flex-col gap-4 flex-1">
              <div className="group relative">
                <label className="text-xs font-medium text-slate-400 mb-1 block pl-1">Pick-up Location</label>
                <div className="flex items-center bg-input-dark rounded-xl px-4 h-12 border border-slate-700/50 focus-within:border-primary/50 transition-colors">
                  <input 
                    className="bg-transparent border-none text-white placeholder-slate-500 text-sm font-medium w-full focus:ring-0 p-0" 
                    placeholder="Where are you?" 
                    type="text" 
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                  />
                  <button onClick={handleGetLocation} className="active:scale-90 p-1">
                    <span className="material-symbols-outlined text-primary text-[20px]">my_location</span>
                  </button>
                </div>
              </div>

              <div className="group relative">
                <label className="text-xs font-medium text-slate-400 mb-1 block pl-1">Destination</label>
                <div className="flex items-center bg-input-dark rounded-xl px-4 h-12 border border-slate-700/50 focus-within:border-primary/50 transition-colors">
                  <input 
                    className="bg-transparent border-none text-white placeholder-slate-500 text-sm font-medium w-full focus:ring-0 p-0" 
                    placeholder="Enter destination" 
                    type="text" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                  <span className={`material-symbols-outlined text-[20px] ml-2 transition-colors ${isAiLoading ? 'text-primary animate-pulse' : 'text-slate-500'}`}>
                    {isAiLoading ? 'auto_awesome' : 'search'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {(aiInsight || isAiLoading) && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
              <span className={`material-symbols-outlined text-primary text-[20px] shrink-0 ${isAiLoading ? 'animate-spin' : ''}`}>
                {isAiLoading ? 'progress_activity' : 'auto_awesome'}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">AI Travel Insight</span>
                <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                  {isAiLoading ? "Analyzing destination..." : aiInsight}
                </p>
              </div>
            </div>
          )}

          <div className="mt-2 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Estimated Price</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">₦15,000</span>
                  <span className="text-sm font-medium text-slate-400">- ₦20,000</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-input-dark px-3 py-1.5 rounded-lg border border-slate-700/50 cursor-pointer hover:bg-slate-700/50 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-slate-400 text-[16px]">credit_card</span>
                <span className="text-xs font-semibold text-slate-300">Personal • 4288</span>
                <span className="material-symbols-outlined text-slate-500 text-[16px]">keyboard_arrow_down</span>
              </div>
            </div>
            
            <button 
              onClick={handleMainAction}
              disabled={isSearching || !isScheduleValid}
              className={`w-full ${isSearching ? 'bg-slate-600' : isScheduleValid ? 'bg-primary hover:bg-blue-600 active:bg-blue-700' : 'bg-slate-700 opacity-50 cursor-not-allowed'} text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]`}
            >
              {isSearching ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  <span>{rideType === 'now' ? 'Searching...' : 'Scheduling...'}</span>
                </>
              ) : (
                <>
                  <span>{rideType === 'now' ? 'Find a Driver' : 'Confirm Schedule'}</span>
                  <span className="material-symbols-outlined">{rideType === 'now' ? 'arrow_forward' : 'check_circle'}</span>
                </>
              )}
            </button>
            {!isScheduleValid && rideType === 'schedule' && (
              <p className="text-center text-[11px] text-red-400 font-medium">
                * Please select both date and time to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestRideScreen;
