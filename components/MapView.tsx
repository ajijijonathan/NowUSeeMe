
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { PlaceResult, Location, WeatherData } from '../types';

interface MapViewProps {
  places: PlaceResult[];
  userLocation: Location | null;
  weather: WeatherData | null;
}

const MapView: React.FC<MapViewProps> = ({ places, userLocation, weather }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create the map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      }).addTo(mapRef.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
      markersRef.current = L.layerGroup().addTo(mapRef.current);
    }

    const map = mapRef.current;
    const markers = markersRef.current;

    if (map && markers) {
      markers.clearLayers();
      const bounds: L.LatLngExpression[] = [];

      // Add user location with pulse animation
      if (userLocation) {
        const userIcon = L.divIcon({
          className: 'user-marker',
          html: `<div class="w-5 h-5 bg-blue-500 border-2 border-white rounded-full shadow-xl user-location-pulse"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
          .addTo(markers)
          .bindPopup('<div class="p-1 font-bold text-slate-800">You are here</div>');
        bounds.push([userLocation.latitude, userLocation.longitude]);
      }

      // Add places
      places.forEach((place) => {
        if (place.lat && place.lng) {
          const markerIcon = L.divIcon({
            className: 'place-marker',
            html: `
              <div class="relative group">
                <div class="flex items-center justify-center w-9 h-9 ${place.isPromoted ? 'bg-indigo-600' : 'bg-slate-900'} text-white rounded-full shadow-2xl border-2 border-white transition-all group-hover:scale-110">
                  <span class="text-sm">${place.isPromoted ? '⭐' : '📍'}</span>
                </div>
                ${place.isPromoted ? '<div class="absolute -inset-1.5 bg-indigo-500 rounded-full animate-pulse opacity-20"></div>' : ''}
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18]
          });

          L.marker([place.lat, place.lng], { icon: markerIcon })
            .addTo(markers)
            .bindPopup(`
              <div class="p-2 min-w-[140px]">
                <h4 class="font-bold text-slate-900 text-sm leading-tight">${place.title}</h4>
                ${place.isPromoted ? '<div class="mt-1 flex items-center"><span class="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">Promoted</span></div>' : ''}
                <div class="mt-3">
                  <a href="${place.uri}" target="_blank" rel="noopener noreferrer" class="block text-center bg-slate-900 text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-indigo-600 transition-colors">
                    Visit Business
                  </a>
                </div>
              </div>
            `);
          bounds.push([place.lat, place.lng]);
        }
      });

      // Fit bounds
      if (bounds.length > 0) {
        map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [60, 60], maxZoom: 16 });
      } else if (userLocation) {
        map.setView([userLocation.latitude, userLocation.longitude], 14);
      }
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [places, userLocation]);

  return (
    <div className="w-full h-[550px] border border-slate-200 shadow-xl bg-slate-100 rounded-[2rem] overflow-hidden relative group">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Weather Overlay - Increased Z-index for Leaflet compatibility */}
      {weather && (
        <div className="absolute top-6 right-6 z-[1001] glass-effect p-4 rounded-3xl shadow-2xl border border-white/60 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="flex items-center space-x-4">
            <div className="text-4xl filter drop-shadow-md">{weather.emoji}</div>
            <div>
              <div className="text-lg font-black text-slate-900 leading-none">{weather.temp}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{weather.condition}</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center text-slate-500">
            <span className="text-[11px] font-medium truncate max-w-[120px]">📍 {weather.locationName}</span>
          </div>
        </div>
      )}
      
      {/* Map Attribution Badge */}
      <div className="absolute bottom-4 left-4 z-[1001] bg-white/80 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 border border-white/50">
        LIVE INTERACTIVE MAP
      </div>
    </div>
  );
};

export default MapView;
