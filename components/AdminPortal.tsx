
import React, { useState, useMemo } from 'react';
import { MerchantRequest } from '../types';

interface AdminPortalProps {
  merchants: MerchantRequest[];
  setMerchants: (merchants: MerchantRequest[]) => void;
  onClose: () => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ merchants = [], setMerchants, onClose }) => {
  const [activeTab, setActiveTab] = useState<'merchants' | 'applications' | 'economics'>('merchants');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newMerchant, setNewMerchant] = useState({ name: '', category: 'Food & Drink', bid: '1.50' });

  const safeMerchants = Array.isArray(merchants) ? merchants : [];

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
    };
  }, [safeMerchants]);

  const approveMerchant = (id: string) => {
    setMerchants(safeMerchants.map(m => m.id === id ? { ...m, status: 'active', billingStatus: 'paid' } : m));
  };

  const deleteMerchant = (id: string) => {
    if (confirm("Remove business from ecosystem?")) {
      setMerchants(safeMerchants.filter(m => m.id !== id));
    }
  };

  const handleAddMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    const m: MerchantRequest = {
      id: Date.now().toString(),
      businessName: newMerchant.name,
      status: 'pending',
      bidAmount: parseFloat(newMerchant.bid) || 1.50,
      category: newMerchant.category,
      appliedDate: new Date().toISOString().split('T')[0]
    };
    setMerchants([...safeMerchants, m]);
    setIsAdding(false);
    setNewMerchant({ name: '', category: 'Food & Drink', bid: '1.50' });
  };

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
                Ecosystem Economics Active
              </p>
            </div>
          </div>
          <div className="flex bg-slate-800 p-1.5 rounded-2xl space-x-1 border border-slate-700">
            {(['merchants', 'applications', 'economics'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all hover:bg-rose-600"
          >
            ✕
          </button>
        </div>

        <div className="flex-grow overflow-hidden flex flex-col p-8 lg:p-12 space-y-8 bg-slate-50/30">
          {/* Revenue Statistics Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
               <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-1">Daily Bid Volume</p>
               <h4 className="text-3xl font-black text-slate-900">${stats.dailyRevenue.toFixed(2)}<span className="text-sm font-medium text-slate-400 ml-2">USD/day</span></h4>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
               <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-1">MRR (Verified Subscriptions)</p>
               <h4 className="text-3xl font-black text-slate-900">${stats.monthlySubscriptionRev.toFixed(2)}<span className="text-sm font-medium text-slate-400 ml-2">USD/mo</span></h4>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Verified Partners</p>
               <h4 className="text-3xl font-black text-slate-900">{stats.active}</h4>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-sm relative custom-scrollbar">
             {activeTab === 'merchants' && (
               <div className="p-8">
                  <div className="flex justify-between items-center mb-8 px-2">
                    <h3 className="text-xl font-black text-slate-800">Partner Visibility Management</h3>
                    <div className="flex space-x-3">
                       <input 
                        type="text" 
                        placeholder="Search partners..." 
                        className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-2 text-xs font-medium w-64 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <th className="pb-4 px-4">Business</th>
                          <th className="pb-4 px-4">AI Bid ($)</th>
                          <th className="pb-4 px-4">Visibility Weight</th>
                          <th className="pb-4 px-4">Billing</th>
                          <th className="pb-4 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredMerchants.length > 0 ? filteredMerchants.map(m => (
                          <tr key={m.id} className="text-sm hover:bg-slate-50 transition-colors group">
                            <td className="py-5 px-4">
                              <div className="font-bold text-slate-800">{m.businessName}</div>
                              <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{m.category}</div>
                            </td>
                            <td className="py-5 px-4 font-mono font-black text-indigo-600">
                              ${(m.bidAmount || 0).toFixed(2)}
                            </td>
                            <td className="py-5 px-4">
                               <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${Math.min(((Number(m.bidAmount) || 0) / 20) * 100, 100)}%` }}></div>
                               </div>
                            </td>
                            <td className="py-5 px-4">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${m.billingStatus === 'paid' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                                {m.billingStatus || 'N/A'}
                              </span>
                            </td>
                            <td className="py-5 px-4 text-right">
                               <button onClick={() => deleteMerchant(m.id)} className="text-rose-500 hover:text-rose-700 font-black text-[10px] uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100">Suspend</button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={5} className="py-24 text-center text-slate-400 italic font-medium">No verified partners matching search criteria.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
               </div>
             )}

             {activeTab === 'economics' && (
               <div className="p-12">
                  <div className="max-w-3xl mx-auto space-y-12">
                     <div className="text-center">
                        <h3 className="text-3xl font-black text-slate-800 mb-4">NEARBY Monetization Engine</h3>
                        <p className="text-slate-500 leading-relaxed text-lg">The Lujora ecosystem is powered by two main revenue streams that ensure fair competition and data integrity.</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-200 hover:border-indigo-200 transition-all">
                           <div className="text-4xl mb-6">📈</div>
                           <h4 className="text-xl font-black text-slate-800 mb-2">Auctioned Visibility</h4>
                           <p className="text-xs text-slate-500 leading-relaxed mb-6">Merchants bid for priority placement in AI search results. The model weighs [Bid Amount] vs [User Distance] to provide the most relevant, profitable result.</p>
                           <div className="pt-6 border-t border-slate-200">
                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Global Avg. Bid: $1.84</p>
                           </div>
                        </div>
                        <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl">
                           <div className="text-4xl mb-6">🛡️</div>
                           <h4 className="text-xl font-black mb-2 text-white">Verification SaaS</h4>
                           <p className="text-xs text-slate-400 leading-relaxed mb-6">A flat monthly subscription of $29.99 for the Verification Shield. This generates high-margin recurring revenue while establishing trust in the marketplace.</p>
                           <div className="pt-6 border-t border-slate-800">
                              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Subs: {stats.active}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
             )}

             {activeTab === 'applications' && (
                <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
                   {stats.pending > 0 ? (
                      <div className="w-full max-w-2xl space-y-4">
                        <h3 className="text-xl font-black text-slate-800 mb-6 px-2">Incoming Applications</h3>
                        {safeMerchants.filter(m => m.status === 'pending').map(m => (
                          <div key={m.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex justify-between items-center hover:bg-white hover:shadow-lg transition-all">
                            <div>
                               <p className="font-black text-slate-800 text-lg">{m.businessName}</p>
                               <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Category: {m.category} • Proposed Bid: ${m.bidAmount}</p>
                            </div>
                            <button onClick={() => approveMerchant(m.id)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">Verify & Bill</button>
                          </div>
                        ))}
                      </div>
                   ) : (
                     <div className="text-center bg-slate-50 p-16 rounded-[3rem] border border-dashed border-slate-200">
                        <div className="text-6xl mb-6">🏜️</div>
                        <h4 className="text-xl font-black text-slate-800">No Pending Requests</h4>
                        <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">All partnership applications have been processed and moved to the verified partner database.</p>
                     </div>
                   )}
                </div>
             )}
          </div>
        </div>

        <div className="p-8 bg-slate-900 border-t border-white/5 flex justify-between items-center shrink-0">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">© 2024 Lujora Economics Core • Environment: Production</p>
           <button onClick={onClose} className="bg-white text-slate-900 px-12 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-xl">Exit Secure Hub</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
