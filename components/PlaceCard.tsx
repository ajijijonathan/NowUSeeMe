
import React, { useState, useEffect } from 'react';
import { PlaceResult, PlaceType, Review } from '../types';

interface PlaceCardProps {
  place: PlaceResult;
  onView?: (place: PlaceResult) => void;
  compact?: boolean;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onView, compact = false }) => {
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load reviews from localStorage on mount or when place URI changes
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

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    setIsSubmitting(true);
    
    const newReview: Review = {
      id: Date.now().toString(),
      author: 'You',
      text: newReviewText,
      rating: newReviewRating,
      createdAt: Date.now()
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    
    const storageKey = `nearby_reviews_${btoa(place.uri)}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedReviews));
    
    setNewReviewText('');
    setNewReviewRating(5);
    
    setTimeout(() => {
      setIsSubmitting(false);
    }, 400);
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Report "${place.title}" for review? This flags the business for our administrative team to verify its data integrity.`);
    if (confirmed) {
      console.log(`[NEARBY REPORT] Business: ${place.title}, URI: ${place.uri}, Timestamp: ${new Date().toISOString()}`);
      alert("Report submitted successfully. Thank you for maintaining ecosystem integrity.");
    }
  };

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
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(place.uri)}&text=${encodeURIComponent(`Check out ${place.title} on NEARBY!`)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${place.title} on NEARBY! ${place.uri}`)}`
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
    <div className={`relative rounded-[2rem] shadow-sm border p-6 hover:shadow-xl transition-all duration-500 flex flex-col group ${
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
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Open Now
          </span>
        </div>
      </div>

      {/* Reviews Toggle Section */}
      <div className="mt-6 border-t border-slate-100 pt-4">
        <button 
          onClick={() => setShowReviews(!showReviews)}
          className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <span>User Reviews ({reviews.length})</span>
          <span>{showReviews ? '▴' : '▾'}</span>
        </button>

        {showReviews && (
          <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Review List */}
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {reviews.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">No reviews yet. Be the first!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[9px] font-black text-slate-900">{rev.author}</span>
                      <div className="flex text-amber-400 text-[8px]">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-normal">{rev.text}</p>
                    <span className="text-[8px] text-slate-300 block mt-1">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Review Form */}
            <form onSubmit={handleAddReview} className="mt-4 pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-slate-500">Rate this place:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className={`text-sm transition-colors ${star <= newReviewRating ? 'text-amber-400' : 'text-slate-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                placeholder="Share your experience..."
                className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-300 focus:ring-1 focus:ring-indigo-100 resize-none min-h-[60px]"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newReviewText.trim()}
                className="mt-2 w-full bg-white border border-slate-100 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}
      </div>
      
      {/* Action Row */}
      <div className="mt-6 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
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

          <button 
            onClick={handleReport}
            className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-rose-500 transition-colors flex items-center"
            title="Report this place"
          >
            <span className="mr-1">🚩</span> Report
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
