
import React, { useState } from 'react';
import { IMAGES } from '../constants';

interface RequestRideScreenProps {
  onOpenProfile: () => void;
  onBack: () => void;
}

const RequestRideScreen: React.FC<RequestRideScreenProps> = ({ onOpenProfile, onBack }) => {
  const [rideType, setRideType] = useState<'now' | 'schedule'>('now');
  const [isSearching, setIsSearching] = useState(false);

  const handleFindDriver = () => {
    setIsSearching(true);
    // Simulate a search delay
    setTimeout(() => {
      setIsSearching(false);
      alert("Search initiated! Looking for the nearest available driver.");
    }, 2000);
  };

  const handleFeatureComingSoon = (feature: string) => {
    alert(`${feature} feature coming soon!`);
  };

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col relative bg-background-dark">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-slate-800 relative overflow-hidden">
          <img 
            alt="Dark themed map" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay" 
            src={IMAGES.MAP_BG}
          />
          <div className="absolute inset-0 bg-[#101622]/40 backdrop-grayscale-[0.5]"></div>
          
          {/* Mock Car Pin */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="bg-primary/20 p-2 rounded-full animate-pulse">
              <div className="bg-primary text-white p-2 rounded-full shadow-lg shadow-primary/40">
                <span className="material-symbols-outlined text-[24px]">local_taxi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Navigation */}
      <div className="relative z-10 flex items-center justify-between p-4 pt-8 pb-4 bg-gradient-to-b from-background-dark/90 to-transparent">
        <button 
          onClick={onBack}
          className="bg-surface-dark/80 backdrop-blur-md text-white flex size-10 items-center justify-center rounded-full shadow-lg hover:bg-surface-dark transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-white text-lg font-bold tracking-tight drop-shadow-md">Request a Driver</h2>
        <button 
          onClick={onOpenProfile}
          className="bg-surface-dark/80 backdrop-blur-md text-white flex size-10 items-center justify-center rounded-full shadow-lg hover:bg-surface-dark transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined">person</span>
        </button>
      </div>

      <div className="flex-1"></div>

      {/* Bottom Sheet */}
      <div className="relative z-20 w-full bg-surface-dark rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.4)] flex flex-col max-h-[85vh]">
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-slate-600"></div>
        </div>
        
        <div className="p-6 pt-2 pb-8 flex flex-col gap-6 overflow-y-auto no-scrollbar">
          {/* Segmented Control */}
          <div className="flex p-1 bg-input-dark rounded-xl">
            <button 
              onClick={() => setRideType('now')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                rideType === 'now' ? 'bg-primary text-white shadow-md' : 'text-slate-400'
              } active:scale-[0.98]`}
            >
              Ride Now
            </button>
            <button 
              onClick={() => setRideType('schedule')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                rideType === 'schedule' ? 'bg-primary text-white shadow-md' : 'text-slate-400'
              } active:scale-[0.98]`}
            >
              Schedule Later
            </button>
          </div>

          {/* Route Visualizer & Inputs */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center pt-4 pb-2">
              <div className="w-4 h-4 rounded-full border-2 border-primary bg-transparent shrink-0"></div>
              <div className="w-0.5 flex-1 bg-gradient-to-b from-primary to-slate-600 my-1 rounded-full"></div>
              <div className="w-4 h-4 rounded-sm bg-primary shrink-0"></div>
            </div>

            <div className="flex flex-col gap-4 flex-1">
              <div className="group relative">
                <label className="text-xs font-medium text-slate-400 mb-1 block pl-1">Pick-up Location</label>
                <div className="flex items-center bg-input-dark rounded-xl px-4 h-12 border border-transparent focus-within:border-primary/50 transition-colors">
                  <input 
                    className="bg-transparent border-none text-white placeholder-slate-500 text-sm font-medium w-full focus:ring-0 p-0" 
                    placeholder="Where are you?" 
                    type="text" 
                    defaultValue="Current Location"
                  />
                  <button onClick={() => handleFeatureComingSoon("GPS Detection")} className="active:scale-90">
                    <span className="material-symbols-outlined text-primary text-[20px] ml-2">my_location</span>
                  </button>
                </div>
              </div>

              <div className="group relative">
                <label className="text-xs font-medium text-slate-400 mb-1 block pl-1">Destination</label>
                <div className="flex items-center bg-input-dark rounded-xl px-4 h-12 border border-transparent focus-within:border-primary/50 transition-colors">
                  <input 
                    className="bg-transparent border-none text-white placeholder-slate-500 text-sm font-medium w-full focus:ring-0 p-0" 
                    placeholder="Enter destination" 
                    type="text" 
                  />
                  <span className="material-symbols-outlined text-slate-500 text-[20px] ml-2">search</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-700/50" />

          {/* Preferences */}
          <div className="flex flex-col gap-2">
            <span className="font-medium text-slate-300 text-sm">Preferences</span>
            <div className="bg-input-dark rounded-xl p-4 flex items-start gap-3 border border-transparent focus-within:border-primary/50 transition-colors">
              <span className="material-symbols-outlined text-slate-400 text-[20px] mt-0.5">edit_note</span>
              <textarea 
                className="bg-transparent border-none text-white placeholder-slate-500 text-sm font-medium w-full focus:ring-0 p-0 resize-none h-10 leading-relaxed" 
                placeholder="Add note for driver (e.g. child seat, luggage...)"
              />
            </div>
          </div>

          {/* Estimated Price & CTA */}
          <div className="mt-2 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Estimated Price</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">₦15,000</span>
                  <span className="text-sm font-medium text-slate-400">- ₦20,000</span>
                </div>
              </div>
              <div 
                onClick={() => handleFeatureComingSoon("Payment Selection")}
                className="flex items-center gap-2 bg-input-dark px-3 py-1.5 rounded-lg border border-slate-700/50 cursor-pointer hover:bg-slate-700/50 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-slate-400 text-[16px]">credit_card</span>
                <span className="text-xs font-semibold text-slate-300">Personal • 4288</span>
                <span className="material-symbols-outlined text-slate-500 text-[16px]">keyboard_arrow_down</span>
              </div>
            </div>
            
            <button 
              onClick={handleFindDriver}
              disabled={isSearching}
              className={`w-full ${isSearching ? 'bg-slate-600' : 'bg-primary hover:bg-blue-600 active:bg-blue-700'} text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]`}
            >
              {isSearching ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Find a Driver</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
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
