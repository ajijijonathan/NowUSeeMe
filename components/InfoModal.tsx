
import React, { useState } from 'react';

type InfoType = 'terms' | 'privacy' | 'contact';

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
      window.location.href = "mailto:lujoratechnologies@outlook.com?subject=Merchant Partnership Application - Now U See Me";
    }, 1500);
  };

  const content = {
    terms: {
      title: 'Governance Terms',
      body: (
        <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
          <section>
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-2">1. Ecosystem Usage</h4>
            <p>Now U See Me is an AI discovery layer. Usage of our API-driven search constitutes acceptance of real-time location processing as per Lujora Technologies governance standards.</p>
          </section>
          <section>
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-2">2. Merchant Integrity</h4>
            <p>Partners and merchants appearing on the platform undergo automated verification. Promoted content is clearly labeled to maintain transparency.</p>
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
            <p>All interactions between your browser and the Gemini LLM are encrypted via TLS 1.3, ensuring search queries remain private.</p>
          </section>
        </div>
      ),
    },
    contact: {
      title: 'Partner Inquiries',
      body: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 flex flex-col justify-between">
              <div>
                <h4 className="font-black text-indigo-900 uppercase tracking-widest text-[11px] mb-4">Direct Support</h4>
                <div className="space-y-4">
                  <a href="mailto:lujoratechnologies@outlook.com" className="block text-indigo-700 text-sm hover:underline font-black truncate">lujoratechnologies@outlook.com</a>
                  <a href="tel:+234703803157" className="block text-indigo-700 text-lg hover:underline font-black">+234 70 380 3157</a>
                </div>
              </div>
              <p className="text-indigo-400 text-[10px] font-medium mt-6">Lujora Technologies Support HQ</p>
            </div>
            
            <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
              <h4 className="font-black text-indigo-400 uppercase tracking-widest text-[11px] mb-4">Why Partner?</h4>
              <ul className="space-y-4 text-xs font-medium text-slate-400">
                <li className="flex items-center"><span className="text-indigo-500 mr-2">✔</span> Priority AI Ranking</li>
                <li className="flex items-center"><span className="text-indigo-500 mr-2">✔</span> Interactive Map Pins</li>
                <li className="flex items-center"><span className="text-indigo-500 mr-2">✔</span> Real-time Traffic Data</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 relative overflow-hidden">
            {hasApplied ? (
              <div className="text-center py-6 animate-in fade-in zoom-in duration-700">
                <div className="text-5xl mb-4">🚀</div>
                <h4 className="font-black text-slate-900 text-xl mb-2">Application Transmitted</h4>
                <p className="text-slate-500 text-sm">Lujora's onboarding specialists will contact you at your registered mail shortly.</p>
              </div>
            ) : (
              <>
                <h4 className="font-black text-slate-900 text-lg mb-2">Apply for Verification</h4>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">Join the hyper-local discovery engine. Official partners receive a blue verification shield and 5x more visibility.</p>
                <button 
                  onClick={handleApply}
                  disabled={isApplying}
                  className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3 ${
                    isApplying 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-slate-900 text-white hover:bg-indigo-600 hover:scale-[1.02] shadow-xl shadow-slate-200'
                  }`}
                >
                  {isApplying ? (
                    <>
                      <span className="w-5 h-5 border-4 border-slate-400 border-t-indigo-600 rounded-full animate-spin"></span>
                      <span>Processing Credentials...</span>
                    </>
                  ) : 'Start Merchant Application'}
                </button>
              </>
            )}
          </div>
        </div>
      ),
    },
  };

  const active = content[type];

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
        <div className="px-10 pt-10 pb-6 flex justify-between items-center shrink-0">
          <h2 className="brand-font text-3xl font-black text-slate-900 tracking-tighter">{active.title}</h2>
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
