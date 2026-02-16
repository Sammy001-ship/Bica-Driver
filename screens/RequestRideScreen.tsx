import React, { useState, useEffect, useRef } from 'react';
import { CapacitorService } from '../services/CapacitorService';
import { GoogleGenAI } from "@google/genai";
import InteractiveMap from '../components/InteractiveMap';
import { IMAGES } from '../constants';

interface SearchResult {
  display_name: string;
  lat: number;
  lon: number;
  id: string;
  description?: string;
}

interface NearbyPlace {
  id: string;
  name: string;
  vicinity: string;
  location: { lat: number; lng: number };
  distance: string;
  type: string;
}

interface RequestRideScreenProps {
  onOpenProfile: () => void;
  onBack: () => void;
}

type RideState = 'IDLE' | 'SEARCHING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';

const DISCOVERY_CATEGORIES = [
  { label: 'Airports', icon: 'flight_takeoff', type: 'airport' },
  { label: 'Hotels', icon: 'hotel', type: 'lodging' },
  { label: 'Dining', icon: 'restaurant', type: 'restaurant' },
  { label: 'Malls', icon: 'shopping_cart', type: 'shopping_mall' }
];

// Mock Data for Demo - Expanded Lagos Database
const MOCK_LAGOS_PLACES = [
  // Airports
  { id: '1', name: "Murtala Muhammed Intl Airport (MMIA)", vicinity: "Ikeja, Lagos", lat: 6.5774, lng: 3.3210, type: 'airport' },
  { id: '1b', name: "MMA2 Terminal", vicinity: "Ikeja, Lagos", lat: 6.5770, lng: 3.3200, type: 'airport' },
  
  // Island (VI, Lekki, Ikoyi)
  { id: '2', name: "Eko Hotels & Suites", vicinity: "Victoria Island, Lagos", lat: 6.4253, lng: 3.4308, type: 'lodging' },
  { id: '3', name: "Lekki Conservation Centre", vicinity: "Lekki-Epe Expy, Lagos", lat: 6.4417, lng: 3.5358, type: 'park' },
  { id: '5', name: "Landmark Beach", vicinity: "Water Corp Dr, VI", lat: 6.4217, lng: 3.4475, type: 'restaurant' },
  { id: '6', name: "Civic Center", vicinity: "Ozumba Mbadiwe Ave, VI", lat: 6.4357, lng: 3.4439, type: 'point_of_interest' },
  { id: '7', name: "Banana Island", vicinity: "Ikoyi, Lagos", lat: 6.4549, lng: 3.4246, type: 'point_of_interest' },
  { id: '8', name: "Ikoyi Club 1938", vicinity: "Ikoyi, Lagos", lat: 6.4490, lng: 3.4350, type: 'point_of_interest' },
  { id: '9', name: "The Palms Shopping Mall", vicinity: "Lekki, Lagos", lat: 6.4346, lng: 3.4471, type: 'shopping_mall' },
  { id: '10', name: "Radisson Blu Anchorage", vicinity: "Victoria Island", lat: 6.4340, lng: 3.4140, type: 'lodging' },
  { id: '10b', name: "Lekki Phase 1 Gate", vicinity: "Lekki, Lagos", lat: 6.4450, lng: 3.4600, type: 'point_of_interest' },
  { id: '10c', name: "Admiralty Way", vicinity: "Lekki Phase 1", lat: 6.4480, lng: 3.4700, type: 'point_of_interest' },
  { id: '10d', name: "Nike Art Gallery", vicinity: "Lekki, Lagos", lat: 6.4380, lng: 3.4800, type: 'point_of_interest' },

  // Mainland (Ikeja, Maryland, Magodo)
  { id: '4', name: "Ikeja City Mall", vicinity: "Alausa, Ikeja", lat: 6.6142, lng: 3.3581, type: 'shopping_mall' },
  { id: '11', name: "Maryland Mall", vicinity: "Maryland, Lagos", lat: 6.5720, lng: 3.3670, type: 'shopping_mall' },
  { id: '12', name: "Kalakuta Republic Museum", vicinity: "Ikeja, Lagos", lat: 6.6050, lng: 3.3500, type: 'point_of_interest' },
  { id: '13', name: "Magodo Phase 2", vicinity: "Magodo, Lagos", lat: 6.6200, lng: 3.3800, type: 'point_of_interest' },
  { id: '14', name: "Berger Bus Stop", vicinity: "Berger, Lagos", lat: 6.6400, lng: 3.3700, type: 'point_of_interest' },
  { id: '15', name: "Computer Village", vicinity: "Ikeja, Lagos", lat: 6.5960, lng: 3.3420, type: 'shopping_mall' },
  { id: '16', name: "Sheraton Lagos Hotel", vicinity: "Mobolaji Bank Anthony, Ikeja", lat: 6.5820, lng: 3.3620, type: 'lodging' },
  { id: '16b', name: "Allen Avenue", vicinity: "Ikeja, Lagos", lat: 6.6000, lng: 3.3500, type: 'point_of_interest' },

  // Yaba / Surulere
  { id: '17', name: "University of Lagos (UNILAG)", vicinity: "Akoka, Yaba", lat: 6.5170, lng: 3.3970, type: 'school' },
  { id: '18', name: "Yaba College of Technology", vicinity: "Yaba, Lagos", lat: 6.5200, lng: 3.3700, type: 'school' },
  { id: '19', name: "Tejuosho Market", vicinity: "Yaba, Lagos", lat: 6.5050, lng: 3.3650, type: 'shopping_mall' },
  { id: '20', name: "National Stadium", vicinity: "Surulere, Lagos", lat: 6.4970, lng: 3.3600, type: 'point_of_interest' },
  { id: '21', name: "Leisure Mall", vicinity: "Adeniran Ogunsanya, Surulere", lat: 6.4950, lng: 3.3550, type: 'shopping_mall' },
  { id: '22', name: "Teslim Balogun Stadium", vicinity: "Surulere, Lagos", lat: 6.4980, lng: 3.3620, type: 'point_of_interest' },
  { id: '22b', name: "Bode Thomas Street", vicinity: "Surulere, Lagos", lat: 6.4900, lng: 3.3500, type: 'point_of_interest' },

  // Greater Lagos
  { id: '23', name: "Oshodi Transport Interchange", vicinity: "Oshodi, Lagos", lat: 6.5550, lng: 3.3450, type: 'point_of_interest' },
  { id: '24', name: "Gbagada General Hospital", vicinity: "Gbagada, Lagos", lat: 6.5500, lng: 3.3900, type: 'hospital' },
  { id: '25', name: "Third Mainland Bridge", vicinity: "Lagos Lagoon", lat: 6.5300, lng: 3.4000, type: 'point_of_interest' },
  { id: '26', name: "Apapa Port", vicinity: "Apapa, Lagos", lat: 6.4400, lng: 3.3600, type: 'point_of_interest' },
  { id: '27', name: "Festac Town (First Gate)", vicinity: "Festac, Lagos", lat: 6.4700, lng: 3.2900, type: 'point_of_interest' },
  { id: '28', name: "Trade Fair Complex", vicinity: "Ojo, Lagos", lat: 6.4600, lng: 3.2500, type: 'shopping_mall' },
  { id: '29', name: "Synagogue Church (SCOAN)", vicinity: "Ikotun, Lagos", lat: 6.5400, lng: 3.2700, type: 'point_of_interest' },
  { id: '30', name: "Whispering Palms", vicinity: "Badagry, Lagos", lat: 6.4000, lng: 2.9000, type: 'lodging' },
  { id: '31', name: "Lufasi Nature Park", vicinity: "Lekki-Epe Expy", lat: 6.4700, lng: 3.6500, type: 'park' },
  { id: '32', name: "Novare Lekki Mall", vicinity: "Sangotedo, Lagos", lat: 6.4800, lng: 3.6200, type: 'shopping_mall' },
  { id: '33', name: "Jubilee Bridge", vicinity: "Ajah, Lagos", lat: 6.4650, lng: 3.5600, type: 'point_of_interest' }
];

