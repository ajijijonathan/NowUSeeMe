
import React, { useState, useMemo, useEffect } from 'react';
import { MerchantRequest, Report, Review, PlatformInsights, CATEGORIES, LanguageCode, TRANSLATIONS } from '../types';

interface AdminPortalProps {
  merchants: MerchantRequest[];
  setMerchants: (merchants: MerchantRequest[]) => void;
  onClose: () => void;
  language?: LanguageCode;
}

type TabType = 'insights' | 'merchants' | 'applications' | 'reports' | 'reviews' | 'economics' | 'domains';

const AdminPortal: React.FC<AdminPortalProps> = ({ merchants = [], setMerchants, onClose, language = 'en' }) => {
  const [activeTab, setActiveTab] = useState<TabType>('insights');
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [insights, setInsights] = useState<PlatformInsights | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const safeMerchants = Array.isArray(merchants) ? merchants : [];
  const t = (key: string) => TRANSLATIONS[language][key] || key;

  useEffect(() => {
    const loadData = () => {
      const savedReports = JSON.parse(localStorage.getItem('nearby_reports') || '[]');
      setReports(savedReports);

      const savedInsights = localStorage.getItem('nearby_platform_insights');
      if (savedInsights) {
        setInsights(JSON.parse(savedInsights));
      }

      const reviews: Review[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('nearby_reviews_')) {
          try {
            const itemReviews = JSON.parse(localStorage.getItem(key) || '[]');
            reviews.push(...itemReviews);
          } catch (e) {
            console.error("Failed to parse reviews for key", key);
          }
        }
      }
      setAllReviews(reviews.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0)));
    };

    loadData();
  }, [activeTab]);

  const filteredMerchants = useMemo(() => {
    return safeMerchants.filter(m => 
      m.status === 'active' && 
      (m.businessName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [safeMerchants, searchTerm]);

  const pendingApplications = useMemo(() => {
    return safeMerchants.filter(m => m.status === 'pending');
  }, [safeMerchants]);

  // Insights Calculations
  const topTerms = useMemo(() => {
    if (!insights?.topSearchTerms) return [];
    return Object.entries(insights.topSearchTerms)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 6);
  }, [insights]);

  const categoryPulse = useMemo(() => {
    if (!insights?.categoryEngagement) return [];
    return Object.entries(insights.categoryEngagement)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 6);
  }, [insights]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const tabs: {id: TabType, label: string}[] = [
    { id: 'insights', label: t('adminInsights') },
    { id: 'merchants', label: t('adminMerchants') },
    { id: 'applications', label: t('adminApplications') },
    { id: 'reports', label: t('adminReports') },
    { id: 'reviews', label: t('adminReviews') },
    { id: 'economics', label: t('adminEconomics') },
    { id: 'domains', label: t('adminDomains') }
  ];

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-7xl h-[92vh] rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col transform transition-all">
        <div className="bg-slate-900 p-8 flex justify-between items-center shrink-0 border-b border-white/5">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-indigo-400 rounded-2xl flex items-center justify-center font-black text-white text-3xl shadow-lg ring-4 ring-indigo-500/20">L</div>
            <div>
              <h2 className="text-white text-xl font-black brand-font tracking-tight">Lujora <span className="text-indigo-400">Hub</span></h2>
              <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1 flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                Global Control Node Active
              </p>
            </div>
          </div>
          <div className="flex bg-slate-800 p-1.5 rounded-2xl space-x-1 border border-slate-700 overflow-x-auto no-scrollbar max-w-[60%]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative shrink-0 ${
                  activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all hover:bg-rose-600">✕</button>
        </div>

        <div className="flex-grow overflow-hidden flex flex-col p-8 lg:p-12 space-y-8 bg-slate-50/50">
          <div className="flex-grow overflow-y-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-sm custom-scrollbar p-10 relative">
             
             {activeTab === 'insights' && (
               <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Ecosystem Intelligence</h3>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Real-time engagement metrics from the global discovery layer</p>
                    </div>
                    <span className="px-4 py-2 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-xl border border-slate-200">Session Status: Synced</span>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-200">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{t('globalClicks')}</p>
                      <h4 className="text-4xl font-black">{insights?.totalStoreClicks || 0}</h4>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{t('searchQueries')}</p>
                      <h4 className="text-4xl font-black">{insights?.totalSearches || 0}</h4>
                    </div>
                    <div className="bg-white border-2 border-slate-100 p-8 rounded-[2rem] shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('activePartners')}</p>
                      <h4 className="text-4xl font-black text-slate-900">{safeMerchants.filter(m => m.status === 'active').length}</h4>
                    </div>
                    <div className="bg-emerald-50 border-2 border-emerald-100 p-8 rounded-[2rem] shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">{t('dailyYield')}</p>
                      <h4 className="text-4xl font-black text-emerald-700">₦{(safeMerchants.filter(m => m.status === 'active').reduce((acc, m) => acc + (Number(m.bidAmount) || 0), 0)).toLocaleString()}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Trending Search Terms */}
                    <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-400 mb-8 flex items-center">
                        <span className="mr-2">🔥</span> {t('trendingIntents')}
                      </h4>
                      <div className="space-y-8">
                        {topTerms.length > 0 ? topTerms.map(([term, count]) => (
                          <div key={term} className="group cursor-default">
                            <div className="flex justify-between items-center text-xs font-bold capitalize mb-3">
                              <span className="text-slate-200 group-hover:text-white transition-colors">{term}</span>
                              <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg">{count} Queries</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2">
                               <div className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min((Number(count) / 50) * 100, 100)}%` }}></div>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-10 text-slate-500 text-xs italic">Awaiting discovery logs...</div>
                        )}
                      </div>
                    </div>

                    {/* Category Engagement */}
                    <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-sm">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center">
                        <span className="mr-2">📈</span> Sector Pulse
                      </h4>
                      <div className="space-y-8">
                        {categoryPulse.length > 0 ? categoryPulse.map(([cat, count]) => (
                          <div key={cat} className="group cursor-default">
                            <div className="flex justify-between items-center text-xs font-bold capitalize mb-3">
                              <span className="text-slate-600 group-hover:text-indigo-600 transition-colors">{cat}</span>
                              <span className="text-slate-400">{count} Clicks</span>
                            </div>
                            <div className="w-full bg-slate-50 rounded-full h-2 border border-slate-100">
                               <div className="bg-slate-900 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min((Number(count) / 50) * 100, 100)}%` }}></div>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-10 text-slate-300 text-xs italic">No sector engagement detected.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Daily Trend Summary */}
                  <div className="bg-indigo-50/30 border border-indigo-100 p-10 rounded-[2.5rem]">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-400 mb-6">Recent Activity Trend</h4>
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                      {insights?.dailyActivity?.slice(-7).map((day, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-indigo-100 text-center shadow-sm">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">{day.date.split('-').slice(1).join('/')}</p>
                          <p className="text-lg font-black text-indigo-600">{day.searches + day.clicks}</p>
                          <p className="text-[8px] font-bold text-slate-300 uppercase">Ops</p>
                        </div>
                      ))}
                      {(!insights?.dailyActivity || insights.dailyActivity.length === 0) && (
                        <p className="col-span-full text-center text-[10px] text-slate-400 py-4 uppercase font-bold tracking-widest">Awaiting historical data synchronization...</p>
                      )}
                    </div>
                  </div>
               </div>
             )}

             {activeTab === 'merchants' && (
               <div className="space-y-8">
                 <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black text-slate-900">Active Ecosystem Partners</h3>
                    <input 
                      type="text" 
                      placeholder="Filter by name..." 
                      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-100"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    {filteredMerchants.map(m => (
                      <div key={m.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-indigo-100 transition-all">
                        <div className="flex items-center space-x-6">
                           <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-slate-100 font-bold text-slate-900">{m.businessName[0]}</div>
                           <div>
                              <h5 className="font-black text-slate-900">{m.businessName}</h5>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.category} • Member since {m.appliedDate}</p>
                           </div>
                        </div>
                        <div className="text-right flex items-center space-x-8">
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Daily Bid</p>
                              <p className="font-black text-indigo-600">₦{m.bidAmount.toLocaleString()}</p>
                           </div>
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${m.billingStatus === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{m.billingStatus || 'paid'}</span>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
             )}

             {activeTab === 'domains' && (
               <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="max-w-3xl">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">{t('domainMapping')}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      To map <code className="bg-slate-100 px-2 py-0.5 rounded text-indigo-600 font-bold">usenearby.com.ng</code> to your Lujora instance, login to your domain registrar (e.g. Whogohost, GoDaddy) and update your DNS records as shown below.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* A Record */}
                    <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-center group hover:border-indigo-200 transition-all">
                      <div className="flex items-center space-x-6">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-600 border border-slate-100 shadow-sm">A</div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Host / Name</p>
                          <p className="text-lg font-black text-slate-900">@</p>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex-grow max-w-md mx-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Points to (Value)</p>
                        <p className="text-lg font-mono font-bold text-slate-700 bg-white border border-slate-100 px-4 py-2 rounded-xl truncate">76.76.21.21</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard('76.76.21.21', 'a-record')}
                        className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-indigo-600 transition-all"
                      >
                        {isCopied === 'a-record' ? 'COPIED!' : 'COPY VALUE'}
                      </button>
                    </div>

                    {/* CNAME Record */}
                    <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-center group hover:border-indigo-200 transition-all">
                      <div className="flex items-center space-x-6">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-600 border border-slate-100 shadow-sm">CNAME</div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Host / Name</p>
                          <p className="text-lg font-black text-slate-900">www</p>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex-grow max-w-md mx-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Points to (Value)</p>
                        <p className="text-lg font-mono font-bold text-slate-700 bg-white border border-slate-100 px-4 py-2 rounded-xl truncate">cname.lujora.io</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard('cname.lujora.io', 'cname-record')}
                        className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-indigo-600 transition-all"
                      >
                        {isCopied === 'cname-record' ? 'COPIED!' : 'COPY VALUE'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2rem] flex items-start space-x-6">
                    <span className="text-3xl">⏳</span>
                    <div>
                      <h4 className="font-black text-amber-900 text-sm uppercase tracking-widest mb-1">Propagation Notice</h4>
                      <p className="text-amber-700 text-xs leading-relaxed font-medium">
                        DNS changes can take up to 24-48 hours to propagate globally. You can monitor the status using tools like <a href="https://dnschecker.org" target="_blank" className="underline font-bold">DNS Checker</a>. Once propagated, Lujora will automatically provision an SSL certificate for your new domain.
                      </p>
                    </div>
                  </div>
               </div>
             )}
          </div>
        </div>

        <div className="p-8 bg-slate-900 border-t border-white/5 flex justify-between items-center shrink-0">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lujora Hub v2.5.0-STABLE • Global Authorization</p>
           <button onClick={onClose} className="bg-indigo-600 text-white px-12 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-rose-600 transition-all shadow-xl shadow-indigo-500/10">Disconnect Session</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
