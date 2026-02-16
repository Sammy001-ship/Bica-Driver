
import React, { useState, useEffect, useRef } from 'react';
import { CapacitorService } from '../services/CapacitorService';
import { Config } from '../services/Config';
import { GoogleGenAI } from "@google/genai";
import InteractiveMap from '../components/InteractiveMap';
import { IMAGES } from '../constants';

interface SearchResult {
  id: string;
  display_name: string;
  description: string;
  lat: number;
  lon: number;
  category: 'LGA' | 'Airport' | 'Hotel' | 'Shopping' | 'Residential' | 'Commercial' | 'Tourism' | 'Education' | 'Transport' | 'District';
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

// Comprehensive Lagos Database with all 20 LGAs alphabetically
const LAGOS_LOCATIONS: SearchResult[] = [
  // Airports & Transport
  { id: 'lm_mmia', display_name: 'Murtala Muhammed Int. Airport (MMIA)', description: 'Ikeja, Lagos', lat: 6.5774, lon: 3.3210, category: 'Airport' },
  { id: 'lm_mma2', display_name: 'MMA2 Terminal', description: 'Ikeja, Lagos', lat: 6.5732, lon: 3.3338, category: 'Airport' },
  { id: 'lm_gigu', display_name: 'GIGM Jibowu Terminal', description: 'Yaba, Lagos', lat: 6.5255, lon: 3.3688, category: 'Transport' },
  
  // Lagos State LGAs (Alphabetical)
  { id: 'lga_agege', display_name: 'Agege', description: 'Lagos State LGA', lat: 6.6180, lon: 3.3209, category: 'LGA' },
  { id: 'lga_ajeromi', display_name: 'Ajeromi-Ifelodun', description: 'Lagos State LGA', lat: 6.4555, lon: 3.3339, category: 'LGA' },
  { id: 'lga_alimosho', display_name: 'Alimosho', description: 'Lagos State LGA', lat: 6.6094, lon: 3.2963, category: 'LGA' },
  { id: 'lga_amuwo', display_name: 'Amuwo-Odofin', description: 'Lagos State LGA', lat: 6.4667, lon: 3.2833, category: 'LGA' },
  { id: 'lga_apapa', display_name: 'Apapa', description: 'Lagos State LGA', lat: 6.4553, lon: 3.3641, category: 'LGA' },
  { id: 'lga_badagry', display_name: 'Badagry', description: 'Lagos State LGA', lat: 6.4316, lon: 2.8876, category: 'LGA' },
  { id: 'lga_epe', display_name: 'Epe', description: 'Lagos State LGA', lat: 6.5841, lon: 3.9754, category: 'LGA' },
  { id: 'lga_etiosa', display_name: 'Eti-Osa', description: 'Lagos State LGA', lat: 6.4478, lon: 3.4737, category: 'LGA' },
  { id: 'lga_ibeju', display_name: 'Ibeju-Lekki', description: 'Lagos State LGA', lat: 6.4667, lon: 3.6667, category: 'LGA' },
  { id: 'lga_ifako', display_name: 'Ifako-Ijaiye', description: 'Lagos State LGA', lat: 6.6575, lon: 3.3179, category: 'LGA' },
  { id: 'lga_ikeja', display_name: 'Ikeja', description: 'State Capital & LGA', lat: 6.6018, lon: 3.3515, category: 'LGA' },
  { id: 'lga_ikorodu', display_name: 'Ikorodu', description: 'Lagos State LGA', lat: 6.6191, lon: 3.5041, category: 'LGA' },
  { id: 'lga_kosofe', display_name: 'Kosofe', description: 'Lagos State LGA', lat: 6.5744, lon: 3.3853, category: 'LGA' },
  { id: 'lga_lagos_island', display_name: 'Lagos Island', description: 'Lagos State LGA', lat: 6.4549, lon: 3.4246, category: 'LGA' },
  { id: 'lga_lagos_mainland', display_name: 'Lagos Mainland', description: 'Lagos State LGA', lat: 6.5059, lon: 3.3764, category: 'LGA' },
  { id: 'lga_mushin', display_name: 'Mushin', description: 'Lagos State LGA', lat: 6.5273, lon: 3.3552, category: 'LGA' },
  { id: 'lga_ojo', display_name: 'Ojo', description: 'Lagos State LGA', lat: 6.4633, lon: 3.1678, category: 'LGA' },
  { id: 'lga_oshodi', display_name: 'Oshodi-Isolo', description: 'Lagos State LGA', lat: 6.5539, lon: 3.3364, category: 'LGA' },
  { id: 'lga_shomolu', display_name: 'Shomolu', description: 'Lagos State LGA', lat: 6.5392, lon: 3.3842, category: 'LGA' },
  { id: 'lga_surulere', display_name: 'Surulere', description: 'Lagos State LGA', lat: 6.4972, lon: 3.3542, category: 'LGA' },
  
  // Popular Districts & Landmarks
  { id: 'lm_lekki1', display_name: 'Lekki Phase 1', description: 'Eti-Osa', lat: 6.4478, lon: 3.4737, category: 'District' },
  { id: 'lm_vi', display_name: 'Victoria Island', description: 'Business District', lat: 6.4253, lon: 3.4308, category: 'District' },
  { id: 'lm_ikoyi', display_name: 'Ikoyi', description: 'Luxury District', lat: 6.4549, lon: 3.4246, category: 'District' },
  { id: 'lm_yaba', display_name: 'Yaba', description: 'Tech & Education Hub', lat: 6.5165, lon: 3.3853, category: 'District' },
  { id: 'lm_ajah', display_name: 'Ajah', description: 'Eti-Osa', lat: 6.4698, lon: 3.5852, category: 'District' },
  { id: 'lm_maryland', display_name: 'Maryland', description: 'Kosofe', lat: 6.5744, lon: 3.3653, category: 'District' },
  { id: 'lm_festac', display_name: 'Festac Town', description: 'Amuwo-Odofin', lat: 6.4667, lon: 3.2833, category: 'District' },

  // Landmarks & Commercial
  { id: 'lm_landmark', display_name: 'Landmark Beach', description: 'Water Corporation Dr, VI', lat: 6.4227, lon: 3.4437, category: 'Tourism' },
  { id: 'lm_icm', display_name: 'Ikeja City Mall', description: 'Alausa, Ikeja', lat: 6.6142, lon: 3.3581, category: 'Shopping' },
  { id: 'lm_palms', display_name: 'The Palms Shopping Mall', description: 'Lekki', lat: 6.4357, lon: 3.4418, category: 'Shopping' },
  { id: 'lm_eko_hotel', display_name: 'Eko Hotels & Suites', description: 'Adetokunbo Ademola, VI', lat: 6.4267, lon: 3.4301, category: 'Hotel' },
  { id: 'lm_civic', display_name: 'The Civic Centre', description: 'Ozumba Mbadiwe, VI', lat: 6.4316, lon: 3.4116, category: 'Commercial' },
  { id: 'lm_unilag', display_name: 'University of Lagos', description: 'Akoka, Yaba', lat: 6.5165, lon: 3.3964, category: 'Education' },
  { id: 'lm_banana', display_name: 'Banana Island', description: 'Ikoyi', lat: 6.4563, lon: 3.4503, category: 'Residential' },
  { id: 'lm_vgc', display_name: 'Victoria Garden City (VGC)', description: 'Lekki-Epe Expressway', lat: 6.4674, lon: 3.5612, category: 'Residential' },
  { id: 'lm_magodo', display_name: 'Magodo Phase 2', description: 'Shangisha', lat: 6.6080, lon: 3.3850, category: 'Residential' },
  { id: 'lm_allen', display_name: 'Allen Avenue', description: 'Ikeja', lat: 6.5985, lon: 3.3533, category: 'Commercial' },
  { id: 'lm_comp_village', display_name: 'Computer Village', description: 'Otigba St, Ikeja', lat: 6.5965, lon: 3.3421, category: 'Commercial' },
  { id: 'lm_national_theatre', display_name: 'National Arts Theatre', description: 'Iganmu', lat: 6.4789, lon: 3.3688, category: 'Tourism' },
  { id: 'lm_lufasi', display_name: 'Lufasi Nature Park', description: 'Lekki-Epe Expy', lat: 6.4833, lon: 3.6167, category: 'Tourism' },
  { id: 'lm_nike', display_name: 'Nike Art Gallery', description: 'Lekki Phase 1', lat: 6.4446, lon: 3.4864, category: 'Tourism' }
];

const MOCK_ASSIGNED_DRIVER = {
  name: "James Ola",
  rating: 4.8,
  trips: 1520,
  car: "Toyota Camry 2022",
  plate: "LND-823-XA",
  avatar: IMAGES.DRIVER_CARD
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
        setPickupLocation("Current Location");
      } else {
        // Fallback to Lagos center (Ikeja/Mainland)
        const fallback: [number, number] = [6.5244, 3.3792]; 
        setUserRealTimePos(fallback);
        setPickupCoords(fallback);
        setMapCenter(fallback);
        setPickupLocation("Lagos, Nigeria");
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

  // Updated Search Logic using local database
  const searchLocations = (query: string, field: 'pickup' | 'destination') => {
    if (!query) {
      // Show prioritized list: Popular Airports + LGAs
      const popular = LAGOS_LOCATIONS.filter(l => 
        l.category === 'Airport' || l.category === 'LGA' || l.display_name.includes('VI') || l.display_name.includes('Lekki')
      );
      // Sort so LGAs are alphabetical, but keep Airports at top
      const sorted = popular.sort((a, b) => {
         if (a.category === 'Airport' && b.category !== 'Airport') return -1;
         if (a.category !== 'Airport' && b.category === 'Airport') return 1;
         return a.display_name.localeCompare(b.display_name);
      });
      
      if (field === 'pickup') setPickupResults(sorted);
      else setDestResults(sorted);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = LAGOS_LOCATIONS.filter(loc => 
      loc.display_name.toLowerCase().includes(lowerQuery) || 
      loc.description.toLowerCase().includes(lowerQuery) ||
      loc.category.toLowerCase().includes(lowerQuery)
    ).sort((a, b) => a.display_name.localeCompare(b.display_name));

    if (field === 'pickup') setPickupResults(filtered);
    else setDestResults(filtered);
  };

  const handleInputChange = (val: string, field: 'pickup' | 'destination') => {
    if (field === 'pickup') {
      setPickupLocation(val);
      setIsTrackingLive(false);
    } else {
      setDestination(val);
    }
    setActiveSearchField(field);
    searchLocations(val, field);
  };

  const handleInputFocus = (field: 'pickup' | 'destination') => {
    setActiveSearchField(field);
    const currentVal = field === 'pickup' ? pickupLocation : destination;
    
    // If empty or default text, show instant popular locations
    if (!currentVal || currentVal === 'Acquiring location...' || currentVal === 'Current Location' || currentVal === 'Lagos, Nigeria') {
      // Show priority locations immediately
      searchLocations("", field);
    } else {
      searchLocations(currentVal, field);
    }
  };

  const selectResult = (res: SearchResult, field: 'pickup' | 'destination') => {
    const coords: [number, number] = [res.lat, res.lon];
    
    if (field === 'pickup') {
      setPickupLocation(res.display_name);
      setPickupCoords(coords);
      setPickupResults([]);
    } else {
      setDestination(res.display_name);
      setDestCoords(coords);
      setDestResults([]);
    }
    
    setMapCenter(coords);
    setActiveSearchField(null);
    CapacitorService.triggerHaptic();
    
    generateAiInsight(res.display_name);
  };

  const generateAiInsight = async (locationName: string) => {
    if (!Config.apiKey) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: Config.apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a short, 1-sentence elite travel tip or safety status for a premium chauffeur service heading to: ${locationName} in Lagos, Nigeria. Keep it professional, concise and luxury-focused.`,
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
      setPickupLocation("Pinned Location");
    } else {
      setDestCoords(newPos);
      setDestination("Pinned Location");
    }
  };

  const handleLocateMe = async () => {
    CapacitorService.triggerHaptic();
    setIsTrackingLive(true);
    if (userRealTimePos) {
      setMapCenter(userRealTimePos);
      setPickupCoords(userRealTimePos);
      setPickupLocation("Current Location");
    } else {
      // Refresh location if null
      const pos = await CapacitorService.getCurrentLocation();
      if (pos) {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserRealTimePos(coords);
        setMapCenter(coords);
        setPickupCoords(coords);
        setPickupLocation("Current Location");
      }
    }
  };

  const handleCategorySelect = (categoryType: string) => {
    CapacitorService.triggerHaptic();
    setActiveCategory(categoryType);
    // Move map to a relevant location for category (Simulated)
    if (categoryType === 'airport') setMapCenter([6.5774, 3.3210]); // MMIA
    if (categoryType === 'lodging') setMapCenter([6.4267, 3.4301]); // Eko Hotel
    if (categoryType === 'shopping_mall') setMapCenter([6.4357, 3.4418]); // Palms
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
    console.log(`Submitted Rating: ${rating}, Feedback: ${feedbackText}`);
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
  
  if (rideState === 'ASSIGNED' || rideState === 'IN_PROGRESS') {
    mapMarkers.push({
      id: 'driver',
      position: pickupCoords || [6.5, 3.3], // Simulating driver at pickup
      title: 'Your Chauffeur',
      icon: 'taxi'
    });
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Airport': return 'flight';
      case 'Hotel': return 'hotel';
      case 'Shopping': return 'shopping_bag';
      case 'Education': return 'school';
      case 'Tourism': return 'attractions';
      case 'LGA': return 'map';
      case 'District': return 'location_city';
      case 'Residential': return 'home';
      case 'Transport': return 'directions_bus';
      default: return 'place';
    }
  };

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
                    onFocus={() => handleInputFocus('pickup')}
                    onBlur={() => setTimeout(() => { if(!activeSearchField) setActiveSearchField(null) }, 200)} // Delay hide to allow click
                  />
                  <div className="size-12 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">search</span>
                  </div>
                </div>
                {activeSearchField === 'pickup' && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-surface-dark rounded-3xl border border-white/10 shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto no-scrollbar animate-slide-up">
                    {pickupResults.length > 0 ? (
                      <>
                        <div className="px-4 py-2 bg-black/20 text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                          {pickupLocation.length < 2 ? 'Popular Locations' : 'Search Results'}
                        </div>
                        {pickupResults.map(res => (
                          <button key={res.id} onClick={() => selectResult(res, 'pickup')} className="w-full p-4 text-left border-b border-white/5 hover:bg-primary/20 flex items-center gap-3 group transition-all">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-accent">
                              <span className="material-symbols-outlined text-sm">{getCategoryIcon(res.category)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white font-bold text-sm group-hover:text-accent">{res.display_name}</span>
                              <span className="text-slate-500 text-[10px] truncate">{res.description}</span>
                            </div>
                            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">{res.category}</span>
                          </button>
                        ))}
                      </>
                    ) : (
                       <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                         <span className="material-symbols-outlined text-2xl opacity-50">wrong_location</span>
                         No locations found
                       </div>
                    )}
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
                    onFocus={() => handleInputFocus('destination')}
                    onBlur={() => setTimeout(() => { if(!activeSearchField) setActiveSearchField(null) }, 200)}
                  />
                  <div className="size-12 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">search</span>
                  </div>
                </div>
                {activeSearchField === 'destination' && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-surface-dark rounded-3xl border border-white/10 shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto no-scrollbar animate-slide-up">
                    {destResults.length > 0 ? (
                      <>
                        <div className="px-4 py-2 bg-black/20 text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                          {destination.length < 2 ? 'Popular Locations' : 'Search Results'}
                        </div>
                        {destResults.map(res => (
                          <button key={res.id} onClick={() => selectResult(res, 'destination')} className="w-full p-4 text-left border-b border-white/5 hover:bg-primary/20 flex items-center gap-3 group transition-all">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-accent">
                              <span className="material-symbols-outlined text-sm">{getCategoryIcon(res.category)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white font-bold text-sm group-hover:text-accent">{res.display_name}</span>
                              <span className="text-slate-500 text-[10px] truncate">{res.description}</span>
                            </div>
                            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">{res.category}</span>
                          </button>
                        ))}
                      </>
                    ) : (
                       <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                         <span className="material-symbols-outlined text-2xl opacity-50">wrong_location</span>
                         No locations found
                       </div>
                    )}
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