const MOCK_ASSIGNED_DRIVER = {
  name: "James Ola",
  rating: 4.8,
  trips: 1520,
  car: "Toyota Camry 2022",
  plate: "LND-823-XA",
  avatar: IMAGES.DRIVER_CARD // Reusing existing image for demo
};

const RequestRideScreen: React.FC<RequestRideScreenProps> = ({ onOpenProfile, onBack }) => {
  const [rideType, setRideType] = useState<'now' | 'schedule'>('now');
  const [rideState, setRideState] = useState<RideState>('IDLE');
  const isSearching = rideState === 'SEARCHING';
  
  const [pickupLocation, setPickupLocation] = useState('Acquiring location...');
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [pickupResults, setPickupResults] = useState<SearchResult[]>([]);
  const [isTrackingLive, setIsTrackingLive] = useState(true);
  
  const [destination, setDestination] = useState('');
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [destResults, setDestResults] = useState<SearchResult[]>([]);
  
  const [nearbyResults, setNearbyResults] = useState<NearbyPlace[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const [activeSearchField, setActiveSearchField] = useState<'pickup' | 'destination' | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.5244, 3.3792]);
  const [userRealTimePos, setUserRealTimePos] = useState<[number, number] | null>(null);
  
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Rating State
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const initLocation = async () => {
      const pos = await CapacitorService.getCurrentLocation();
      if (pos) {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserRealTimePos(coords);
        setPickupCoords(coords);
        setMapCenter(coords);
        setPickupLocation("Current Location (Lagos)");
        fetchNearbyResults(coords[0], coords[1]);
      } else {
        // Fallback for demo if geolocation fails
        const fallback: [number, number] = [6.4253, 3.4308]; // Eko Hotel
        setUserRealTimePos(fallback);
        setPickupCoords(fallback);
        setMapCenter(fallback);
        setPickupLocation("Victoria Island, Lagos");
        fetchNearbyResults(fallback[0], fallback[1]);
      }

      if ("geolocation" in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition((p) => {
          const c: [number, number] = [p.coords.latitude, p.coords.longitude];
          setUserRealTimePos(c);
          if (isTrackingLive) {
            setPickupCoords(c);
            setMapCenter(c);
          }
        }, (error) => {
          console.warn("Watch position error:", error);
        }, { enableHighAccuracy: true });
      }
    };

    initLocation();

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const fetchNearbyResults = (lat: number, lng: number, type: string = 'point_of_interest') => {
    // Simulated nearby search
    const filtered = MOCK_LAGOS_PLACES.filter(p => type === 'point_of_interest' || p.type === type || (type === 'restaurant' && p.type === 'lodging')).slice(0, 5);
    
    const results: NearbyPlace[] = filtered.map(p => ({
      id: p.id,
      name: p.name,
      vicinity: p.vicinity,
      location: { lat: p.lat, lng: p.lng },
      distance: (Math.random() * 5 + 1).toFixed(1) + ' km',
      type: p.type
    }));
    setNearbyResults(results);
  };

  const handleInputChange = (val: string, field: 'pickup' | 'destination') => {
    if (field === 'pickup') {
      setPickupLocation(val);
      setIsTrackingLive(false);
    } else {
      setDestination(val);
    }
    setActiveSearchField(field);

    if (val.length > 1) {
       // Mock suggestions
       const suggestions = MOCK_LAGOS_PLACES.filter(p => p.name.toLowerCase().includes(val.toLowerCase()) || p.vicinity.toLowerCase().includes(val.toLowerCase()));
       const results: SearchResult[] = suggestions.map(p => ({
         display_name: p.name,
         description: p.vicinity,
         id: p.id,
         lat: p.lat,
         lon: p.lng
       }));
       if (field === 'pickup') setPickupResults(results);
       else setDestResults(results);
    } else {
       if (field === 'pickup') setPickupResults([]);
       else setDestResults([]);
    }
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
    
    fetchNearbyResults(coords[0], coords[1]);
    generateAiInsight(res.display_name);
  };

  const triggerManualSearch = (field: 'pickup' | 'destination') => {
    const val = field === 'pickup' ? pickupLocation : destination;
    setIsAiLoading(true);
    
    setTimeout(() => {
      setIsAiLoading(false);
      const matched = MOCK_LAGOS_PLACES.find(p => p.name.toLowerCase().includes(val.toLowerCase()));
      if (matched) {
        selectResult({
          display_name: matched.name,
          description: matched.vicinity,
          id: matched.id,
          lat: matched.lat,
          lon: matched.lng
        }, field);
      } else {
        const random = MOCK_LAGOS_PLACES[Math.floor(Math.random() * MOCK_LAGOS_PLACES.length)];
        selectResult({
          display_name: random.name,
          description: random.vicinity,
          id: random.id,
          lat: random.lat,
          lon: random.lng
        }, field);
        alert(`Exact location "${val}" not found in demo database. Snapped to ${random.name}.`);
      }
    }, 1000);
  };

  const generateAiInsight = async (locationName: string) => {
    if (!process.env.API_KEY) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a short, 1-sentence elite travel tip or safety status for a premium chauffeur service heading to: ${locationName} in Nigeria. Keep it professional and luxury-focused.`,
      });
      setAiInsight(response.text || "Direct route optimized for safety.");
    } catch (e) {
      setAiInsight("Premium route calculated.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleMarkerDragEnd = (id: string, newPos: [number, number]) => {
    CapacitorService.triggerHaptic();
    if (id === 'pickup') {
      setPickupCoords(newPos);
    } else {
      setDestCoords(newPos);
    }
  };

  const handleLocateMe = async () => {
    CapacitorService.triggerHaptic();
    setIsTrackingLive(true);
    if (userRealTimePos) {
      setMapCenter(userRealTimePos);
      setPickupCoords(userRealTimePos);
      setPickupLocation("Current Location");
      fetchNearbyResults(userRealTimePos[0], userRealTimePos[1]);
    }
  };

  const handleCategorySelect = (categoryType: string) => {
    CapacitorService.triggerHaptic();
    setActiveCategory(categoryType);
    const origin = pickupCoords || userRealTimePos;
    if (origin) {
      fetchNearbyResults(origin[0], origin[1], categoryType);
    }
  };

  const selectNearbyPlace = (place: NearbyPlace) => {
    setDestination(place.name);
    setDestCoords([place.location.lat, place.location.lng]);
    setMapCenter([place.location.lat, place.location.lng]);
    CapacitorService.triggerHaptic();
  };

  const isFormValid = () => {
    if (rideType === 'now') return !!destCoords;
    return !!destCoords && !!scheduledDate && !!scheduledTime;
  };

  const getFriendlyScheduleText = () => {
    if (!scheduledDate || !scheduledTime) return "Select preferred arrival window";
    const dateObj = new Date(`${scheduledDate}T${scheduledTime}`);
    return `Driver will arrive ${dateObj.toLocaleDateString()} at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const startRideSimulation = () => {
    setRideState('SEARCHING');
    
    // Simulate flow
    setTimeout(() => {
      setRideState('ASSIGNED');
    }, 2500);

    setTimeout(() => {
      setRideState('IN_PROGRESS');
    }, 6000);

    setTimeout(() => {
      setRideState('COMPLETED');
    }, 10000);
  };

  const handleSubmitRating = () => {
    // In a real app, send rating/feedback to backend here
    console.log(`Submitted Rating: ${rating}, Feedback: ${feedbackText}`);
    
    // Reset Flow
    setRating(0);
    setFeedbackText('');
    setDestination('');
    setDestCoords(null);
    setRideState('IDLE');
    setAiInsight(null);
  };

  const mapMarkers: any[] = [];
  if (userRealTimePos) mapMarkers.push({ id: 'live', position: userRealTimePos, title: 'Live Pulse', icon: 'user' });
  if (pickupCoords) mapMarkers.push({ id: 'pickup', position: pickupCoords, title: 'Direct Pickup', icon: 'pickup', draggable: rideState === 'IDLE' });
  if (destCoords) mapMarkers.push({ id: 'destination', position: destCoords, title: 'Direct Drop-off', icon: 'destination', draggable: rideState === 'IDLE' });
  
  if (rideState === 'IDLE') {
    nearbyResults.forEach(p => {
      mapMarkers.push({ 
        id: p.id, 
        position: [p.location.lat, p.location.lng], 
        title: p.name, 
        icon: 'nearby' 
      });
    });
  } else if (rideState === 'ASSIGNED' || rideState === 'IN_PROGRESS') {
    // Show driver marker simulation could be added here
    mapMarkers.push({
      id: 'driver',
      position: pickupCoords || [6.5, 3.3], // Simulating driver at pickup
      title: 'Your Chauffeur',
      icon: 'taxi'
    });
  }

  // Overlay for active ride states
  const renderRideStatusOverlay = () => {
    if (rideState === 'IDLE' || rideState === 'COMPLETED') return null;

    return (
      <div className="absolute inset-x-0 bottom-0 z-50 bg-surface-dark rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] border-t border-white/10 p-6 animate-slide-up">
        {rideState === 'SEARCHING' && (
          <div className="flex flex-col items-center py-10 gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <h3 className="text-xl font-bold text-white">Locating Chauffeur...</h3>
            <p className="text-slate-400 text-sm">Scanning premium network in Lagos</p>
          </div>
        )}

        {(rideState === 'ASSIGNED' || rideState === 'IN_PROGRESS') && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                 {rideState === 'ASSIGNED' ? 'Chauffeur En Route' : 'Trip In Progress'}
               </h3>
               <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-black uppercase animate-pulse">
                 {rideState === 'ASSIGNED' ? '2 mins away' : 'On Trip'}
               </span>
            </div>
            
            <div className="flex items-center gap-4">
              <img src={MOCK_ASSIGNED_DRIVER.avatar} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary" alt="Driver" />
              <div className="flex-1">
                <h4 className="text-xl font-black text-white">{MOCK_ASSIGNED_DRIVER.name}</h4>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="material-symbols-outlined text-yellow-500 text-sm filled">star</span>
                  <span>{MOCK_ASSIGNED_DRIVER.rating}</span>
                  <span>•</span>
                  <span>{MOCK_ASSIGNED_DRIVER.car}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="bg-white/10 px-2 py-1 rounded text-xs font-mono text-white mb-1">{MOCK_ASSIGNED_DRIVER.plate}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-white/5 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-bold hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined">call</span> Call
              </button>
              <button className="flex-1 bg-white/5 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-bold hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined">chat</span> Message
              </button>
            </div>
            
            {rideState === 'IN_PROGRESS' && (
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center gap-3">
                 <span className="material-symbols-outlined text-primary">security</span>
                 <p className="text-xs text-slate-300">Ride is being monitored by Bicadriver Security.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Feedback Modal
  const renderFeedbackModal = () => {
    if (rideState !== 'COMPLETED') return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
        <div className="w-full max-w-sm bg-surface-dark border border-white/10 rounded-[2.5rem] p-6 shadow-2xl animate-scale-in relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/30 blur-[50px] rounded-full pointer-events-none"></div>

          <div className="relative flex flex-col items-center text-center gap-4 pt-4">
            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-primary to-accent mb-2">
               <img src={MOCK_ASSIGNED_DRIVER.avatar} className="w-full h-full rounded-full object-cover border-4 border-surface-dark" alt="Driver" />
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-white">Ride Completed</h2>
              <p className="text-slate-400 text-sm mt-1">How was your trip with <span className="text-white font-bold">{MOCK_ASSIGNED_DRIVER.name}</span>?</p>
            </div>

            <div className="flex gap-2 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform active:scale-125 focus:outline-none"
                >
                  <span className={`material-symbols-outlined text-4xl ${rating >= star ? 'text-yellow-400 filled' : 'text-slate-600'}`}>
                    star
                  </span>
                </button>
              ))}
            </div>
            
            <textarea 
              className="w-full bg-input-dark border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 text-sm resize-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              rows={3}
              placeholder="Write a compliment or complaint..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />

            <button 
              onClick={handleSubmitRating}
              disabled={rating === 0}
              className={`w-full py-4 rounded-2xl font-black text-base uppercase tracking-widest mt-2 transition-all active:scale-[0.98] ${
                rating > 0 ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col relative bg-background-dark">
      <div className="absolute inset-0 z-0">
        <InteractiveMap 
          center={mapCenter} 
          markers={mapMarkers} 
          onMarkerDragEnd={handleMarkerDragEnd}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/40 via-transparent to-background-dark/95 pointer-events-none"></div>
      </div>

      <div className="relative z-30 flex items-center justify-between p-4 pt-10">
        <button onClick={onBack} className="bg-surface-dark/95 backdrop-blur-3xl text-white size-12 flex items-center justify-center rounded-2xl shadow-2xl border border-white/10 active:scale-90 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="bg-accent/10 backdrop-blur-xl border border-accent/30 px-4 py-2 rounded-full flex items-center gap-2 animate-fade-in shadow-xl">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
          <span className="text-[10px] font-black text-accent uppercase tracking-widest">Global Location Intel</span>
        </div>
        <button onClick={onOpenProfile} className="bg-surface-dark/95 backdrop-blur-3xl text-white size-12 flex items-center justify-center rounded-2xl shadow-2xl border border-white/10 active:scale-90 transition-all">
          <span className="material-symbols-outlined">person</span>
        </button>
      </div>

      <div className="flex-1"></div>

      {rideState === 'IDLE' && (
        <div className="relative z-30 p-4 flex justify-end">
          <button 
            onClick={handleLocateMe}
            className={`relative bg-white text-primary p-4 rounded-full shadow-2xl active:scale-90 transition-all ${isTrackingLive ? 'ring-4 ring-primary/40' : ''}`}
          >
            <span className={`material-symbols-outlined text-2xl ${isTrackingLive ? 'filled' : ''}`}>my_location</span>
          </button>
        </div>
      )}

      {/* Main Request Panel - Only visible when IDLE */}
      {rideState === 'IDLE' && (
        <div className="relative z-20 w-full bg-surface-dark rounded-t-[3.5rem] shadow-[0_-30px_80px_rgba(0,0,0,0.9)] border-t border-white/5 flex flex-col max-h-[85vh]">
          <div className="w-full flex justify-center py-5"><div className="h-1.5 w-16 rounded-full bg-slate-700/40"></div></div>
          
          <div className="px-7 pb-12 flex flex-col gap-6 overflow-y-auto no-scrollbar">
            <div className="flex p-1.5 bg-input-dark rounded-[2.5rem] border border-white/5 shadow-inner">
              <button onClick={() => setRideType('now')} className={`flex-1 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.15em] transition-all ${rideType === 'now' ? 'bg-primary text-white shadow-2xl scale-[1.02]' : 'text-slate-500 hover:text-slate-300'}`}>Ride Now</button>
              <button onClick={() => setRideType('schedule')} className={`flex-1 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.15em] transition-all ${rideType === 'schedule' ? 'bg-primary text-white shadow-2xl scale-[1.02]' : 'text-slate-500 hover:text-slate-300'}`}>Schedule</button>
            </div>

            {rideType === 'schedule' && (
              <div className="flex flex-col gap-4 animate-slide-up">
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" className="bg-input-dark rounded-3xl h-16 border-white/5 text-white font-bold color-scheme-dark px-4" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
                  <input type="time" className="bg-input-dark rounded-3xl h-16 border-white/5 text-white font-bold color-scheme-dark px-4" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} />
                </div>
                <p className="text-[11px] font-bold text-accent italic text-center">{getFriendlyScheduleText()}</p>
              </div>
            )}

            <div className="flex flex-col gap-6">
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Pickup</label>
                <div className="flex items-center bg-input-dark rounded-[1.75rem] border border-white/5 shadow-xl transition-all focus-within:ring-2 focus-within:ring-primary/40 pr-2">
                  <input 
                    className="w-full bg-transparent px-5 h-16 border-none text-white font-bold focus:ring-0 placeholder-slate-700"
                    placeholder="Where from?"
                    value={pickupLocation}
                    onChange={e => handleInputChange(e.target.value, 'pickup')}
                    onFocus={() => setActiveSearchField('pickup')}
                  />
                  <button 
                    onClick={() => triggerManualSearch('pickup')}
                    className="size-12 flex items-center justify-center rounded-2xl bg-accent text-white hover:bg-accent/80 active:scale-90 transition-all shrink-0 shadow-lg shadow-accent/20"
                    title="Search manual location"
                  >
                    <span className="material-symbols-outlined text-[20px]">search</span>
                  </button>
                </div>
                {activeSearchField === 'pickup' && pickupResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-surface-dark rounded-3xl border border-white/10 shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto no-scrollbar">
                    {pickupResults.map(res => (
                      <button key={res.id} onClick={() => selectResult(res, 'pickup')} className="w-full p-4 text-left border-b border-white/5 hover:bg-primary/20 flex flex-col group transition-all">
                        <span className="text-white font-bold text-sm group-hover:text-accent">{res.display_name}</span>
                        <span className="text-slate-500 text-[10px] truncate">{res.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Destination</label>
                <div className="flex items-center bg-input-dark rounded-[1.75rem] border border-white/5 shadow-xl transition-all focus-within:ring-2 focus-within:ring-primary/40 pr-2">
                  <input 
                    className="w-full bg-transparent px-5 h-16 border-none text-white font-bold focus:ring-0 placeholder-slate-700"
                    placeholder="Where to?"
                    value={destination}
                    onChange={e => handleInputChange(e.target.value, 'destination')}
                    onFocus={() => setActiveSearchField('destination')}
                  />
                  <button 
                    onClick={() => triggerManualSearch('destination')}
                    className="size-12 flex items-center justify-center rounded-2xl bg-accent text-white hover:bg-accent/80 active:scale-90 transition-all shrink-0 shadow-lg shadow-accent/20"
                    title="Search manual location"
                  >
                    <span className="material-symbols-outlined text-[20px]">search</span>
                  </button>
                </div>
                {activeSearchField === 'destination' && destResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-surface-dark rounded-3xl border border-white/10 shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto no-scrollbar">
                    {destResults.map(res => (
                      <button key={res.id} onClick={() => selectResult(res, 'destination')} className="w-full p-4 text-left border-b border-white/5 hover:bg-primary/20 flex flex-col group transition-all">
                        <span className="text-white font-bold text-sm group-hover:text-accent">{res.display_name}</span>
                        <span className="text-slate-500 text-[10px] truncate">{res.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Live Discovery</span>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {DISCOVERY_CATEGORIES.map((cat, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleCategorySelect(cat.type)} 
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all shrink-0 border ${
                      activeCategory === cat.type ? 'bg-accent/20 border-accent/50 text-accent' : 'bg-input-dark/60 border-white/5 text-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                    <span className="text-[11px] font-black uppercase">{cat.label}</span>
                  </button>
                ))}
              </div>

              {nearbyResults.length > 0 && (
                <div className="flex flex-col gap-3 mt-1 animate-fade-in">
                  {nearbyResults.map(place => (
                    <button 
                      key={place.id} 
                      onClick={() => selectNearbyPlace(place)}
                      className="flex items-center gap-4 bg-input-dark/30 p-4 rounded-2xl border border-white/5 hover:bg-primary/10 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
                        <span className="material-symbols-outlined">explore</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{place.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{place.vicinity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-black text-accent">{place.distance}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {aiInsight && !isAiLoading && (
              <div className="bg-primary/10 border border-primary/30 rounded-3xl p-5 flex gap-4 shadow-xl">
                <div className="shrink-0 p-2 bg-primary/20 rounded-xl h-fit">
                  <span className="material-symbols-outlined text-accent text-2xl filled">auto_awesome</span>
                </div>
                <p className="text-[12px] text-slate-300 font-bold italic leading-relaxed">{aiInsight}</p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-8">
              <div className="flex items-center justify-between px-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Elite Estimate</span>
                  <span className="text-[34px] font-black text-white tracking-tighter">₦15,000</span>
                </div>
                <div className="bg-input-dark/80 px-6 py-4 rounded-3xl border border-white/10 shadow-lg">
                  <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">VISA • 4288</span>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  CapacitorService.triggerHaptic();
                  startRideSimulation();
                }}
                disabled={!isFormValid() || isSearching}
                className={`w-full h-20 rounded-[2.25rem] font-black text-[17px] uppercase tracking-widest flex items-center justify-center gap-4 transition-all active:scale-[0.97] shadow-2xl ${
                  isFormValid() ? 'bg-primary text-white hover:brightness-110 shadow-primary/40' : 'bg-slate-800 text-slate-600 opacity-50'
                }`}
              >
                {isSearching ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : (
                  <>
                    <span>{rideType === 'now' ? 'Request Chauffeur' : 'Confirm Schedule'}</span>
                    <span className="material-symbols-outlined text-3xl">trending_flat</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {renderRideStatusOverlay()}
      {renderFeedbackModal()}

    </div>
  );
};

export default RequestRideScreen;