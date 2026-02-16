
import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    L: any;
  }
}

interface InteractiveMapProps {
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number]; // [lat, lng]
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
  zoom = 13,
  markers = [],
  onMarkerDragEnd,
  className = ""
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const leafletLoaded = useRef(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return; // Prevent double init
    if (!window.L) {
      console.warn("Leaflet not loaded");
      return;
    }

    try {
      // Create Map
      map.current = window.L.map(mapContainer.current, {
        center: center,
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
        layers: []
      });

      // Add Dark Mode Tiles (CartoDB Dark Matter)
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        subdomains: 'abcd'
      }).addTo(map.current);

      leafletLoaded.current = true;

    } catch (e) {
      console.error("Error initializing Leaflet:", e);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update Map Center
  useEffect(() => {
    if (!map.current || !leafletLoaded.current) return;
    map.current.setView(center, zoom, { animate: true });
  }, [center[0], center[1], zoom]);

  // Update Markers
  useEffect(() => {
    if (!map.current || !window.L || !leafletLoaded.current) return;

    // 1. Remove markers that are no longer in props
    Object.keys(markersRef.current).forEach(id => {
      if (!markers.find(m => m.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // 2. Add or update markers
    markers.forEach(marker => {
      const { id, position, icon, draggable } = marker;
      const latLng = position; // Leaflet uses [lat, lng]

      if (markersRef.current[id]) {
        // Update existing
        markersRef.current[id].setLatLng(latLng);
        // Updating icon/draggable dynamically is complex in Leaflet, usually better to recreate if those change rarely
        // For simple position updates, setLatLng is sufficient.
      } else {
        // Create Icon HTML
        let html = '';
        if (icon === 'user') {
          html = `<div class="relative flex items-center justify-center w-6 h-6">
                    <div class="absolute w-full h-full bg-accent/40 rounded-full animate-ping"></div>
                    <div class="relative w-3 h-3 bg-accent border-2 border-white rounded-full shadow-lg"></div>
                  </div>`;
        } else if (icon === 'taxi') {
          html = `<div class="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-slate-100">
                    <span class="material-symbols-outlined text-black text-lg">local_taxi</span>
                  </div>`;
        } else if (icon === 'pickup') {
           html = `<div class="relative flex flex-col items-center justify-end h-10 w-10">
                    <span class="material-symbols-outlined text-accent text-4xl drop-shadow-lg leading-none" style="filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.5));">location_on</span>
                    <div class="absolute bottom-1 w-2 h-1 bg-black/50 blur-[1px] rounded-full"></div>
                   </div>`;
        } else if (icon === 'destination') {
           html = `<div class="relative flex flex-col items-center justify-end h-10 w-10">
                    <span class="material-symbols-outlined text-primary text-4xl drop-shadow-lg leading-none" style="filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.5));">flag</span>
                    <div class="absolute bottom-1 w-2 h-1 bg-black/50 blur-[1px] rounded-full"></div>
                   </div>`;
        } else if (icon === 'nearby') {
           html = `<div class="w-2.5 h-2.5 rounded-full bg-white shadow-sm border border-slate-300"></div>`;
        } else {
           html = `<div class="w-3 h-3 rounded-full bg-blue-500 border border-white"></div>`;
        }

        const customIcon = window.L.divIcon({
          className: 'custom-div-icon',
          html: html,
          iconSize: [30, 30],
          iconAnchor: [15, 30] // Center bottom usually, adjust based on icon
        });

        const newMarker = window.L.marker(latLng, {
          icon: customIcon,
          draggable: !!draggable
        }).addTo(map.current);

        if (draggable && onMarkerDragEnd) {
          newMarker.on('dragend', (e: any) => {
            const pos = e.target.getLatLng();
            onMarkerDragEnd(id, [pos.lat, pos.lng]);
          });
        }

        markersRef.current[id] = newMarker;
      }
    });

  }, [markers, onMarkerDragEnd]);

  return (
    <div className={`w-full h-full relative overflow-hidden bg-[#101622] ${className}`}>
      <div ref={mapContainer} className="absolute inset-0 w-full h-full z-0" />
      {!window.L && (
         <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50">
            <span className="material-symbols-outlined animate-spin mr-2">refresh</span> Loading Map...
         </div>
      )}
    </div>
  );
};

export default InteractiveMap;
