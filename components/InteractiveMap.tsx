
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
      attributionControl: false,
      scrollWheelZoom: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      zoomSnap: 0.1
    }).setView(center, zoom);

    // Dark Map Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
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
      mapInstanceRef.current.setView(center, zoom, {
        animate: true,
        pan: { duration: 1.5 },
        zoom: { animate: true }
      });
    }
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const L = (window as any).L;
    
    markersLayerRef.current.clearLayers();

    markers.forEach(marker => {
      let icon;
      if (marker.icon === 'user') {
        icon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-16 h-16 bg-accent/10 rounded-full animate-ping"></div>
              <div class="absolute w-10 h-10 bg-accent/20 rounded-full animate-soft-pulse"></div>
              <div class="z-10 w-4 h-4 bg-accent border-2 border-white rounded-full shadow-[0_0_15px_#f17606]"></div>
            </div>`,
          iconSize: [64, 64],
          iconAnchor: [32, 32]
        });
      } else if (marker.icon === 'pickup') {
        icon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="relative flex items-center justify-center">
                  <div class="absolute w-14 h-14 bg-accent/15 rounded-full animate-ping opacity-75"></div>
                  <div class="z-10 bg-surface-dark p-2.5 rounded-2xl border-2 border-accent flex items-center justify-center shadow-[0_15px_30px_rgba(241,118,6,0.5)]">
                    <div class="w-3.5 h-3.5 bg-accent rounded-full shadow-[0_0_8px_#f17606]"></div>
                  </div>
                </div>`,
          iconSize: [56, 56],
          iconAnchor: [28, 28]
        });
      } else if (marker.icon === 'taxi') {
        icon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="bg-primary text-white p-2.5 rounded-2xl shadow-2xl border-2 border-white/20 animate-bounce">
                  <span class="material-symbols-outlined text-[18px] block filled">local_taxi</span>
                </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
      } else if (marker.icon === 'destination') {
        icon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="bg-white text-primary p-2 rounded-xl shadow-2xl border-2 border-primary flex items-center justify-center">
                  <span class="material-symbols-outlined text-[24px] block filled">location_on</span>
                </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        });
      }

      const m = L.marker(marker.position, { 
        icon: icon || L.Icon.Default,
        draggable: !!marker.draggable
      })
      .bindPopup(`<div class="font-display font-black text-[12px] p-1 text-[#032e02] uppercase tracking-widest">${marker.title}</div>`, {
        closeButton: false,
        className: 'custom-map-popup'
      })
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
