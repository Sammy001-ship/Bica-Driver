
import React, { useState, useEffect, useRef } from 'react';
import { IMAGES } from '../constants';
import InteractiveMap from '../components/InteractiveMap';
import { CapacitorService } from '../services/CapacitorService';

interface RideRequest {
  id: string;
  ownerName: string;
  pickup: string;
  destination: string;
  distance: string;
  price: string;
  time: string;
  avatar: string;
  coords: [number, number];
  destCoords: [number, number]; // Added destination coordinates
}

const MOCK_REQUESTS: RideRequest[] = [
  {
    id: '1',
    ownerName: 'Sarah Johnson',
    pickup: 'Lekki Phase 1, Lagos',
    destination: 'Ikeja City Mall, Ikeja',
    distance: '15.5 km',
    price: '12,500',
    time: '5 mins',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    coords: [6.4478, 3.4737],
    destCoords: [6.5913, 3.3506]
  },
  {
    id: '2',
    ownerName: 'Michael Chen',
    pickup: 'Victoria Island, Lagos',
    destination: 'Eko Hotel, VI',
    distance: '2.8 km',
    price: '5,000',
    time: '2 mins',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    coords: [6.4311, 3.4158],
    destCoords: [6.4253, 3.4411]
  }
];

type RidePhase = 'pickup' | 'arrived' | 'trip' | 'completed';

interface DriverMainScreenProps {
  onOpenProfile: () => void;
  onBack: () => void;
}

