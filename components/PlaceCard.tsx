
import React, { useState, useEffect } from 'react';
import { PlaceResult, PlaceType, Review, Report, LanguageCode, TRANSLATIONS } from '../types';

interface PlaceCardProps {
  place: PlaceResult;
  onView?: (place: PlaceResult) => void;
  compact?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (place: PlaceResult) => void;
  language?: LanguageCode;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ 
  place, 
  onView, 
  compact = false, 
  isFavorite = false,
  onToggleFavorite,
  language = 'en'
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const t = (key: string) => TRANSLATIONS[language][key] || key;

  useEffect(() => {
    if (compact) return;
    const storageKey = `nearby_reviews_${btoa(place.uri)}`;
    const savedReviews = localStorage.getItem(storageKey);
    if (savedReviews) {
      try {
        setReviews(JSON.parse(savedReviews));
      } catch (e) {
        console.error("Failed to parse reviews", e);
      }
    }
  }, [place.uri, compact]);

  const getTypeColor = (type?: PlaceType) => {
    switch (type) {
      case 'emergency': return 'rose';
      case 'service': return 'amber';
      case 'market': return 'emerald';
      default: return 'indigo';
    }
  };

  const color = getTypeColor(place.type);
  
  const typeStyles: Record<string, string> = {
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 group-hover:border-rose-500/40 shadow-rose-500/10',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 group-hover:border-amber-500/40 shadow-amber-500/10',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 group-hover:border-emerald-500/40 shadow-emerald-500/10',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 group-hover:border-indigo-500/40 shadow-indigo-500/10',
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(place);
  };

  if (compact) {
    return (
      <div 
        onClick={() => onView?.(place)}
        className="flex items-center space-x-4 glass-panel p-4 rounded-3xl hover:translate-x-2 transition-all cursor-pointer group border-transparent hover:border-indigo-500/40 shadow-lg"
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-inner ${typeStyles[color]}`}>
          {place.type === 'market' ? '🛍️' : place.type === 'service' ? '🛠️' : '📍'}
        </div>
        <div className="flex-grow min-w-0">
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{place.title}</h4>
          <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{place.distance || 'NEAR_NODE'}</p>
        </div>
        <button 
          onClick={handleFavoriteClick}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isFavorite ? 'text-rose-500 bg-rose-500/10' : 'text-slate-300 dark:text-slate-600 hover:text-rose-400'}`}
          aria-label="Toggle Favorite"
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
    );
  }

  return (
    <div className={`group relative rounded-[3rem] p-10 transition-all duration-700 flex flex-col h-full hover:-translate-y-4 border shadow-2xl overflow-hidden ${
      place.isPromoted 
        ? 'animated-border border-transparent' 
        : 'glass-panel border-black/5 dark:border-slate-700/30'
    }`}>
      {/* Dynamic Aura Glow */}
      <div className={`absolute top-0 right-0 w-48 h-48 blur-[100px] rounded-full -mr-24 -mt-24 transition-all duration-700 group-hover:scale-150 ${
        color === 'rose' ? 'bg-rose-500/10' : color === 'amber' ? 'bg-amber-500/10' : color === 'emerald' ? 'bg-emerald-500/10' : 'bg-indigo-500/10'
      }`}></div>
      
      <div className="flex justify-between items-start mb-10 z-10">
        <div className="flex flex-wrap gap-3">
          <span className={`px-5 py-2 rounded-2xl text-[10px] font-mono font-black uppercase tracking-[0.2em] border ${typeStyles[color]}`}>
            {place.type || 'SYSTEM_NODE'}
          </span>
          {place.isVerified && (
            <span className="px-5 py-2 rounded-2xl text-[10px] font-mono font-black uppercase tracking-[0.2em] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center shadow-blue-500/10 shadow-lg">
              <span className="mr-2">🛡️</span> VERIFIED
            </span>
          )}
        </div>
        <button 
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? `Remove from favorites` : `Add to favorites`}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all glass-panel group/fav ${
            isFavorite ? 'text-rose-500 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'text-slate-300 dark:text-slate-600 hover:text-rose-400 hover:border-rose-500/20'
          }`}
        >
          <span className={`text-2xl transition-transform duration-500 group-hover/fav:scale-125 ${isFavorite ? 'scale-110' : ''}`}>
            {isFavorite ? '❤️' : '🤍'}
          </span>
        </button>
      </div>
      
      <div className="flex-grow z-10">
        <h3 className="font-display font-black text-3xl mb-3 leading-tight tracking-tighter text-slate-900 dark:text-slate-50 group-hover:text-indigo-600 dark:group-hover:text-transparent dark:group-hover:bg-clip-text dark:group-hover:bg-gradient-to-r dark:group-hover:from-white dark:group-hover:to-slate-400 transition-all duration-500">
          {place.title}
        </h3>
        <div className="flex items-center space-x-5 mt-6">
          {place.distance && (
             <span className="text-[12px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center">
               <span className="w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
               {place.distance}
             </span>
          )}
          <span className="text-[12px] font-mono font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
            {reviews.length} REVIEWS
          </span>
        </div>
      </div>

      <div className="mt-12 flex flex-col space-y-5 z-10">
        <div className="flex items-center justify-between">
          <button 
            onClick={(e) => { e.stopPropagation(); window.open(`https://api.whatsapp.com/send?text=Check out ${place.title}! ${place.uri}`, '_blank'); }} 
            className="w-12 h-12 flex items-center justify-center rounded-2xl glass-panel text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all shadow-lg"
            aria-label="Share on WhatsApp"
          >
            💬
          </button>
          <button className="text-[11px] font-mono font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center">
            🚩 REPORT_NODE
          </button>
        </div>
        
        <a 
          href={place.uri} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={(e) => e.stopPropagation()}
          className={`w-full inline-flex items-center justify-center py-5 font-display font-black uppercase tracking-[0.3em] rounded-[1.5rem] transition-all text-[12px] shadow-2xl ${
            place.isPromoted 
              ? 'bg-slate-900 text-white dark:bg-white dark:text-brand-obsidian hover:bg-indigo-600 dark:hover:bg-indigo-100 hover:scale-[1.02]' 
              : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-[1.02] shadow-indigo-500/20'
          }`}
        >
          {t('viewStore')}
        </a>
      </div>
    </div>
  );
};

export default PlaceCard;
