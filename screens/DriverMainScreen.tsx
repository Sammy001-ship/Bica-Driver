
import React, { useState } from 'react';
import { IMAGES } from '../constants';

interface RideRequest {
  id: string;
  ownerName: string;
  pickup: string;
  destination: string;
  distance: string;
  price: string;
  time: string;
  avatar: string;
}

const MOCK_REQUESTS: RideRequest[] = [
  {
    id: '1',
    ownerName: 'Sarah Johnson',
    pickup: 'Lekki Phase 1, Lagos',
    destination: 'Ikeja City Mall, Ikeja',
    distance: '2.5 km away',
    price: '₦12,500',
    time: '5 mins',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
  },
  {
    id: '2',
    ownerName: 'Michael Chen',
    pickup: 'Victoria Island, Lagos',
    destination: 'Eko Hotel, VI',
    distance: '0.8 km away',
    price: '₦5,000',
    time: '2 mins',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
  }
];

interface DriverMainScreenProps {
  onOpenProfile: () => void;
  onBack: () => void;
}

const DriverMainScreen: React.FC<DriverMainScreenProps> = ({ onOpenProfile, onBack }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);

  const handleAcceptRide = (ride: RideRequest) => {
    setActiveRide(ride);
  };

  const handleCancelRide = () => {
    if (confirm("Are you sure you want to cancel this ride? This may affect your rating.")) {
      setActiveRide(null);
    }
  };

  const handleNavigate = () => {
    if (!activeRide) return;
    
    // Construct Google Maps Directions URL
    const origin = encodeURIComponent(activeRide.pickup);
    const destination = encodeURIComponent(activeRide.destination);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    
    window.open(url, '_blank');
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
          <div className="absolute inset-0 bg-[#101622]/50 backdrop-grayscale-[0.5]"></div>
          
          {/* Driver Location Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className={`p-2 rounded-full ${isOnline ? 'bg-primary/20 animate-pulse' : 'bg-slate-500/20'}`}>
              <div className={`${isOnline ? 'bg-primary' : 'bg-slate-500'} text-white p-2 rounded-full shadow-lg`}>
                <span className="material-symbols-outlined text-[24px]">navigation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Header */}
      <div className="relative z-10 p-4 pt-8 bg-gradient-to-b from-background-dark/90 to-transparent flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="bg-surface-dark/80 backdrop-blur-md text-white flex size-10 items-center justify-center rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          
          {/* Status Toggle */}
          <div 
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 cursor-pointer transition-all duration-300 ${isOnline ? 'bg-primary/90 text-white' : 'bg-surface-dark/80 text-slate-400'}`}
          >
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></div>
            <span className="text-sm font-bold tracking-tight uppercase">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          <button 
            onClick={onOpenProfile}
            className="bg-surface-dark/80 backdrop-blur-md text-white flex size-10 items-center justify-center rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">person</span>
          </button>
        </div>
      </div>

      <div className="flex-1"></div>

      {/* Bottom Sheet */}
      <div className="relative z-20 w-full bg-surface-dark rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.5)] flex flex-col max-h-[70vh]">
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-slate-700"></div>
        </div>
        
        <div className="p-6 pt-2 pb-8 flex flex-col gap-5 overflow-y-auto no-scrollbar">
          {!isOnline ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
              <div className="bg-slate-800 p-4 rounded-full">
                <span className="material-symbols-outlined text-slate-500 text-[48px]">no_accounts</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">You are offline</h3>
                <p className="text-slate-400 text-sm max-w-[220px] mx-auto">Go online to start receiving ride requests from nearby car owners.</p>
              </div>
              <button 
                onClick={() => setIsOnline(true)}
                className="bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-lg active:scale-95 transition-transform"
              >
                Go Online
              </button>
            </div>
          ) : activeRide ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Active Trip</h3>
                <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">In Progress</span>
              </div>
              
              <div className="bg-input-dark p-4 rounded-2xl border border-white/5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <img src={activeRide.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{activeRide.ownerName}</h4>
                    <p className="text-slate-400 text-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] filled text-yellow-500">star</span> 4.8 Owner
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{activeRide.price}</p>
                    <p className="text-slate-500 text-[10px] uppercase font-bold">Estimated</p>
                  </div>
                </div>

                <div className="flex gap-3">
                   <div className="flex flex-col items-center pt-1">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-primary shrink-0"></div>
                    <div className="w-0.5 h-10 bg-slate-700 my-0.5"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary shrink-0"></div>
                  </div>
                  <div className="flex flex-col gap-4 flex-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Pick-up</span>
                      <span className="text-sm font-medium text-white">{activeRide.pickup}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Destination</span>
                      <span className="text-sm font-medium text-white">{activeRide.destination}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleNavigate}
                  className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-primary">near_me</span>
                  <span>Navigate with Maps</span>
                </button>
                
                <div className="flex gap-3">
                  <button 
                    onClick={handleCancelRide}
                    className="flex-1 bg-slate-800 text-white font-bold py-4 rounded-xl active:scale-95 transition-transform"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => alert("Arrived at pickup location!")}
                    className="flex-[2] bg-primary text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform"
                  >
                    Confirm Arrival
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Nearby Requests</h3>
                <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase">Live Updates</span>
              </div>

              <div className="flex flex-col gap-4">
                {MOCK_REQUESTS.map((request) => (
                  <div key={request.id} className="bg-input-dark p-4 rounded-2xl border border-white/5 flex flex-col gap-4 hover:border-primary/30 transition-colors group">
                    <div className="flex items-center gap-3">
                      <img src={request.avatar} className="w-10 h-10 rounded-full object-cover bg-slate-700" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white">{request.ownerName}</h4>
                          <span className="text-slate-500 text-xs">• {request.distance}</span>
                        </div>
                        <p className="text-slate-400 text-xs truncate max-w-[180px]">Destination: {request.destination}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{request.price}</p>
                        <p className="text-slate-500 text-[10px]">{request.time} away</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAcceptRide(request)}
                      className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98]"
                    >
                      Accept Ride
                    </button>
                  </div>
                ))}

                {MOCK_REQUESTS.length === 0 && (
                  <div className="py-10 text-center text-slate-500 italic text-sm">
                    No active requests nearby. Hang tight!
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverMainScreen;