const DriverMainScreen: React.FC<DriverMainScreenProps> = ({ onOpenProfile, onBack }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  const [ridePhase, setRidePhase] = useState<RidePhase>('pickup');
  const [driverPos, setDriverPos] = useState<[number, number]>([6.4549, 3.3896]); // Default Lagos
  const trackingInterval = useRef<any>(null);

  const updateLocation = async () => {
    try {
      const pos = await CapacitorService.getCurrentLocation();
      if (pos) {
        setDriverPos([pos.coords.latitude, pos.coords.longitude]);
      }
    } catch (error) {
      console.error("Failed to fetch driver location:", error);
    }
  };

  useEffect(() => {
    // Only track if online AND trip is not completed
    if (isOnline && ridePhase !== 'completed') {
      updateLocation();
      trackingInterval.current = setInterval(updateLocation, 10000);
    } else {
      if (trackingInterval.current) {
        clearInterval(trackingInterval.current);
      }
    }

    return () => {
      if (trackingInterval.current) {
        clearInterval(trackingInterval.current);
      }
    };
  }, [isOnline, ridePhase]);

  const handleAcceptRide = (ride: RideRequest) => {
    CapacitorService.triggerHaptic();
    setActiveRide(ride);
    setRidePhase('pickup');
  };

  const handleCancelRide = () => {
    CapacitorService.triggerHaptic();
    if (confirm("Are you sure you want to cancel this ride? This may affect your rating.")) {
      setActiveRide(null);
      setRidePhase('pickup');
    }
  };

  const handleNextPhase = () => {
    CapacitorService.triggerHaptic();
    if (ridePhase === 'pickup') {
      setRidePhase('arrived');
    } else if (ridePhase === 'arrived') {
      setRidePhase('trip');
    } else if (ridePhase === 'trip') {
      setRidePhase('completed');
    }
  };

  const handleNavigate = () => {
    CapacitorService.triggerHaptic();
    if (!activeRide) return;
    const dest = ridePhase === 'pickup' || ridePhase === 'arrived' ? activeRide.pickup : activeRide.destination;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const resetAfterTrip = () => {
    CapacitorService.triggerHaptic();
    setActiveRide(null);
    setRidePhase('pickup');
  };

  // Prepare map markers
  const mapMarkers: any[] = [{ 
    position: driverPos, 
    title: 'Your Live Location', 
    icon: 'taxi' 
  }];

  if (isOnline && !activeRide) {
    MOCK_REQUESTS.forEach(req => {
      mapMarkers.push({ position: req.coords, title: `${req.ownerName} - Pickup`, icon: 'user' });
    });
  } else if (activeRide && ridePhase !== 'completed') {
    if (ridePhase === 'pickup' || ridePhase === 'arrived') {
      mapMarkers.push({ position: activeRide.coords, title: 'Pickup Point', icon: 'user' });
    } else if (ridePhase === 'trip') {
      mapMarkers.push({ position: activeRide.destCoords, title: 'Drop-off Point', icon: 'user' });
    }
  }

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col relative bg-background-dark font-display">
      {/* Interactive Map */}
      <div className="absolute inset-0 z-0">
        <InteractiveMap 
          center={driverPos} 
          markers={mapMarkers} 
          zoom={activeRide ? 16 : 14} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#101622]/40 via-transparent to-[#101622]/90 pointer-events-none"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 pt-8 bg-gradient-to-b from-background-dark/90 to-transparent flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="bg-surface-dark/80 backdrop-blur-md text-white flex size-10 items-center justify-center rounded-full shadow-lg active:scale-90 transition-all hover:bg-surface-dark"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          
          <div 
            onClick={() => {
              CapacitorService.triggerHaptic();
              setIsOnline(!isOnline);
            }} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10 cursor-pointer transition-all duration-300 shadow-xl ${
              isOnline ? 'bg-primary/90 text-white' : 'bg-surface-dark/80 text-slate-400'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]' : 'bg-slate-500'}`}></div>
            <span className="text-sm font-bold tracking-tight uppercase">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          <button 
            onClick={onOpenProfile} 
            className="bg-surface-dark/80 backdrop-blur-md text-white flex size-10 items-center justify-center rounded-full shadow-lg active:scale-90 transition-all hover:bg-surface-dark"
          >
            <span className="material-symbols-outlined">person</span>
          </button>
        </div>
      </div>

      <div className="flex-1"></div>

      {/* Action Drawer */}
      <div className="relative z-20 w-full bg-surface-dark rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.6)] flex flex-col max-h-[75vh] border-t border-white/5">
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-slate-700/50"></div>
        </div>
        
        <div className="p-6 pt-2 pb-10 flex flex-col gap-5 overflow-y-auto no-scrollbar">
          {!isOnline ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-5">
              <div className="bg-slate-800/50 p-6 rounded-full border border-white/5">
                <span className="material-symbols-outlined text-slate-500 text-[56px]">wifi_off</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">You are Currently Offline</h3>
              <button 
                onClick={() => setIsOnline(true)} 
                className="bg-primary hover:bg-primary/90 text-white font-bold px-10 py-4 rounded-2xl shadow-xl active:scale-95 transition-all w-full sm:w-auto"
              >
                Go Online Now
              </button>
            </div>
          ) : activeRide ? (
            ridePhase === 'completed' ? (
              <div className="flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                  <span className="material-symbols-outlined text-white text-[48px] filled">check_circle</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Trip Completed!</h3>
                  <p className="text-slate-400 text-sm mt-1">Excellent job. Your account will be credited shortly.</p>
                </div>
                
                <div className="w-full grid grid-cols-2 gap-4">
                  <div className="bg-input-dark/50 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Earnings</p>
                    <p className="text-xl font-black text-white">₦{activeRide.price}</p>
                  </div>
                  <div className="bg-input-dark/50 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Distance</p>
                    <p className="text-xl font-black text-white">{activeRide.distance}</p>
                  </div>
                </div>

                <button 
                  onClick={resetAfterTrip}
                  className="w-full bg-primary text-white font-black py-4.5 rounded-2xl shadow-xl active:scale-95 transition-all"
                >
                  Back to Dashboard
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-extrabold text-white tracking-tight">
                      {ridePhase === 'pickup' && 'Heading to Pickup'}
                      {ridePhase === 'arrived' && 'At Pickup Point'}
                      {ridePhase === 'trip' && 'On Trip to Destination'}
                    </h3>
                    <p className="text-primary text-xs font-bold uppercase tracking-widest mt-0.5">
                      {ridePhase === 'pickup' && 'Drive safely to owner'}
                      {ridePhase === 'arrived' && 'Waiting for passenger'}
                      {ridePhase === 'trip' && 'Navigating to drop-off'}
                    </p>
                  </div>
                  <div className="bg-green-500/10 text-green-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter border border-green-500/20">
                    {ridePhase === 'trip' ? 'ON TRIP' : 'LIVE'}
                  </div>
                </div>
                
                <div className="bg-input-dark/50 p-5 rounded-3xl border border-white/5 flex flex-col gap-4 shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={activeRide.avatar} className="w-14 h-14 rounded-full object-cover border-2 border-primary shadow-lg" />
                      <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-input-dark"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-white leading-tight">{activeRide.ownerName}</h4>
                      <p className="text-slate-400 text-xs flex items-center gap-1 mt-1 font-medium">
                        <span className="material-symbols-outlined text-[14px] filled text-yellow-500">star</span> 
                        4.8 Rated Owner
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary leading-none">₦{activeRide.price}</p>
                      <p className="text-slate-500 text-[9px] uppercase font-black tracking-widest mt-1">Est. Fare</p>
                    </div>
                  </div>

                  <div className="h-px bg-white/5 w-full"></div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <span className={`material-symbols-outlined text-[20px] mt-0.5 ${ridePhase === 'pickup' ? 'text-primary' : 'text-slate-500'}`}>location_on</span>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Pickup Address</p>
                        <p className={`text-sm font-bold line-clamp-1 ${ridePhase === 'pickup' ? 'text-white' : 'text-slate-400'}`}>{activeRide.pickup}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className={`material-symbols-outlined text-[20px] mt-0.5 ${ridePhase === 'trip' ? 'text-primary' : 'text-slate-500'}`}>flag</span>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Dropoff Address</p>
                        <p className={`text-sm font-bold line-clamp-1 ${ridePhase === 'trip' ? 'text-white' : 'text-slate-400'}`}>{activeRide.destination}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button 
                    onClick={handleNavigate} 
                    className="w-full bg-white hover:bg-slate-100 text-slate-900 font-black py-4.5 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-primary font-bold">near_me</span>
                    <span className="text-lg">Open in Navigation</span>
                  </button>
                  <div className="flex gap-4">
                    {ridePhase === 'pickup' && (
                      <button 
                        onClick={handleCancelRide} 
                        className="flex-1 bg-slate-800/80 hover:bg-slate-800 text-white font-bold py-4.5 rounded-2xl border border-white/5 transition-all active:scale-[0.98]"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      onClick={handleNextPhase} 
                      className={`flex-1 ${ridePhase === 'trip' ? 'bg-red-500' : 'bg-primary'} hover:brightness-110 text-white font-black py-4.5 rounded-2xl shadow-xl transition-all active:scale-[0.98]`}
                    >
                      {ridePhase === 'pickup' && "I've Arrived"}
                      {ridePhase === 'arrived' && "Start Trip"}
                      {ridePhase === 'trip' && "Complete Trip"}
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">Available Jobs</h3>
                  <p className="text-slate-400 text-xs font-medium">Accept a request to start earning</p>
                </div>
                <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></div>
                  <span className="text-primary text-[10px] font-black uppercase tracking-widest">Live Radar</span>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {MOCK_REQUESTS.map((request) => (
                  <div 
                    key={request.id} 
                    className="bg-input-dark/40 p-5 rounded-3xl border border-white/5 flex flex-col gap-4 hover:border-primary/40 transition-all group shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <img src={request.avatar} className="w-12 h-12 rounded-full object-cover bg-slate-800 ring-2 ring-white/5" alt={request.ownerName} />
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-base leading-tight group-hover:text-primary transition-colors">{request.ownerName}</h4>
                        <p className="text-slate-500 text-xs font-medium truncate max-w-[160px] mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">map</span>
                          {request.pickup}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-white text-lg leading-none">₦{request.price}</p>
                        <p className="text-primary text-[10px] font-bold mt-1.5">{request.time} away</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium px-1">
                      <span className="material-symbols-outlined text-[16px]">distance</span>
                      <span>{request.distance} total trip distance</span>
                    </div>
                    <button 
                      onClick={() => handleAcceptRide(request)} 
                      className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl transition-all active:scale-[0.97] shadow-lg shadow-primary/10"
                    >
                      Accept Ride
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverMainScreen;
