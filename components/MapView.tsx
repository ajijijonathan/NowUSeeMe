
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { PlaceResult, Location, WeatherData, PlaceType, LanguageCode, TRANSLATIONS } from '../types';

interface MapViewProps {
  places: PlaceResult[];
  userLocation: Location | null;
  weather: WeatherData | null;
  language?: LanguageCode;
}

const MapView: React.FC<MapViewProps> = ({ places, userLocation, weather, language = 'en' }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const t = (key: string) => TRANSLATIONS[language][key] || key;

  const getMarkerColor = (type?: PlaceType, isPromoted?: boolean) => {
    if (isPromoted) return 'bg-indigo-600';
    switch (type) {
      case 'emergency': return 'bg-rose-600';
      case 'service': return 'bg-amber-600';
      case 'market': return 'bg-emerald-600';
      default: return 'bg-slate-800';
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, { zoomControl: false });
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

      if (userLocation) {
        const userIcon = L.divIcon({
          className: 'user-marker',
          html: `<div class="w-6 h-6 bg-blue-500 border-4 border-white rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] user-location-pulse"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon }).addTo(markers);
        bounds.push([userLocation.latitude, userLocation.longitude]);
      }

      places.forEach((place) => {
        if (place.lat && place.lng) {
          const colorClass = getMarkerColor(place.type, place.isPromoted);
          const markerIcon = L.divIcon({
            className: 'place-marker',
            html: `
              <div class="relative group">
                <div class="flex items-center justify-center w-10 h-10 ${colorClass} text-white rounded-2xl shadow-2xl border-2 border-white transition-all group-hover:scale-125 group-hover:rotate-12">
                   <span class="text-base">${place.isPromoted ? '⭐' : '📍'}</span>
                </div>
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          });
          L.marker([place.lat, place.lng], { icon: markerIcon })
            .addTo(markers)
            .bindPopup(`
              <div class="p-3 min-w-[160px] font-sans">
                <h4 class="font-black text-slate-900 text-sm leading-tight">${place.title}</h4>
                <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">${place.type || 'Business'}</p>
                <a href="${place.uri}" target="_blank" class="block w-full text-center bg-indigo-600 text-white text-[10px] font-black uppercase py-2 mt-4 rounded-xl shadow-lg shadow-indigo-500/20">${t('viewStore')}</a>
              </div>
            `);
          bounds.push([place.lat, place.lng]);
        }
      });

      if (bounds.length > 0) map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [80, 80], maxZoom: 16 });
    }

    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [places, userLocation, language]);

  return (
    <div className="w-full h-[600px] rounded-[3.5rem] overflow-hidden relative group border border-slate-200/50 dark:border-white/5 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* HUD Overlays */}
      <div className="absolute inset-0 pointer-events-none border-[12px] border-black/5 dark:border-white/5 rounded-[3.5rem] z-[1002]"></div>
      
      {/* Tactical Legend */}
      <div className="absolute top-8 left-8 z-[1001] glass-morphism p-6 rounded-[2.5rem] shadow-2xl border-white/40 w-56">
        <h5 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center">
          <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
          MAP INTELLIGENCE
        </h5>
        <div className="space-y-3">
          <div className="flex items-center justify-between group">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Emergency</span>
            <div className="w-4 h-4 bg-rose-600 rounded-lg"></div>
          </div>
          <div className="flex items-center justify-between group">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Markets</span>
            <div className="w-4 h-4 bg-emerald-600 rounded-lg"></div>
          </div>
          <div className="flex items-center justify-between group">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Services</span>
            <div className="w-4 h-4 bg-amber-600 rounded-lg"></div>
          </div>
          <div className="pt-4 border-t border-slate-200/50 mt-4">
             <div className="flex items-center space-x-3">
               <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center text-[10px]">⭐</div>
               <span className="text-[10px] font-black text-slate-600 uppercase">Promoted</span>
             </div>
          </div>
        </div>
      </div>

      {/* Weather Module */}
      {weather && (
        <div className="absolute bottom-8 right-8 z-[1001] glass-morphism p-6 rounded-[2.5rem] shadow-2xl border-white/40 animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center space-x-4">
            <div className="text-5xl">{weather.emoji}</div>
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{weather.temp}</div>
              <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{weather.condition}</div>
            </div>
          </div>
          <p className="mt-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-200/50 pt-3 flex items-center">
            <span className="mr-2">📍</span> {weather.locationName}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapView;
