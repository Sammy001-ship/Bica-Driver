
import React from 'react';
import { IMAGES } from '../constants';

interface InteractiveMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    icon?: 'user' | 'taxi' | 'destination' | 'pickup' | 'smart' | 'nearby';
    draggable?: boolean;
  }>;
  onMarkerDragEnd?: (id: string, newPos: [number, number]) => void;
  onMapLoad?: (map: any) => void;
  className?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  center = [6.5244, 3.3792], 
  markers = [],
  className = ""
}) => {
  // Simple projection simulation for visual demo
  // We assume the center prop is the center of the screen
  // And we map offsets to pixels. 1 deg lat ~ 111km. 
  // Let's say 1000 pixels per degree for a zoomed in view.
  const SCALE = 8000; 

  return (
    <div className={`w-full h-full relative overflow-hidden bg-[#032e02] ${className}`}>
      {/* Background Map Image - Simulated as a large panning image */}
      <div 
        className="absolute inset-[-50%] w-[200%] h-[200%] opacity-40 pointer-events-none"
        style={{
           backgroundImage: `url(${IMAGES.MAP_BG})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           // subtle parallax/movement effect
           transform: `translate(${(center[1] * 50) % 10}px, ${(center[0] * 50) % 10}px)`
        }}
      />
      
      {/* Grid Overlay for tech feel */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Markers */}
      <div className="absolute inset-0 flex items-center justify-center">
        {markers.map((marker) => {
          // Calculate relative position from center
          const latDiff = marker.position[0] - center[0];
          const lngDiff = marker.position[1] - center[1];
          
          const y = -latDiff * SCALE; // Latitude goes up, screen Y goes down
          const x = lngDiff * SCALE;

          // Only render if reasonably close to be on screen
          if (Math.abs(x) > 500 || Math.abs(y) > 800) return null;

          return (
             <div 
               key={marker.id}
               className="absolute flex flex-col items-center justify-center transition-all duration-500 ease-out"
               style={{ transform: `translate(${x}px, ${y}px)` }}
             >
                {/* Marker Icon */}
                {marker.icon === 'user' && (
                  <div className="w-4 h-4 rounded-full bg-accent ring-4 ring-white shadow-lg animate-pulse" />
                )}
                {marker.icon === 'taxi' && (
                  <div className="bg-white p-1.5 rounded-full shadow-lg">
                    <span className="material-symbols-outlined text-black text-lg">local_taxi</span>
                  </div>
                )}
                {marker.icon === 'pickup' && (
                   <div className="relative">
                     <span className="material-symbols-outlined text-accent text-4xl drop-shadow-lg" style={{ transform: 'translateY(-12px)' }}>location_on</span>
                     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-1 bg-black/50 blur-[2px] rounded-full"></div>
                   </div>
                )}
                {marker.icon === 'destination' && (
                   <div className="relative">
                     <span className="material-symbols-outlined text-primary text-4xl drop-shadow-lg" style={{ transform: 'translateY(-12px)' }}>flag</span>
                     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-1 bg-black/50 blur-[2px] rounded-full"></div>
                   </div>
                )}
                {marker.icon === 'nearby' && (
                   <div className="w-2 h-2 rounded-full bg-white/50 backdrop-blur-sm shadow-sm" />
                )}

                {/* Marker Label */}
                {marker.title && marker.icon !== 'nearby' && (
                   <div className="absolute top-full mt-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 whitespace-nowrap z-10">
                      <span className="text-[10px] font-bold text-white">{marker.title}</span>
                   </div>
                )}
             </div>
          );
        })}
      </div>
      
      {/* Decorative center reticle */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
        <div className="w-64 h-64 rounded-full border border-white"></div>
        <div className="w-1 h-4 bg-white absolute"></div>
        <div className="w-4 h-1 bg-white absolute"></div>
      </div>
    </div>
  );
};

export default InteractiveMap;
