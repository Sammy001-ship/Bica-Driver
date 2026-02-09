
import React, { useEffect, useRef } from 'react';

interface InteractiveMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    icon?: 'user' | 'taxi' | 'destination' | 'pickup' | 'smart';
    draggable?: boolean;
  }>;
  onMarkerDragEnd?: (id: string, newPos: [number, number]) => void;
  className?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  center = [6.5244, 3.3792], 
  zoom = 15,
  markers = [],
  onMarkerDragEnd,
  className = ""
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true
    }).setView(center, zoom);

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

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom, { animate: true, duration: 1.0 });
    }
  }, [center]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const L = (window as any).L;
    
    markersLayerRef.current.clearLayers();

    markers.forEach(marker => {
      let icon;
      if (marker.icon === 'user') {
        icon = L.divIcon({
          className: 'custom-div-icon',
          html: '<div class="custom-location-dot"></div>',
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });
      } else if (marker.icon === 'pickup') {
        icon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="bg-primary/20 p-2 rounded-full border border-primary/50 flex items-center justify-center shadow-lg">
                  <div class="w-3 h-3 bg-primary rounded-full ring-2 ring-white"></div>
                </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
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
