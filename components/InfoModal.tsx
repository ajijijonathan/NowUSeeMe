
import React, { useState } from 'react';
import { InfoType, CATEGORIES, MerchantRequest, LanguageCode, TRANSLATIONS } from '../types';

interface InfoModalProps {
  type: InfoType;
  onClose: () => void;
  onMerchantApply?: (application: Partial<MerchantRequest>) => void;
  language?: LanguageCode;
}

const InfoModal: React.FC<InfoModalProps> = ({ type, onClose, onMerchantApply, language = 'en' }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const t = (key: string) => TRANSLATIONS[language][key] || key;

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    category: CATEGORIES[0].label,
    contactEmail: '',
    address: '',
    bidAmount: 1500.00
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    
    // Simulate network delay
    setTimeout(() => {
      if (onMerchantApply) {
        onMerchantApply(formData);
      }
      setIsApplying(false);
      setHasApplied(true);
    }, 1500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const localizedContent = {
    terms: {
      title: language === 'pidgin' ? 'Rules for de App' : 'Governance Terms',
      body: (
        <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
          <section>
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-2">1. Ecosystem Usage</h4>
            <p>NEARBY is a global AI discovery layer. Usage of our API-driven search constitutes acceptance of real-time location processing as per Lujora Technologies governance standards.</p>
          </section>
          <section>
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-2">2. Merchant Integrity</h4>
            <p>Partners and merchants appearing on the platform undergo automated verification. Promoted content is clearly labeled to maintain transparency across all regions.</p>
          </section>
        </div>
      ),
    },
    privacy: {
      title: 'Privacy Infrastructure',
      body: (
        <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
          <section>
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-2">1. Data Minimization</h4>
            <p>We leverage 'Point-of-Intent' geolocation. Your precise coordinates are processed in transient memory to generate local results and are not stored in persistent identity databases.</p>
          </section>
          <section>
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-2">2. Encryption</h4>
            <p>All interactions between your browser and the Gemini LLM are encrypted via TLS 1.3, ensuring search queries remain private regardless of your location.</p>
          </section>
        </div>
      ),
    },
    infrastructure: {
      title: 'Infrastructure & Domain Mapping',
      shortTitle: 'Deployment Console',
      body: (
        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <h4 className="text-white font-black text-sm mb-4">Domain Mapping: <span className="text-indigo-400">usenearby.com.ng</span></h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-8">
              To activate your custom domain, point your DNS records to the Lujora Edge Network. Use your domain registrar's control panel to add these records.
            </p>

            <div className="space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 flex justify-between items-center group">
                <div>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Type A (@)</span>
                  <code className="text-emerald-400 font-mono font-bold">76.76.21.21</code>
                </div>
                <button 
                  onClick={() => copyToClipboard('76.76.21.21', 'infra-a')}
                  className="px-4 py-2 bg-slate-700 text-white text-[9px] font-black uppercase rounded-lg hover:bg-indigo-600 transition-all"
                >
                  {isCopied === 'infra-a' ? 'COPIED' : 'COPY'}
                </button>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 flex justify-between items-center group">
                <div>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">CNAME (www)</span>
                  <code className="text-emerald-400 font-mono font-bold">cname.lujora.io</code>
                </div>
                <button 
                  onClick={() => copyToClipboard('cname.lujora.io', 'infra-c')}
                  className="px-4 py-2 bg-slate-700 text-white text-[9px] font-black uppercase rounded-lg hover:bg-indigo-600 transition-all"
                >
                  {isCopied === 'infra-c' ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
             <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-xl">🛡️</div>
             <div>
                <h5 className="font-black text-indigo-950 text-xs uppercase tracking-widest mb-1">Auto-SSL Provisioning</h5>
                <p className="text-indigo-700/60 text-[10px] leading-relaxed font-medium">
                  Once DNS propagation finishes (typically 2-4 hours), Lujora will automatically generate and deploy a valid SSL certificate for your domain.
                </p>
             </div>
          </div>
        </div>
      )
    },
    contact: {
      title: t('bizPartners'),
      shortTitle: t('applyVerify'),
      body: (
        <div className="space-y-8">
          {!hasApplied ? (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Identity</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Blue Ridge Cafe"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Market Sector</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100 transition-all appearance-none"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.label}>{t(`cat_${cat.id}`)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100 space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-indigo-900 uppercase tracking-widest text-[11px]">{t('biddingModel')}</h4>
                  <span className="text-2xl font-black text-indigo-600">₦{formData.bidAmount.toLocaleString()}<span className="text-[10px] opacity-50 ml-1">/day</span></span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  value={formData.bidAmount}
                  onChange={(e) => setFormData({ ...formData, bidAmount: parseFloat(e.target.value) })}
                />
              </div>

              <button
                type="submit"
                disabled={isApplying}
                className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-indigo-100 disabled:opacity-50"
              >
                {isApplying ? 'Transmitting...' : t('applyVerify')}
              </button>
            </form>
          ) : (
            <div className="text-center py-16 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">✓</div>
              <h4 className="text-2xl font-black text-slate-900 mb-4">Application Transmitted</h4>
              <button
                onClick={onClose}
                className="px-12 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
              >
                {t('keepExploring')}
              </button>
            </div>
          )}
        </div>
      ),
    },
    help: {
      title: t('helpCenter'),
      shortTitle: 'Technical Support',
      body: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white border border-slate-200 p-6 rounded-3xl hover:border-indigo-200 transition-all group">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-lg mb-4 group-hover:scale-110 transition-transform">📊</div>
                <h5 className="font-black text-slate-900 text-sm mb-2">Managing Bids</h5>
                <p className="text-slate-400 text-[11px] leading-relaxed">Learn how to adjust your daily bid in the SuperAdmin Hub to increase your visibility density globally.</p>
             </div>
          </div>
        </div>
      )
    },
    economics: {
        title: 'Market Dynamics',
        body: (
            <div className="space-y-6">
                <p className="text-slate-600 text-sm leading-relaxed">NEARBY operates on a proof-of-value model. We don't charge for discovery; we charge for accelerated reach and verified status.</p>
            </div>
        )
    }
  };

  const active = localizedContent[type];

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
        <div className="px-10 pt-10 pb-6 flex justify-between items-center shrink-0">
          <div>
            <h2 className="brand-font text-3xl font-black text-slate-900 tracking-tighter leading-none">{active.title}</h2>
            {('shortTitle' in active) && (
               <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-2">{(active as any).shortTitle}</p>
            )}
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all font-bold">✕</button>
        </div>
        <div className="p-10 overflow-y-auto flex-grow custom-scrollbar">
          {active.body}
        </div>
        <div className="p-8 bg-slate-50/50 flex justify-end shrink-0">
          <button onClick={onClose} className="px-10 py-3 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl text-[10px] hover:scale-105 transition-all shadow-lg shadow-slate-200">
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
