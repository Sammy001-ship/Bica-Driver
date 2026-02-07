
import React, { useState, useEffect, useRef } from 'react';
import { IMAGES } from '../constants';
import InteractiveMap from '../components/InteractiveMap';
import { CapacitorService } from '../services/CapacitorService';
import { UserProfile } from '../types';

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
  destCoords: [number, number];
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
  }
];

type RidePhase = 'pickup' | 'arrived' | 'trip' | 'completed';

interface DriverMainScreenProps {
  user: UserProfile | null;
  onOpenProfile: () => void;
  onBack: () => void;
}

const DriverMainScreen: React.FC<DriverMainScreenProps> = ({ user, onOpenProfile, onBack }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  const [ridePhase, setRidePhase] = useState<RidePhase>('pickup');
  const [driverPos, setDriverPos] = useState<[number, number]>([6.4549, 3.3896]);
  const trackingInterval = useRef<any>(null);

  const approvalStatus = user?.approvalStatus || 'PENDING';

  useEffect(() => {
    if (isOnline && ridePhase !== 'completed' && approvalStatus === 'APPROVED') {
      const updateLocation = async () => {
        const pos = await CapacitorService.getCurrentLocation();
        if (pos) setDriverPos([pos.coords.latitude, pos.coords.longitude]);
      };
      updateLocation();
      trackingInterval.current = setInterval(updateLocation, 10000);
    }
    return () => clearInterval(trackingInterval.current);
  }, [isOnline, ridePhase, approvalStatus]);

  if (approvalStatus === 'PENDING') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-8 bg-background-dark text-center gap-6">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-soft-pulse">
           <span className="material-symbols-outlined text-primary text-5xl">manage_search</span>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-white">Verification Pending</h2>
          <p className="text-slate-400 font-medium">Your application is currently being reviewed by our administration team. This usually takes 24-48 hours.</p>
        </div>
        <div className="w-full space-y-4 pt-6">
           <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left flex items-start gap-4">
              <span className="material-symbols-outlined text-green-500">check_circle</span>
              <div>
                 <p className="text-sm font-bold text-white">Documentation Received</p>
                 <p className="text-xs text-slate-500">Your license and selfie have been securely uploaded.</p>
              </div>
           </div>
           <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left flex items-start gap-4 opacity-50">
              <span className="material-symbols-outlined text-slate-500">pending</span>
              <div>
                 <p className="text-sm font-bold text-white">Manual Review</p>
                 <p className="text-xs text-slate-500">Our team is verifying your credentials.</p>
              </div>
           </div>
        </div>
        <button 
          onClick={onBack}
          className="mt-6 w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all active:scale-95"
        >
          Logout & Wait
        </button>
      </div>
    );
  }

  if (approvalStatus === 'REJECTED') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-8 bg-background-dark text-center gap-6">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center">
           <span className="material-symbols-outlined text-red-500 text-5xl">cancel</span>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-white">Application Rejected</h2>
          <p className="text-slate-400 font-medium">Unfortunately, your driver application does not meet our current requirements. Please contact support for more details.</p>
        </div>
        <button 
          onClick={onBack}
          className="mt-6 w-full py-4 rounded-xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all"
        >
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col relative bg-background-dark font-display">
      <div className="absolute inset-0 z-0">
        <InteractiveMap center={driverPos} markers={[{ position: driverPos, title: 'You', icon: 'taxi' }]} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#101622]/40 via-transparent to-[#101622]/90 pointer-events-none"></div>
      </div>

      <div className="relative z-10 p-4 pt-8 bg-gradient-to-b from-background-dark/90 to-transparent flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="bg-surface-dark/80 backdrop-blur-md text-white flex size-10 items-center justify-center rounded-full shadow-lg active:scale-90 transition-all">
            <span className="material-symbols-outlined">logout</span>
          </button>
          
          <div onClick={() => setIsOnline(!isOnline)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10 cursor-pointer transition-all ${isOnline ? 'bg-primary/90 text-white' : 'bg-surface-dark/80 text-slate-400'}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></div>
            <span className="text-sm font-bold tracking-tight uppercase">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          <button onClick={onOpenProfile} className="bg-surface-dark/80 backdrop-blur-md text-white flex size-10 items-center justify-center rounded-full shadow-lg active:scale-90 transition-all">
            <span className="material-symbols-outlined">person</span>
          </button>
        </div>
      </div>

      <div className="flex-1"></div>

      <div className="relative z-20 w-full bg-surface-dark rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.6)] flex flex-col border-t border-white/5">
        <div className="p-6 pt-2 pb-10 flex flex-col gap-5">
           <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-white">Live Radar</h3>
                <p className="text-slate-400 text-xs font-medium">Found 1 job nearby</p>
              </div>
              <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></div>
                <span className="text-primary text-[10px] font-black uppercase tracking-widest">Active</span>
              </div>
           </div>
           
           {MOCK_REQUESTS.map(req => (
              <div key={req.id} className="bg-input-dark/40 p-5 rounded-3xl border border-white/5 flex flex-col gap-4 shadow-lg animate-slide-up">
                 <div className="flex items-center gap-4">
                    <img src={req.avatar} className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5" alt="" />
                    <div className="flex-1">
                       <h4 className="font-bold text-white text-base leading-tight">{req.ownerName}</h4>
                       <p className="text-slate-500 text-xs mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">map</span>{req.pickup}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-white text-lg leading-none">₦{req.price}</p>
                       <p className="text-primary text-[10px] font-bold mt-1.5">{req.time} away</p>
                    </div>
                 </div>
                 <button onClick={() => alert("Job Accepted!")} className="w-full bg-primary text-white font-black py-4 rounded-2xl active:scale-[0.97] transition-all">Accept Ride</button>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default DriverMainScreen;
