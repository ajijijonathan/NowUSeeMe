
import React from 'react';
import { PlaceResult, PlaceType } from '../types';

interface PlaceCardProps {
  place: PlaceResult;
  onView?: (place: PlaceResult) => void;
  compact?: boolean;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onView, compact = false }) => {
  const isMapLink = place.uri.includes('google.com/maps');

  const getTypeStyle = (type?: PlaceType) => {
    switch (type) {
      case 'emergency': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'service': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'market': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    }
  };

  const handleClick = () => {
    if (onView) onView(place);
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(place.uri)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(place.uri)}&text=${encodeURIComponent(`Check out ${place.title} on Now U See Me!`)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${place.title} on Now U See Me! ${place.uri}`)}`
  };

  const handleSocialClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank', 'width=600,height=400');
  };

  if (compact) {
    return (
      <div 
        onClick={handleClick}
        className="flex items-center space-x-3 bg-white border border-slate-100 p-2.5 rounded-2xl hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${getTypeStyle(place.type)}`}>
          {place.type === 'market' ? '🛍️' : place.type === 'service' ? '🛠️' : '📍'}
        </div>
        <div className="flex-grow min-w-0">
          <h4 className="font-bold text-slate-800 text-xs truncate group-hover:text-indigo-600 transition-colors">{place.title}</h4>
          <div className="flex items-center space-x-2">
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{place.distance || 'Near you'}</p>
          </div>
        </div>
        <div className="flex space-x-1 shrink-0">
           <button 
            onClick={(e) => handleSocialClick(e, shareLinks.whatsapp)}
            className="w-6 h-6 flex items-center justify-center rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all text-[10px]"
            title="Share on WhatsApp"
          >
            💬
          </button>
          <a 
            href={place.uri} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all text-[10px]"
            onClick={(e) => e.stopPropagation()}
          >
            ↗
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-[2rem] shadow-sm border p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col group ${
      place.isPromoted 
        ? 'bg-gradient-to-br from-white to-indigo-50/50 border-indigo-200' 
        : 'bg-white border-slate-100'
    }`}>
      {/* Badges */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${getTypeStyle(place.type)}`}>
            {place.type || 'Market'}
          </span>
          {place.isVerified && (
            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] bg-blue-50 text-blue-600 border border-blue-100 flex items-center">
              <span className="mr-1">🛡️</span> Verified
            </span>
          )}
        </div>
        {place.isPromoted && (
          <div className="bg-indigo-600 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest flex items-center shadow-lg shadow-indigo-100">
            Featured
          </div>
        )}
      </div>
      
      <div className="flex-grow">
        <h3 className={`font-black text-xl mb-1 leading-tight transition-colors ${
          place.isPromoted ? 'text-indigo-900 group-hover:text-indigo-600' : 'text-slate-800 group-hover:text-indigo-600'
        }`}>
          {place.title}
        </h3>
        <div className="flex items-center space-x-3 mt-2">
          {place.distance && (
             <span className="text-[10px] font-bold text-slate-400 flex items-center">
               <span className="mr-1 opacity-50">📍</span> {place.distance}
             </span>
          )}
          <span className="text-[10px] font-bold text-emerald-500 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> Open Now
          </span>
        </div>
      </div>
      
      {/* Social Sharing Row */}
      <div className="mt-6 flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
           <button 
            onClick={(e) => handleSocialClick(e, shareLinks.facebook)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-xs"
            title="Share on Facebook"
          >
            f
          </button>
          <button 
            onClick={(e) => handleSocialClick(e, shareLinks.twitter)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-indigo-600 transition-all text-[10px]"
            title="Share on X (Twitter)"
          >
            𝕏
          </button>
          <button 
            onClick={(e) => handleSocialClick(e, shareLinks.whatsapp)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all text-sm"
            title="Share on WhatsApp"
          >
            💬
          </button>
        </div>

        <div className="flex space-x-3">
          <a 
            href={place.uri} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={handleClick}
            className={`flex-grow inline-flex items-center justify-center py-3 font-black uppercase tracking-widest rounded-2xl transition-all text-[11px] ${
              place.isPromoted 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-xl shadow-indigo-200' 
                : 'bg-slate-900 text-white hover:bg-indigo-600'
            }`}
          >
            View Store
          </a>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
