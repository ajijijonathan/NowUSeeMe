
import React, { useState, useEffect, useCallback } from 'react';
import { searchLocalContent, fetchWeatherForLocation } from './services/geminiService';
import { Location, SearchResponse, CATEGORIES, Category, WeatherData, PlaceResult, RecentPlace, SEARCH_SUGGESTIONS } from './types';
import PlaceCard from './components/PlaceCard';
import AdminPortal from './components/AdminPortal';
import MapView from './components/MapView';
import InfoModal from './components/InfoModal';

type ViewMode = 'grid' | 'map';
type InfoType = 'terms' | 'privacy' | 'contact';

const RECENT_STORAGE_KEY = 'nearby_recent_views';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeInfo, setActiveInfo] = useState<InfoType | null>(null);
  const [recentPlaces, setRecentPlaces] = useState<RecentPlace[]>([]);

  const refreshLocation = useCallback(() => {
    if (navigator.geolocation) {
      setLocationStatus('requesting');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
          setLocation(newLoc);
          setLocationStatus('granted');
          fetchWeatherForLocation(newLoc).then(setWeather);
        },
        (err) => {
          console.warn("Location access denied", err);
          setLocationStatus('denied');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLocationStatus('denied');
    }
  }, []);

  useEffect(() => {
    refreshLocation();
    const stored = localStorage.getItem(RECENT_STORAGE_KEY);
    if (stored) {
      try {
        setRecentPlaces(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, [refreshLocation]);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setQuery(searchQuery);
    const res = await searchLocalContent(searchQuery, location);
    setResult(res);
    setLoading(false);

    if (res.places.length > 0 && res.places[0].lat && res.places[0].lng) {
      fetchWeatherForLocation({ latitude: res.places[0].lat, longitude: res.places[0].lng }).then(setWeather);
    } else if (location) {
      fetchWeatherForLocation(location).then(setWeather);
    }
  }, [location]);

  const onCategoryClick = (category: Category) => {
    handleSearch(`Find the best ${category.label} shops and services`);
  };

  const handleViewPlace = (place: PlaceResult) => {
    const newRecent: RecentPlace = { ...place, viewedAt: Date.now() };
    setRecentPlaces(prev => {
      const filtered = prev.filter(p => p.uri !== place.uri);
      const updated = [newRecent, ...filtered].slice(0, 6);
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setRecentPlaces([]);
    localStorage.removeItem(RECENT_STORAGE_KEY);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {isAdminOpen && <AdminPortal onClose={() => setIsAdminOpen(false)} />}
      {activeInfo && <InfoModal type={activeInfo} onClose={() => setActiveInfo(null)} />}

      <header className="sticky top-0 z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl cursor-pointer hover:rotate-6 transition-all" onClick={() => window.location.reload()}>
              <span className="text-white font-black text-2xl">N</span>
            </div>
            <h1 className="brand-font text-2xl font-black text-slate-800 tracking-tighter cursor-pointer" onClick={() => {setResult(null); setQuery('');}}>
              NEAR<span className="text-indigo-600">BY</span>
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {locationStatus === 'granted' && weather && (
              <div className="hidden lg:flex items-center space-x-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in duration-1000">
                <span className="text-2xl">{weather.emoji}</span>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{weather.locationName}</p>
                  <p className="text-xs font-black text-slate-800">{weather.temp}</p>
                </div>
              </div>
            )}
            <button 
              onClick={refreshLocation}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 shadow-sm transition-all"
            >
              {locationStatus === 'requesting' ? '⌛' : '🛰️'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-12">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-[0.9]">
              Find any <span className="text-indigo-600">Market</span><br/>or <span className="text-amber-500">Service</span> near you.
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">
              Real-time hyper-local discovery. From open-air markets to master plumbers, find it all instantly.
            </p>
          </div>

          <div className="relative mb-6">
            <div className="flex items-center bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-3 border-4 border-transparent focus-within:border-indigo-100 transition-all">
              <span className="pl-6 text-2xl">🔍</span>
              <input
                type="text"
                placeholder="Ex: 'Fresh vegetables', 'Emergency electrician', 'Best pizza'..."
                className="flex-grow bg-transparent border-none focus:ring-0 py-5 px-6 text-slate-800 placeholder:text-slate-300 font-bold text-xl tracking-tight"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              />
              <button
                onClick={() => handleSearch(query)}
                disabled={loading}
                className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Explore Now'}
              </button>
            </div>
          </div>

          {/* Quick suggestions chips */}
          {!result && !loading && (
            <div className="flex flex-wrap justify-center gap-3 mb-16">
              {SEARCH_SUGGESTIONS.map(s => (
                <button 
                  key={s} 
                  onClick={() => handleSearch(s)}
                  className="px-4 py-2 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {!result && !loading && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryClick(cat)}
                    className="bg-white border border-slate-100 p-6 rounded-[2.5rem] flex flex-col items-center justify-center hover:border-indigo-200 hover:shadow-xl transition-all group aspect-square"
                  >
                    <span className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-500">{cat.icon}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{cat.label}</span>
                  </button>
                ))}
              </div>

              {recentPlaces.length > 0 && (
                <div className="pt-8">
                  <div className="flex items-center justify-between mb-8 px-4">
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">Historical Timeline</h3>
                    <button onClick={clearHistory} className="text-[10px] font-black text-slate-300 hover:text-rose-500 transition-colors uppercase tracking-widest">Wipe Data</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentPlaces.map((place, idx) => (
                      <PlaceCard key={`recent-${idx}`} place={place} compact />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {(loading || result) && (
          <div className="max-w-7xl mx-auto px-6 pb-24">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-8 border-indigo-50 border-t-slate-900 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-slate-900 animate-pulse">N</div>
                </div>
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">AI Geolocation Sweep In Progress</p>
              </div>
            ) : result && (
              <div className="space-y-12 animate-in fade-in duration-700">
                <div className="bg-white rounded-[3.5rem] p-10 md:p-16 shadow-2xl border border-slate-100 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 text-6xl opacity-5 select-none font-black tracking-tighter">AI DATA</div>
                   <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start">
                     <div className="flex-grow">
                        <div className="flex items-center space-x-3 mb-6">
                          <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">AI Concierge</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Based on current location</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-2xl font-medium tracking-tight">
                          {result.text}
                        </p>
                     </div>
                     <div className="shrink-0 flex items-center bg-slate-100 p-2 rounded-[2rem]">
                        <button onClick={() => setViewMode('grid')} className={`px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400'}`}>Grid Feed</button>
                        <button onClick={() => setViewMode('map')} className={`px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400'}`}>Map Overlay</button>
                     </div>
                   </div>
                </div>

                {result.places.length > 0 && (
                  <div className="space-y-8">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] px-4">Discovery Results</h3>
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {result.places.map((place, idx) => (
                          <PlaceCard key={idx} place={place} onView={handleViewPlace} />
                        ))}
                      </div>
                    ) : (
                      <MapView places={result.places} userLocation={location} weather={weather} />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="space-y-6">
             <div className="flex items-center space-x-3">
               <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center font-black text-white text-lg">N</div>
               <span className="brand-font font-black text-2xl tracking-tighter">NEAR<span className="text-indigo-600">BY</span></span>
             </div>
             <p className="text-slate-400 text-sm font-medium leading-relaxed">
               The local marketplace engine powered by Gemini AI. Bridging the gap between high-tech discovery and local commerce.
             </p>
          </div>
          <div className="space-y-6">
             <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Corporate Support</h4>
             <ul className="space-y-4">
               <li><button onClick={() => setActiveInfo('contact')} className="text-slate-500 hover:text-indigo-600 text-sm font-bold transition-colors">Partner Inquiries</button></li>
               <li><button onClick={() => setActiveInfo('contact')} className="text-slate-500 hover:text-indigo-600 text-sm font-bold transition-colors">Merchant Portal Help</button></li>
               <li><button onClick={() => setIsAdminOpen(true)} className="text-indigo-600 text-sm font-black border-b-2 border-indigo-100 pb-1 hover:border-indigo-600 transition-all">SuperAdmin Hub</button></li>
             </ul>
          </div>
          <div className="space-y-6">
             <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Lujora Technologies</h4>
             <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <p className="text-[10px] font-black text-indigo-600 uppercase mb-2">Developed By</p>
                <p className="text-slate-800 font-black text-sm mb-1">Lujora Technologies</p>
                <p className="text-slate-400 text-xs font-medium">Lagos, Nigeria • Global Operations</p>
                <div className="mt-4 pt-4 border-t border-slate-200 flex space-x-4">
                   <a href="mailto:lujoratechnologies@outlook.com" className="text-lg grayscale hover:grayscale-0 transition-all">📧</a>
                   <a href="tel:+234703803157" className="text-lg grayscale hover:grayscale-0 transition-all">📞</a>
                </div>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] space-y-4 md:space-y-0">
          <div>© 2024 NEARBY. ALL RIGHTS RESERVED.</div>
          <div className="flex space-x-8">
            <button onClick={() => setActiveInfo('privacy')} className="hover:text-slate-900 transition-colors">Privacy Infrastructure</button>
            <button onClick={() => setActiveInfo('terms')} className="hover:text-slate-900 transition-colors">Governance Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;