
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { searchLocalContent, fetchWeatherForLocation } from './services/geminiService';
import { Location, SearchResponse, CATEGORIES, Category, WeatherData, PlaceResult, RecentPlace, SEARCH_SUGGESTIONS, MerchantRequest, InfoType, PlatformInsights, LanguageCode, LANGUAGES, TRANSLATIONS } from './types';
import PlaceCard from './components/PlaceCard';
import AdminPortal from './components/AdminPortal';
import MapView from './components/MapView';
import InfoModal from './components/InfoModal';
import AIAgent from './components/AIAgent';

const FAVORITES_STORAGE_KEY = 'nearby_favorites';
const LANG_STORAGE_KEY = 'nearby_language';
const THEME_STORAGE_KEY = 'nearby_theme';
const MERCHANTS_STORAGE_KEY = 'nearby_merchants';

const DEFAULT_MERCHANTS: MerchantRequest[] = [
  { id: '1', businessName: "Fresh Organics", status: 'active', bidAmount: 1500, category: 'Food & Drink', appliedDate: '2024-03-10', billingStatus: 'paid' },
  { id: '2', businessName: 'Global Tech Solutions', status: 'active', bidAmount: 1200, category: 'Electronics', appliedDate: '2024-03-12', billingStatus: 'paid' },
  { id: '3', businessName: 'Elite Medical Center', status: 'active', bidAmount: 2500, category: 'Medical', appliedDate: '2024-02-28', billingStatus: 'paid' },
];

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPasskeyPromptOpen, setIsPasskeyPromptOpen] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [activeInfo, setActiveInfo] = useState<InfoType | null>(null);
  const [merchants, setMerchants] = useState<MerchantRequest[]>([]);
  const [favorites, setFavorites] = useState<PlaceResult[]>([]);
  const [logoClicks, setLogoClicks] = useState(0);
  const clickTimerRef = useRef<any>(null);

  const t = (key: string) => TRANSLATIONS[language][key] || key;

  useEffect(() => {
    const storedLang = localStorage.getItem(LANG_STORAGE_KEY) as LanguageCode;
    if (storedLang) setLanguage(storedLang);

    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark';
    if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }

    const storedFavs = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (storedFavs) setFavorites(JSON.parse(storedFavs));
    const storedMerchants = localStorage.getItem(MERCHANTS_STORAGE_KEY);
    setMerchants(storedMerchants ? JSON.parse(storedMerchants) : DEFAULT_MERCHANTS);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setLocation(loc);
          fetchWeatherForLocation(loc, language).then(setWeather);
        }
      );
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLanguage(newLang);
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
    if (location) fetchWeatherForLocation(location, newLang).then(setWeather);
  };

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setQuery(searchQuery);
    const res = await searchLocalContent(searchQuery, location, language);
    
    const promoted = merchants.filter(m => 
      m.status === 'active' && 
      (m.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || 
       m.category.toLowerCase().includes(searchQuery.toLowerCase()))
    ).map(m => ({ 
      title: m.businessName, 
      uri: "#", 
      type: 'market' as const, 
      isPromoted: true, 
      isVerified: true, 
      distance: "PARTNER" 
    }));

    setResult({ text: res.text, places: [...promoted, ...res.places] });
    setLoading(false);
    // Smooth scroll to results
    setTimeout(() => {
      document.getElementById('results-hub')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [location, language, merchants]);

  return (
    <div className="min-h-screen selection:bg-indigo-500/30 transition-colors duration-500">
      {/* Global Status HUD */}
      <div className="fixed top-0 left-0 w-full z-[110] px-10 py-3 flex justify-between pointer-events-none">
        <div className="flex space-x-6">
          <div className="flex items-center space-x-2 glass-panel px-3 py-1.5 rounded-full border-black/5 dark:border-white/5 shadow-sm">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">System_Live</span>
          </div>
          {location && (
            <div className="hidden sm:flex items-center space-x-2 glass-panel px-3 py-1.5 rounded-full border-black/5 dark:border-white/5 shadow-sm">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                LOC: {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
              </span>
            </div>
          )}
        </div>
        {weather && (
          <div className="flex items-center space-x-2 glass-panel px-3 py-1.5 rounded-full border-black/5 dark:border-white/5 shadow-sm">
            <span className="text-[12px]">{weather.emoji}</span>
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">{weather.temp}</span>
          </div>
        )}
      </div>

      <nav className="sticky top-0 z-[100] px-10 py-8 glass-panel border-b border-black/5 dark:border-white/5 flex justify-between items-center transition-all">
        <div 
          className="flex items-center space-x-5 cursor-pointer group"
          onClick={() => {
            setLogoClicks(c => c + 1);
            if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
            if (logoClicks + 1 >= 5) { setIsPasskeyPromptOpen(true); setLogoClicks(0); }
            else clickTimerRef.current = setTimeout(() => setLogoClicks(0), 2000);
          }}
        >
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[1.2rem] flex items-center justify-center font-display font-black text-white text-3xl brand-glow group-hover:rotate-12 transition-all duration-500 shadow-2xl">
            N
          </div>
          <div>
            <span className="text-3xl font-display font-black tracking-tighter text-slate-900 dark:text-white block leading-none">NEARBY</span>
            <span className="text-[9px] font-mono font-black text-indigo-500 dark:text-indigo-400 tracking-[0.4em] uppercase">Discovery Node</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center glass-panel rounded-2xl p-1 space-x-2 border-black/5 dark:border-white/10 shadow-sm">
            <select 
              value={language} 
              onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)} 
              className="bg-transparent rounded-xl px-4 py-2 text-[11px] font-mono font-black uppercase tracking-widest text-slate-700 dark:text-white outline-none cursor-pointer"
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-white dark:bg-brand-obsidian">{l.flag} {l.label}</option>)}
            </select>
            <button onClick={toggleTheme} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/10 text-lg">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-10 pt-20 pb-40">
        {/* Immersive Hero Section */}
        <section className="relative mb-40 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[150px] rounded-full -z-10 animate-neural-pulse"></div>
          
          <div className="text-center relative z-10">
            <div className="inline-flex items-center space-x-3 bg-indigo-500/10 border border-indigo-500/20 px-6 py-2 rounded-full mb-10">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
              <span className="text-[10px] font-mono font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">
                {language === 'pidgin' ? 'WETIN DEY AREA?' : 'AI-POWERED LOCAL PULSE'}
              </span>
            </div>
            
            <h1 className="text-7xl md:text-[9rem] font-display font-black tracking-tighter mb-10 leading-[0.8] text-slate-900 dark:text-white">
               {language === 'pidgin' ? 'ANYTIN' : 'EVERYTHING'}<br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-400 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300">
                 {language === 'pidgin' ? 'NA HERE.' : 'ANYWHERE.'}
               </span>
            </h1>
            
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-xl font-medium tracking-tight leading-relaxed mb-20">
              {t('heroSub')}
            </p>

            {/* Hub Search Bar */}
            <div className="max-w-4xl mx-auto group">
              <div className="relative p-2 bg-white/50 dark:bg-slate-900/50 rounded-[3.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-3xl ring-1 ring-black/5 dark:ring-white/10 transition-all duration-700 group-focus-within:ring-indigo-500/40">
                <input 
                  type="text" 
                  placeholder={t('searchPlaceholder')}
                  className="w-full bg-white dark:bg-brand-obsidian border-none rounded-[3.3rem] px-14 py-8 text-2xl font-display font-black outline-none placeholder:text-slate-300 dark:placeholder:text-slate-800 text-slate-900 dark:text-white transition-all"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                />
                <button 
                  onClick={() => handleSearch(query)}
                  disabled={loading}
                  className="absolute right-4 top-4 bottom-4 bg-indigo-600 text-white px-12 rounded-[2.8rem] font-display font-black uppercase tracking-[0.2em] text-[13px] shadow-2xl shadow-indigo-600/30 hover:bg-slate-900 dark:hover:bg-white dark:hover:text-brand-obsidian hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? '...' : t('exploreBtn')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Category Bento Grid */}
        {!result && !loading && (
          <section className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-display font-black tracking-tight text-slate-900 dark:text-white">{t('gridFeed')}</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{language === 'pidgin' ? 'Select where you wan check' : 'Jump directly into local sectors'}</p>
              </div>
              <div className="hidden sm:flex space-x-2">
                 <button onClick={() => setActiveInfo('economics')} className="px-5 py-2 glass-panel rounded-full text-[9px] font-mono font-black text-slate-400 hover:text-indigo-500 transition-colors uppercase tracking-widest">Platform_Stats</button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {CATEGORIES.map((cat, i) => (
                <button 
                  key={cat.id} 
                  onClick={() => { setQuery(cat.label); handleSearch(cat.label); }}
                  className={`group relative h-64 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center justify-center space-y-4 ${
                    i % 4 === 0 ? 'md:col-span-2' : ''
                  } glass-panel border-black/5 dark:border-white/5`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="text-5xl group-hover:scale-125 transition-transform duration-500">{cat.icon}</div>
                  <div className="text-center z-10">
                    <h4 className="text-[13px] font-display font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">{t(`cat_${cat.id}`)}</h4>
                    <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Launch_Node</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {loading && (
          <div className="flex flex-col items-center py-32 space-y-8">
            <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden relative">
               <div className="w-full h-full bg-indigo-500 absolute animate-scanline-fast"></div>
            </div>
            <p className="text-[11px] font-mono font-black uppercase tracking-[0.6em] text-indigo-500 animate-pulse">{t('analyzing')}</p>
          </div>
        )}

        {/* Results Hub */}
        {result && (
          <div id="results-hub" className="space-y-32 pt-10 animate-in fade-in zoom-in-95 duration-1000">
            <div className="glass-panel rounded-[3.5rem] p-12 lg:p-16 border-black/5 dark:border-white/10 shadow-inner relative overflow-hidden">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full"></div>
              <div className="flex items-center space-x-6 mb-12">
                <div className="w-16 h-16 bg-indigo-600 rounded-[1.8rem] flex items-center justify-center text-white text-3xl shadow-2xl brand-glow">✨</div>
                <div>
                  <h3 className="text-4xl font-display font-black tracking-tight text-slate-900 dark:text-white">{t('conciergeTitle')}</h3>
                  <p className="text-[10px] font-mono font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-1">Direct Insight Stream</p>
                </div>
              </div>
              <div className="text-slate-600 dark:text-slate-300 text-xl leading-relaxed font-medium prose dark:prose-invert max-w-none prose-indigo">
                {result.text}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="glass-panel p-2 rounded-[2rem] flex space-x-4 border-black/5 dark:border-white/5">
                <button onClick={() => setViewMode('grid')} className={`px-12 py-5 rounded-[1.5rem] text-[11px] font-mono font-black uppercase tracking-[0.3em] transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-indigo-600 dark:hover:text-white'}`}>{t('gridFeed')}</button>
                <button onClick={() => setViewMode('map')} className={`px-12 py-5 rounded-[1.5rem] text-[11px] font-mono font-black uppercase tracking-[0.3em] transition-all ${viewMode === 'map' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-indigo-600 dark:hover:text-white'}`}>{t('mapOverlay')}</button>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {result.places.map((p, idx) => (
                  <PlaceCard 
                    key={idx} 
                    place={p} 
                    language={language} 
                    isFavorite={favorites.some(f => f.uri === p.uri && f.title === p.title)}
                    onToggleFavorite={(pl) => {
                      const exists = favorites.find(f => f.uri === pl.uri);
                      const updated = exists ? favorites.filter(f => f.uri !== pl.uri) : [...favorites, pl];
                      setFavorites(updated);
                      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
                    }}
                  />
                ))}
              </div>
            ) : (
              <MapView places={result.places} userLocation={location} weather={weather} language={language} />
            )}
            
            <div className="text-center pt-20">
               <button onClick={() => { setResult(null); setQuery(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-10 py-5 glass-panel rounded-[2rem] text-[11px] font-mono font-black uppercase tracking-[0.3em] text-slate-400 hover:text-indigo-600 hover:border-indigo-500/30 transition-all">
                  {t('keepExploring')}
               </button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-50 dark:bg-brand-obsidian text-slate-900 dark:text-white pt-48 pb-24 border-t border-black/5 dark:border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-24 relative z-10">
          <div className="space-y-10">
            <h2 className="text-5xl font-display font-black tracking-tighter">NEARBY</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-medium">{t('heroSub')}</p>
            <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="px-10 py-5 bg-indigo-600 text-white dark:bg-white dark:text-brand-obsidian rounded-[1.5rem] text-[11px] font-mono font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl">{t('invite')}</button>
          </div>
          <div>
            <h4 className="text-[12px] font-mono font-black uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400 mb-10">{t('bizPartners')}</h4>
            <ul className="space-y-6 text-slate-500 dark:text-slate-400 text-[13px] font-bold">
              <li className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer" onClick={() => setActiveInfo('contact')}>{t('applyVerify')}</li>
              <li className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer" onClick={() => setActiveInfo('economics')}>{t('biddingModel')}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-mono font-black uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400 mb-10">SYSTEM</h4>
            <ul className="space-y-6 text-slate-500 dark:text-slate-400 text-[13px] font-bold">
              <li className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer" onClick={() => setActiveInfo('infrastructure')}>ARCH_DOCS</li>
              <li className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer" onClick={() => setActiveInfo('terms')}>LEGAL_CORE</li>
            </ul>
          </div>
          <div className="md:text-right flex flex-col justify-end">
            <p className="text-slate-400 dark:text-slate-700 text-[11px] font-mono font-black uppercase tracking-[0.6em] mb-4">BUILD_2025.04.1</p>
            <p className="text-slate-400 dark:text-slate-500 text-[11px] font-mono font-black uppercase tracking-[0.4em]">&copy; LUJORA_TECH_INTL</p>
          </div>
        </div>
      </footer>

      {isAdminOpen && <AdminPortal merchants={merchants} setMerchants={setMerchants} onClose={() => setIsAdminOpen(false)} language={language} />}
      {isPasskeyPromptOpen && (
        <div className="fixed inset-0 z-[1000] glass-panel backdrop-blur-3xl flex items-center justify-center p-8">
          <form 
            onSubmit={(e)=>{e.preventDefault(); if(passkeyInput==='lujora2025'){setIsAdminOpen(true);setIsPasskeyPromptOpen(false);setPasskeyInput('');} }} 
            className="bg-white dark:bg-brand-obsidian border border-black/10 dark:border-white/10 p-16 rounded-[4rem] shadow-2xl max-w-xl w-full"
          >
            <h2 className="text-4xl font-display font-black text-slate-900 dark:text-white mb-10 tracking-tighter">NODE_AUTH</h2>
            <input autoFocus type="password" placeholder="ENTER_ACCESS_CODE" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-black/5 dark:border-white/5 rounded-[1.8rem] px-10 py-6 mb-8 text-slate-900 dark:text-white text-xl font-mono outline-none focus:border-indigo-500 transition-all text-center tracking-[0.5em]" value={passkeyInput} onChange={(e) => setPasskeyInput(e.target.value)} />
            <div className="flex space-x-6">
              <button type="button" onClick={() => setIsPasskeyPromptOpen(false)} className="flex-1 py-6 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-[1.8rem] text-[12px] font-mono font-black uppercase tracking-widest">ABORT</button>
              <button type="submit" className="flex-1 py-6 bg-indigo-600 text-white rounded-[1.8rem] text-[12px] font-mono font-black uppercase tracking-widest shadow-2xl">AUTHORIZE</button>
            </div>
          </form>
        </div>
      )}

      {activeInfo && <InfoModal type={activeInfo} onClose={() => setActiveInfo(null)} language={language} onMerchantApply={(m)=>{setMerchants([...merchants, {...m, id: Date.now().toString(), status: 'pending', appliedDate: new Date().toISOString().split('T')[0], billingStatus: 'trial'} as MerchantRequest]);}} />}
      <AIAgent userLocation={location} selectedLanguage={language} onMessageSent={(m) => { setQuery(m); handleSearch(m); }} />
    </div>
  );
};

export default App;
