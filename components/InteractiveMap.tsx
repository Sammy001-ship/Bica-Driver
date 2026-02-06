
import React, { useEffect, useRef } from 'react';

interface InteractiveMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    icon?: 'user' | 'taxi' | 'destination' | 'pickup';
    draggable?: boolean;
  }>;
  onMarkerDragEnd?: (id: string, newPos: [number, number]) => void;
  className?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  center = [6.5244, 3.3792], // Default to Lagos, Nigeria
  zoom = 13,
  markers = [],
  onMarkerDragEnd,
  className = ""
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize map
    const L = (window as any).L;
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true
    }).setView(center, zoom);

    // Add Dark Mode Tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when it changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const L = (window as any).L;
    
    markersLayerRef.current.clearLayers();

    markers.forEach(marker => {
      let icon;
      if (marker.icon === 'user' || marker.icon === 'pickup') {
        icon = L.divIcon({
          className: 'custom-div-icon',
          html: '<div class="custom-location-dot"></div>',
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });
      } else if (marker.icon === 'taxi') {
        icon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="bg-primary text-white p-1.5 rounded-full shadow-lg border-2 border-white animate-bounce">
                  <span class="material-symbols-outlined text-[16px] block">local_taxi</span>
                </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
      } else if (marker.icon === 'destination') {
        icon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="bg-white text-primary p-1 rounded-sm shadow-xl border-2 border-primary">
                  <span class="material-symbols-outlined text-[18px] block filled">location_on</span>
                </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 24]
        });
      }

      const m = L.marker(marker.position, { 
        icon: icon || L.Icon.Default,
        draggable: !!marker.draggable
      })
      .bindPopup(marker.title)
      .addTo(markersLayerRef.current);

      if (marker.draggable && onMarkerDragEnd) {
        m.on('dragend', (event: any) => {
          const latlng = event.target.getLatLng();
          onMarkerDragEnd(marker.id, [latlng.lat, latlng.lng]);
        });
      }
    });
  }, [markers, onMarkerDragEnd]);

  return <div ref={mapContainerRef} className={`w-full h-full ${className}`} />;
};

export default InteractiveMap;
