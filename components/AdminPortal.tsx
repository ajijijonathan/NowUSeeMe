
import React, { useState, useMemo, useEffect } from 'react';
import { MerchantRequest, Report, Review, PlatformInsights, CATEGORIES } from '../types';

interface AdminPortalProps {
  merchants: MerchantRequest[];
  setMerchants: (merchants: MerchantRequest[]) => void;
  onClose: () => void;
}

type TabType = 'merchants' | 'applications' | 'reports' | 'reviews' | 'insights' | 'economics';

const AdminPortal: React.FC<AdminPortalProps> = ({ merchants = [], setMerchants, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('insights');
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [insights, setInsights] = useState<PlatformInsights | null>(null);

  const safeMerchants = Array.isArray(merchants) ? merchants : [];

  // Load Reports, Reviews, and Insights from localStorage
  useEffect(() => {
    const savedReports = JSON.parse(localStorage.getItem('nearby_reports') || '[]');
    setReports(savedReports);

    const savedInsights = localStorage.getItem('nearby_platform_insights');
    if (savedInsights) {
      try {
        setInsights(JSON.parse(savedInsights));
      } catch (e) {
        console.error("Failed to parse insights", e);
      }
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
    // Fix: Ensure comparison works with potentially undefined timestamps
    setAllReviews(reviews.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0)));
  }, [activeTab]);

  const filteredMerchants = useMemo(() => {
    return safeMerchants.filter(m => 
      (m.businessName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [safeMerchants, searchTerm]);

  const stats = useMemo(() => {
    const activeMerchants = safeMerchants.filter(m => m.status === 'active');
    const pendingMerchants = safeMerchants.filter(m => m.status === 'pending');
    
    return {
      dailyRevenue: activeMerchants.reduce((acc, m) => acc + (Number(m.bidAmount) || 0), 0),
      monthlySubscriptionRev: activeMerchants.length * 29.99,
      active: activeMerchants.length,
      pending: pendingMerchants.length,
      reportsCount: reports.length,
    };
  }, [safeMerchants, reports]);

  const approveMerchant = (id: string) => {
    setMerchants(safeMerchants.map(m => m.id === id ? { ...m, status: 'active', billingStatus: 'paid' } : m));
  };

  const deleteMerchant = (id: string) => {
    if (confirm("Remove business from ecosystem? This action cannot be undone.")) {
      setMerchants(safeMerchants.filter(m => m.id !== id));
    }
  };

  const suspendFromReport = (report: Report) => {
    if (confirm(`Are you sure you want to suspend "${report.placeTitle}"?`)) {
      const merchantToSuspect = safeMerchants.find(m => m.businessName === report.placeTitle);
      if (merchantToSuspect) {
        setMerchants(safeMerchants.filter(m => m.id !== merchantToSuspect.id));
        dismissReport(report.id);
        alert(`${report.placeTitle} has been suspended.`);
      } else {
        alert("External listing dismissed from reports.");
        dismissReport(report.id);
      }
    }
  };

  const dismissReport = (id: string) => {
    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    localStorage.setItem('nearby_reports', JSON.stringify(updated));
  };

  const deleteReview = (reviewId: string, placeUri: string) => {
    if (confirm("Delete this review?")) {
      const storageKey = `nearby_reviews_${btoa(placeUri)}`;
      const placeReviews: Review[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updated = placeReviews.filter(r => r.id !== reviewId);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setAllReviews(allReviews.filter(r => r.id !== reviewId));
    }
  };

  // Helper for rendering horizontal bars for charts
  const renderBar = (val: number, max: number, color: string = 'bg-indigo-500') => {
    const percentage = max > 0 ? (val / max) * 100 : 0;
    return (
      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
        <div className={`${color} h-1.5 rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  const topTerms = useMemo(() => {
    if (!insights || !insights.topSearchTerms) return [];
    return Object.entries(insights.topSearchTerms)
      .sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0))
      .slice(0, 5);
  }, [insights]);

  // Fix: Ensure Math.max handles number values correctly to avoid unknown/type errors
  const maxSearchCount = topTerms.length > 0 ? Math.max(...topTerms.map(t => Number(t[1]) || 0), 1) : 1;

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-7xl h-[92vh] rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col transform transition-all">
        {/* Header */}
        <div className="bg-slate-900 p-8 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-indigo-400 rounded-2xl flex items-center justify-center font-black text-white text-3xl shadow-lg">L</div>
            <div>
              <h2 className="text-white text-xl font-black brand-font tracking-tight">Lujora <span className="text-indigo-400">Hub</span></h2>
              <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1 flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                Ecosystem Insights Active
              </p>
            </div>
          </div>
          <div className="flex bg-slate-800 p-1.5 rounded-2xl space-x-1 border border-slate-700">
            {(['insights', 'merchants', 'applications', 'reports', 'reviews', 'economics'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${
                  activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
                {tab === 'reports' && reports.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-800 font-black">
                    {reports.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all hover:bg-rose-600">✕</button>
        </div>

        <div className="flex-grow overflow-hidden flex flex-col p-8 lg:p-12 space-y-8 bg-slate-50/30">
          {/* Revenue Statistics Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
               <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-1">Global Clicks</p>
               <h4 className="text-2xl font-black text-slate-900">{insights?.totalStoreClicks || 0}</h4>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
               <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-1">Search Requests</p>
               <h4 className="text-2xl font-black text-slate-900">{insights?.totalSearches || 0}</h4>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Verified Revenue</p>
               <h4 className="text-2xl font-black text-slate-900">${stats.dailyRevenue.toFixed(0)}/d</h4>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
               <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mb-1">Platform Status</p>
               <h4 className="text-2xl font-black text-slate-900">HEALTHY</h4>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-sm relative custom-scrollbar p-10">
             
             {activeTab === 'insights' && (
               <div className="space-y-12">
                  <h3 className="text-2xl font-black text-slate-900">User Behavior Intelligence</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Top Searches */}
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Trending Search Terms</h4>
                      <div className="space-y-6">
                        {topTerms.length > 0 ? topTerms.map(([term, count]) => (
                          <div key={term}>
                            <div className="flex justify-between items-center text-xs font-bold text-slate-800 capitalize">
                              <span>{term}</span>
                              <span className="text-indigo-600">{count} queries</span>
                            </div>
                            {renderBar(Number(count) || 0, maxSearchCount)}
                          </div>
                        )) : (
                          <p className="text-xs text-slate-400 italic">No search data recorded yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Category Engagement */}
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 lg:col-span-2">
                       <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Engagement by Category</h4>
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                         {CATEGORIES.map(cat => {
                           const engagement = Number(insights?.categoryEngagement?.[cat.id]) || 0;
                           // Fix: Handle arithmetic operation with definite number conversion to avoid type errors
                           const engagementValues = insights?.categoryEngagement ? Object.values(insights.categoryEngagement).map(v => Number(v) || 0) : [0];
                           const maxEng = Math.max(...engagementValues, 1);
                           return (
                             <div key={cat.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                               <span className="text-3xl mb-2">{cat.icon}</span>
                               <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{cat.label}</span>
                               <span className="text-lg font-black text-indigo-600 mt-1">{engagement}</span>
                               <div className="w-full mt-3">
                                 {renderBar(engagement, maxEng, 'bg-emerald-500')}
                               </div>
                             </div>
                           )
                         })}
                       </div>
                    </div>
                  </div>

                  {/* Daily Activity Chart - Mock visual with HTML/CSS */}
                  <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-12 opacity-5 text-9xl font-black pointer-events-none">30D</div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-400 mb-8">Daily Traffic Density (Last 30 Days)</h4>
                    <div className="flex items-end justify-between h-40 gap-1">
                      {insights?.dailyActivity?.map((day, idx) => {
                        // Fix: Explicit conversion for calculation to prevent "left-hand side" arithmetic errors
                        const currentMax = insights?.dailyActivity ? Math.max(...insights.dailyActivity.map(d => (Number(d.searches) || 0) + (Number(d.clicks) || 0)), 1) : 1;
                        const dayValue = (Number(day.searches) || 0) + (Number(day.clicks) || 0);
                        const h = (dayValue / currentMax) * 100;
                        return (
                          <div key={idx} className="flex-1 group relative">
                            <div 
                              className="w-full bg-indigo-500/30 rounded-t-sm hover:bg-indigo-400 transition-all cursor-help" 
                              style={{ height: `${h}%` }}
                            >
                              <div 
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-slate-900 text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-xl"
                              >
                                {day.date}: {dayValue} events
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      {(!insights || !insights.dailyActivity || insights.dailyActivity.length === 0) && (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 uppercase tracking-widest text-[10px] font-black">
                          Awaiting behavioral data...
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
                      <span>30 Days Ago</span>
                      <span>Real-time Pulse</span>
                    </div>
                  </div>
               </div>
             )}

             {activeTab === 'merchants' && (
               <div className="space-y-8">
                  <div className="flex justify-between items-center px-2">
                    <h3 className="text-xl font-black text-slate-800">Partner Visibility Management</h3>
                    <input type="text" placeholder="Search partners..." className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-2 text-xs font-medium w-64 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <th className="pb-4 px-4">Business</th>
                        <th className="pb-4 px-4">AI Bid ($)</th>
                        <th className="pb-4 px-4">Status</th>
                        <th className="pb-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredMerchants.map(m => (
                        <tr key={m.id} className="text-sm hover:bg-slate-50 transition-colors">
                          <td className="py-5 px-4">
                            <div className="font-bold text-slate-800">{m.businessName}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-black">{m.category}</div>
                          </td>
                          <td className="py-5 px-4 font-mono font-black text-indigo-600">${(Number(m.bidAmount) || 0).toFixed(2)}</td>
                          <td className="py-5 px-4">
                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase text-emerald-600 bg-emerald-50">ACTIVE</span>
                          </td>
                          <td className="py-5 px-4 text-right">
                             <button onClick={() => deleteMerchant(m.id)} className="text-rose-500 hover:text-rose-700 font-black text-[10px] uppercase transition-colors">Suspend</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
             )}

             {activeTab === 'reports' && (
               <div className="space-y-8">
                  <h3 className="text-xl font-black text-slate-800">System Integrity Reports</h3>
                  <div className="space-y-4">
                    {reports.length > 0 ? reports.map(report => (
                      <div key={report.id} className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center group hover:bg-white hover:shadow-lg transition-all">
                        <div>
                          <h4 className="font-black text-slate-900">{report.placeTitle}</h4>
                          <p className="text-slate-500 text-xs italic">" {report.reason} "</p>
                        </div>
                        <div className="flex space-x-3 mt-4 md:mt-0">
                          <button onClick={() => dismissReport(report.id)} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase hover:bg-emerald-50 hover:text-emerald-600 transition-all">Dismiss</button>
                          <button onClick={() => suspendFromReport(report)} className="px-6 py-2 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-rose-700 transition-all shadow-lg shadow-rose-100">Suspend</button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-24 text-slate-400">
                        <div className="text-5xl mb-4">🛡️</div>
                        <p className="font-black uppercase tracking-widest text-xs">Ecosystem is clean</p>
                      </div>
                    )}
                  </div>
               </div>
             )}

             {activeTab === 'reviews' && (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {allReviews.map(review => (
                   <div key={review.id} className="bg-white border border-slate-100 p-6 rounded-3xl relative group">
                     <div className="flex justify-between mb-4">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{review.placeTitle}</p>
                        <button onClick={() => deleteReview(review.id, review.placeUri || '')} className="text-rose-400 hover:text-rose-600">🗑️</button>
                     </div>
                     <p className="text-slate-600 text-sm font-medium">"{review.text}"</p>
                     <div className="mt-4 text-[9px] text-slate-400 font-black uppercase">BY: {review.author}</div>
                   </div>
                 ))}
               </div>
             )}

             {activeTab === 'economics' && (
               <div className="max-w-2xl mx-auto py-12 text-center">
                  <h3 className="text-3xl font-black text-slate-800 mb-8">Ecosystem Monetization</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200">
                      <div className="text-4xl mb-4">📊</div>
                      <h4 className="font-black text-slate-900 mb-2">Bidding Model</h4>
                      <p className="text-xs text-slate-500">Accelerated search ranking via daily budget allocation.</p>
                    </div>
                    <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white">
                      <div className="text-4xl mb-4">🛡️</div>
                      <h4 className="font-black text-white mb-2">SaaS Shield</h4>
                      <p className="text-xs text-slate-400">Flat subscription for merchant verification badges.</p>
                    </div>
                  </div>
               </div>
             )}

             {activeTab === 'applications' && (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                   {stats.pending > 0 ? (
                      <div className="w-full space-y-4">
                        {safeMerchants.filter(m => m.status === 'pending').map(m => (
                          <div key={m.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex justify-between items-center">
                            <div>
                               <p className="font-black text-slate-800 text-lg">{m.businessName}</p>
                               <p className="text-[10px] text-slate-400 uppercase font-black">{m.category}</p>
                            </div>
                            <button onClick={() => approveMerchant(m.id)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-700 transition-all">Approve & Bill</button>
                          </div>
                        ))}
                      </div>
                   ) : (
                     <div className="text-center text-slate-400">
                        <div className="text-6xl mb-4">🏜️</div>
                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">No Pending Requests</h4>
                     </div>
                   )}
                </div>
             )}
          </div>
        </div>

        <div className="p-8 bg-slate-900 border-t border-white/5 flex justify-between items-center shrink-0">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">© 2024 Lujora Core Hub</p>
           <button onClick={onClose} className="bg-white text-slate-900 px-12 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all shadow-xl">Exit Secure Cluster</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
