
import React, { useState } from 'react';
import { InfoType } from '../types';

interface InfoModalProps {
  type: InfoType;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ type, onClose }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setHasApplied(true);
      window.location.href = "mailto:lujoratechnologies@outlook.com?subject=Merchant Partnership Application - NEARBY";
    }, 1500);
  };

  const content = {
    terms: {
      title: 'Governance Terms',
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
    contact: {
      title: 'Partner Inquiries',
      shortTitle: 'Scale Your Local Reach',
      body: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100">
               <h4 className="font-black text-indigo-900 uppercase tracking-widest text-[11px] mb-4">Ad Visibility Bidding</h4>
               <p className="text-xs text-indigo-700/80 leading-relaxed mb-6">Choose your daily budget. Our AI models prioritize merchants with active bids in natural language recommendations and map density views.</p>
               <div className="text-2xl font-black text-indigo-900">Starting at $1.50<span className="text-[10px] font-medium opacity-50 ml-1">/day</span></div>
            </div>
            
            <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100">
              <h4 className="font-black text-emerald-900 uppercase tracking-widest text-[11px] mb-4">Verification Shield</h4>
               <p className="text-xs text-emerald-700/80 leading-relaxed mb-6">Establish absolute trust. Verified partners get 3.5x higher click-through rates and exclusive access to customer heatmaps.</p>
               <div className="text-2xl font-black text-emerald-900">$29.99<span className="text-[10px] font-medium opacity-50 ml-1">/month</span></div>
            </div>
          </div>

          <div className="bg-slate-900 p-10 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none text-8xl">📈</div>
            {hasApplied ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">🚀</div>
                <h4 className="font-black text-white text-xl mb-2">Partnership Hub Initialized</h4>
                <p className="text-slate-400 text-sm">Our onboarding team will contact you to set up your bidding dashboard.</p>
              </div>
            ) : (
              <div className="relative z-10">
                <h4 className="font-black text-white text-xl mb-2">Join the Lujora Ecosystem</h4>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">Position your business in front of local customers exactly when they are searching for what you offer.</p>
                <button 
                  onClick={handleApply}
                  disabled={isApplying}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-indigo-600 transition-all flex items-center justify-center space-x-3 shadow-2xl shadow-indigo-900/40"
                >
                  {isApplying ? 'Initiating Application...' : 'Apply for Merchant Verification'}
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center px-4">
             <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Global Node Network</div>
             <div className="flex space-x-4">
               <a href="mailto:lujoratechnologies@outlook.com" className="text-xs font-black text-indigo-600">Email Sales</a>
               <a href="tel:+234703803157" className="text-xs font-black text-indigo-600">Call Support</a>
             </div>
          </div>
        </div>
      ),
    },
    help: {
      title: 'Merchant Portal Help',
      shortTitle: 'Technical Support',
      body: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white border border-slate-200 p-6 rounded-3xl hover:border-indigo-200 transition-all group">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-lg mb-4 group-hover:scale-110 transition-transform">📊</div>
                <h5 className="font-black text-slate-900 text-sm mb-2">Managing Bids</h5>
                <p className="text-slate-400 text-[11px] leading-relaxed">Learn how to adjust your daily bid in the SuperAdmin Hub to increase your visibility density globally.</p>
             </div>
             <div className="bg-white border border-slate-200 p-6 rounded-3xl hover:border-indigo-200 transition-all group">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-lg mb-4 group-hover:scale-110 transition-transform">✅</div>
                <h5 className="font-black text-slate-900 text-sm mb-2">Verification Flow</h5>
                <p className="text-slate-400 text-[11px] leading-relaxed">Understanding the 'Pending' vs 'Active' status and how to expedite your Lujora verification shield.</p>
             </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl">🛠️</div>
              <div>
                <h4 className="font-black text-white text-lg leading-tight">Priority Tech Support</h4>
                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest">Global Support Active</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs mb-8 leading-relaxed">Experiencing issues with your business profile or map coordinates? Our engineering team is available 24/7 for technical remediation worldwide.</p>
            <a 
              href="mailto:lujoratechnologies@outlook.com?subject=TECHNICAL SUPPORT - [Business Name]"
              className="inline-flex w-full items-center justify-center py-4 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all"
            >
              Open Technical Ticket
            </a>
          </div>

          <div className="text-center">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              Lujora Platform v2.5.0 • Global Node Support
            </p>
          </div>
        </div>
      )
    },
    economics: {
        title: 'Platform Economics',
        body: (
            <div className="space-y-6">
                <p className="text-slate-600 text-sm leading-relaxed">NEARBY operates on a proof-of-value model. We don't charge for discovery; we charge for accelerated reach and verified status.</p>
                <div className="p-6 bg-slate-50 rounded-3xl">
                    <h4 className="font-black text-[10px] uppercase text-indigo-600 mb-4">Core Revenue Channels</h4>
                    <ul className="space-y-3">
                        <li className="flex justify-between text-xs font-bold text-slate-800">
                            <span>Visibility Bidding</span>
                            <span className="text-indigo-600">$1.50+ /day</span>
                        </li>
                        <li className="flex justify-between text-xs font-bold text-slate-800">
                            <span>Verification SaaS</span>
                            <span className="text-indigo-600">$29.99 /mo</span>
                        </li>
                    </ul>
                </div>
            </div>
        )
    }
  };

  const active = content[type];

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
