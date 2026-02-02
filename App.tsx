
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { searchLocalContent, fetchWeatherForLocation } from './services/geminiService';
import { Location, SearchResponse, CATEGORIES, Category, WeatherData, PlaceResult, RecentPlace, SEARCH_SUGGESTIONS, MerchantRequest, InfoType } from './types';
import PlaceCard from './components/PlaceCard';
import AdminPortal from './components/AdminPortal';
import MapView from './components/MapView';
import InfoModal from './components/InfoModal';
import AIAgent from './components/AIAgent';

const RECENT_STORAGE_KEY = 'nearby_recent_views';
const MERCHANTS_STORAGE_KEY = 'nearby_merchants';
const ADMIN_PASSKEY = 'lujora2025';

const DEFAULT_MERCHANTS: MerchantRequest[] = [
  { id: '1', businessName: "Fresh Organics", status: 'active', bidAmount: 8.50, category: 'Food & Drink', appliedDate: '2024-03-10', billingStatus: 'paid' },
  { id: '2', businessName: 'Global Tech Solutions', status: 'active', bidAmount: 5.75, category: 'Electronics', appliedDate: '2024-03-12', billingStatus: 'paid' },
  { id: '3', businessName: 'Elite Medical Center', status: 'active', bidAmount: 12.20, category: 'Medical', appliedDate: '2024-02-28', billingStatus: 'paid' },
];

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  
  // Admin & Stealth States
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPasskeyPromptOpen, setIsPasskeyPromptOpen] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  
  // Stealth Pattern State
  const [logoClicks, setLogoClicks] = useState(0);
  // Fix: Using 'any' for clickTimerRef to avoid 'NodeJS' namespace error in browser environment
  const clickTimerRef = useRef<any>(null);

  const [viewMode, setViewMode] = useState('grid');
  const [activeInfo, setActiveInfo] = useState<InfoType | null>(null);
  const [recentPlaces, setRecentPlaces] = useState<RecentPlace[]>([]);
  const [merchants, setMerchants] = useState<MerchantRequest[]>([]);

  useEffect(() => {
    // 1. Check URL for stealth mode
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'admin') {
      setIsPasskeyPromptOpen(true);
      // Clean URL after detection
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const storedRecent = localStorage.getItem(RECENT_STORAGE_KEY);
    if (storedRecent) {
      try { setRecentPlaces(JSON.parse(storedRecent)); } catch (e) { console.error(e); }
    }

    const storedMerchants = localStorage.getItem(MERCHANTS_STORAGE_KEY);
    if (storedMerchants) {
      try { 
        const parsed = JSON.parse(storedMerchants);
        setMerchants(Array.isArray(parsed) ? parsed : DEFAULT_MERCHANTS);
      } catch (e) { 
        setMerchants(DEFAULT_MERCHANTS); 
      }
    } else {
      setMerchants(DEFAULT_MERCHANTS);
      localStorage.setItem(MERCHANTS_STORAGE_KEY, JSON.stringify(DEFAULT_MERCHANTS));
    }
  }, []);

  // Handle Secret Logo Knocks
  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (newCount >= 5) {
      setIsPasskeyPromptOpen(true);
      setLogoClicks(0);
    } else {
      clickTimerRef.current = setTimeout(() => {
        setLogoClicks(0);
      }, 3000); // Reset clicks after 3 seconds of inactivity
    }
  };

  const refreshLocation = useCallback(() => {
    if (navigator.geolocation) {
      setLocationStatus('requesting');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setLocation(newLoc);
          setLocationStatus('granted');
          fetchWeatherForLocation(newLoc).then(setWeather);
        },
        () => setLocationStatus('denied'),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLocationStatus('denied');
    }
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setQuery(searchQuery);
    
    const res = await searchLocalContent(searchQuery, location);
    
    const matchedMerchants = (merchants || [])
      .filter(m => m.status === 'active' && (
        searchQuery.toLowerCase().includes((m.category || '').toLowerCase()) || 
        (m.businessName || '').toLowerCase().includes(searchQuery.toLowerCase())
      ))
      .sort((a, b) => (b.bidAmount || 0) - (a.bidAmount || 0));

    const localPlaces: PlaceResult[] = matchedMerchants.map(m => ({
      title: m.businessName,
      uri: `https://www.google.com/maps/search/${encodeURIComponent(m.businessName)}`,
      isPromoted: m.bidAmount > 5,
      isVerified: m.billingStatus === 'paid',
      type: 'market',
      distance: 'Verified Partner'
    }));

    res.places = [...localPlaces, ...res.places];
    setResult(res);
    setLoading(false);
  }, [location, merchants]);

  const onCategoryClick = (category: Category) => handleSearch(`Find the best ${category.label} shops and services`);

  const handleViewPlace = (place: PlaceResult) => {
    const newRecent: RecentPlace = { ...place, viewedAt: Date.now() };
    setRecentPlaces(prev => {
      const filtered = prev.filter(p => p.uri !== place.uri);
      const updated = [newRecent, ...filtered].slice(0, 6);
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handlePasskeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthorizing(true);
    
    setTimeout(() => {
      if (passkeyInput.trim() === ADMIN_PASSKEY) {
        setPasskeyError(false);
        setIsPasskeyPromptOpen(false);
        setIsAdminOpen(true);
        setPasskeyInput('');
      } else {
        setPasskeyError(true);
        setTimeout(() => setPasskeyError(false), 2000);
      }
      setIsAuthorizing(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      <header className="sticky top-0 z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleLogoClick}
              className={`w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-90 ${logoClicks > 2 ? 'ring-2 ring-indigo-500' : ''}`}
            >
              <span className="text-white font-black text-2xl select-none">N</span>
            </button>
            <h1 className="brand-font text-2xl font-black text-slate-800 tracking-tighter">NEAR<span className="text-indigo-600">BY</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            {locationStatus === 'granted' && weather && (
              <div className="hidden lg:flex items-center space-x-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-2xl">{weather.emoji}</span>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{weather.locationName}</p>
                  <p className="text-xs font-black text-slate-800">{weather.temp}</p>
                </div>
              </div>
            )}
            <button onClick={refreshLocation} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-500 hover:text-indigo-600 shadow-sm transition-all">
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
            <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">Global AI discovery. Real-time market data. Verified trust.</p>
          </div>

          <div className="relative mb-6">
            <div className="flex items-center bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-3 border-4 border-transparent focus-within:border-indigo-100 transition-all">
              <span className="pl-6 text-2xl">🔍</span>
              <input
                type="text"
                placeholder="Ex: 'Plumbers', 'Italian food', 'Art galleries'..."
                className="flex-grow bg-transparent border-none focus:ring-0 py-5 px-6 text-slate-800 placeholder:text-slate-300 font-bold text-xl tracking-tight"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              />
              <button onClick={() => handleSearch(query)} disabled={loading} className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all disabled:opacity-50">
                {loading ? 'Analyzing...' : 'Explore Now'}
              </button>
            </div>
          </div>

          {!result && !loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => onCategoryClick(cat)} className="bg-white border border-slate-100 p-6 rounded-[2.5rem] flex flex-col items-center justify-center hover:border-indigo-200 hover:shadow-xl transition-all group aspect-square">
                  <span className="text-4xl mb-3 group-hover:scale-125 transition-transform">{cat.icon}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {(loading || result) && (
          <div className="max-w-7xl mx-auto px-6 pb-24">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="w-20 h-20 border-8 border-indigo-50 border-t-slate-900 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">AI Discovery Pulse Active</p>
              </div>
            ) : result && (
              <div className="space-y-12">
                <div className="bg-white rounded-[3.5rem] p-10 md:p-16 shadow-2xl border border-slate-100 relative overflow-hidden">
                   <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start">
                     <div className="flex-grow">
                        <div className="flex items-center space-x-3 mb-6">
                          <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">AI Concierge Analysis</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-2xl font-medium tracking-tight">{result.text}</p>
                     </div>
                     <div className="shrink-0 flex items-center bg-slate-100 p-2 rounded-[2rem]">
                        <button onClick={() => setViewMode('grid')} className={`px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400'}`}>Grid Feed</button>
                        <button onClick={() => setViewMode('map')} className={`px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400'}`}>Map Overlay</button>
                     </div>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {result.places.map((place, idx) => <PlaceCard key={idx} place={place} onView={handleViewPlace} />)}
                </div>
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
             <p className="text-slate-400 text-sm font-medium leading-relaxed">The global discovery layer powered by Gemini. Connecting intent with local opportunity.</p>
          </div>
          <div className="space-y-6">
             <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Business Partners</h4>
             <ul className="space-y-4">
               <li><button onClick={() => setActiveInfo('contact')} className="text-slate-500 hover:text-indigo-600 text-sm font-bold transition-colors">Apply for Verification</button></li>
               <li><button onClick={() => setActiveInfo('economics')} className="text-slate-500 hover:text-indigo-600 text-sm font-bold transition-colors">Bidding Model</button></li>
               <li><button onClick={() => setActiveInfo('help')} className="text-slate-500 hover:text-indigo-600 text-sm font-bold transition-colors">Partner Help Center</button></li>
             </ul>
          </div>
          <div className="space-y-6">
             <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Lujora Core</h4>
             <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <p className="text-slate-800 font-black text-sm mb-1">Lujora Technologies</p>
                <p className="text-slate-400 text-xs font-medium">Global AI Infrastructure</p>
             </div>
          </div>
        </div>
      </footer>

      {/* Global Overlays */}
      {isPasskeyPromptOpen && (
        <div className="fixed inset-0 z-[10001] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-hidden">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100 transform transition-all">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">🔒</div>
              <h3 className="text-xl font-black text-slate-800">SuperAdmin Access</h3>
              <p className="text-slate-400 text-xs mt-1">Enter master passkey for Lujora Hub</p>
            </div>
            <form onSubmit={handlePasskeySubmit} className="space-y-4">
              <input
                autoFocus
                type="password"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="••••••••"
                className={`w-full py-4 px-6 bg-slate-50 border-2 rounded-2xl text-center text-xl font-black tracking-widest focus:outline-none transition-all ${
                  passkeyError ? 'border-rose-500 animate-shake text-rose-500 bg-rose-50' : 'border-slate-100 focus:border-indigo-500'
                }`}
              />
              <div className="flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsPasskeyPromptOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isAuthorizing}
                  className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                >
                  {isAuthorizing ? 'Authorizing...' : 'Authorize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdminOpen && (
        <AdminPortal 
          merchants={merchants} 
          setMerchants={(m) => { 
            setMerchants(m); 
            localStorage.setItem(MERCHANTS_STORAGE_KEY, JSON.stringify(m)); 
          }} 
          onClose={() => setIsAdminOpen(false)} 
        />
      )}
      
      {activeInfo && <InfoModal type={activeInfo} onClose={() => setActiveInfo(null)} />}
      <AIAgent userLocation={location} />
    </div>
  );
};

export default App;
