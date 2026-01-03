
import React, { useState, useMemo } from 'react';
import { MerchantRequest } from '../types';

interface AdminPortalProps {
  onClose: () => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ onClose }) => {
  const [merchants, setMerchants] = useState<MerchantRequest[]>([
    { id: '1', businessName: "Joe's Pizza Palace", status: 'active', bidAmount: 1.50, category: 'Food', appliedDate: '2024-03-10' },
    { id: '2', businessName: 'QuickFix Plumbing', status: 'pending', bidAmount: 2.75, category: 'Services', appliedDate: '2024-03-12' },
    { id: '3', businessName: 'TechHub Electronics', status: 'active', bidAmount: 1.20, category: 'Shopping', appliedDate: '2024-02-28' },
    { id: '4', businessName: 'Urban Coffee Co.', status: 'active', bidAmount: 0.95, category: 'Food', appliedDate: '2024-03-15' },
    { id: '5', businessName: 'Skyline Gym', status: 'pending', bidAmount: 3.10, category: 'Lifestyle', appliedDate: '2024-03-18' },
  ]);

  const [activeTab, setActiveTab] = useState<'merchants' | 'applications' | 'traffic'>('merchants');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMerchants = useMemo(() => {
    return merchants.filter(m => m.businessName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [merchants, searchTerm]);

  const stats = {
    revenue: 12482.50,
    active: merchants.filter(m => m.status === 'active').length,
    pending: merchants.filter(m => m.status === 'pending').length,
    traffic: "1.2M"
  };

  const approveMerchant = (id: string) => {
    setMerchants(prev => prev.map(m => m.id === id ? { ...m, status: 'active' } : m));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-7xl h-[90vh] rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 flex flex-col">
        {/* Admin Header */}
        <div className="bg-slate-900 p-8 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-indigo-400 rounded-2xl flex items-center justify-center font-black text-white text-3xl shadow-2xl shadow-indigo-500/20">L</div>
            <div>
              <h2 className="text-white text-xl font-black brand-font tracking-tight">Lujora <span className="text-indigo-400">Hub</span></h2>
              <div className="flex items-center mt-1 space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">Platform Management Interface</p>
              </div>
            </div>
          </div>
          
          <div className="flex bg-slate-800 p-1.5 rounded-2xl space-x-1">
            {(['merchants', 'applications', 'traffic'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all">✕</button>
        </div>

        <div className="flex-grow overflow-hidden flex flex-col p-8 lg:p-12 space-y-8">
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-4 gap-6 shrink-0">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
               <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Weekly Gross</p>
               <h4 className="text-2xl font-black text-slate-800">${stats.revenue.toLocaleString()}</h4>
            </div>
            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
               <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-1">Active Partners</p>
               <h4 className="text-2xl font-black text-indigo-900">{stats.active}</h4>
            </div>
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
               <p className="text-amber-500 text-[9px] font-black uppercase tracking-widest mb-1">Pending Approval</p>
               <h4 className="text-2xl font-black text-amber-900">{stats.pending}</h4>
            </div>
            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
               <p className="text-emerald-500 text-[9px] font-black uppercase tracking-widest mb-1">Global Traffic</p>
               <h4 className="text-2xl font-black text-emerald-900">{stats.traffic}</h4>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-grow overflow-y-auto bg-white rounded-[2.5rem] border border-slate-100 shadow-sm relative">
             {activeTab === 'merchants' && (
               <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-black text-slate-800">Merchant Directory</h3>
                    <input 
                      type="text" 
                      placeholder="Filter by name..." 
                      className="bg-slate-100 border-none rounded-2xl px-6 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        <th className="pb-4 px-4">Business</th>
                        <th className="pb-4 px-4">Sector</th>
                        <th className="pb-4 px-4">Daily Bid</th>
                        <th className="pb-4 px-4">Status</th>
                        <th className="pb-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredMerchants.map(m => (
                        <tr key={m.id} className="text-sm hover:bg-slate-50 transition-colors">
                          <td className="py-5 px-4 font-bold text-slate-800">{m.businessName}</td>
                          <td className="py-5 px-4"><span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase">{m.category}</span></td>
                          <td className="py-5 px-4 font-mono font-black text-indigo-600">${m.bidAmount.toFixed(2)}</td>
                          <td className="py-5 px-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${m.status === 'active' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="py-5 px-4 text-right">
                             <button className="text-indigo-600 font-bold text-xs hover:underline">Metrics</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
             )}

             {activeTab === 'applications' && (
               <div className="p-12 text-center h-full flex flex-col items-center justify-center">
                 <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center text-3xl mb-6">📩</div>
                 <h3 className="text-2xl font-black text-slate-800 mb-2">Incoming Applications</h3>
                 <p className="text-slate-500 text-sm max-w-sm mb-8">Review and verify businesses applying to the Now U See Me marketplace.</p>
                 <div className="w-full max-w-2xl bg-slate-50 rounded-3xl p-6 text-left border border-slate-100">
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm mb-3">
                       <div>
                         <p className="font-black text-slate-800 text-sm">Downtown Fresh Market</p>
                         <p className="text-[10px] text-slate-400">Applied via Support Portal • Today</p>
                       </div>
                       <button onClick={() => alert('Merchant Verified!')} className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-700">Verify & Go Live</button>
                    </div>
                 </div>
               </div>
             )}

             {activeTab === 'traffic' && (
               <div className="p-8 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-slate-800">Traffic Heatmap Simulation</h3>
                    <span className="text-[10px] font-black text-indigo-600 animate-pulse">LIVE FEED ACTIVE</span>
                  </div>
                  <div className="flex-grow bg-slate-900 rounded-[2rem] p-8 flex items-center justify-center overflow-hidden relative">
                     <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_rgba(79,70,229,1)_0%,_rgba(0,0,0,1)_100%)]"></div>
                     <div className="relative text-center">
                        <div className="text-5xl mb-4">🌎</div>
                        <p className="text-white text-xl font-black mb-2">Global Search Nodes</p>
                        <p className="text-slate-500 text-sm">Visualizing real-time local search density...</p>
                     </div>
                  </div>
               </div>
             )}
          </div>
        </div>

        {/* Admin Footer */}
        <div className="bg-slate-50 p-8 border-t border-slate-100 flex justify-between items-center shrink-0">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             © 2024 Lujora Technologies Platform Core
           </div>
           <button onClick={onClose} className="bg-slate-900 text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-xl shadow-slate-200">
             Terminate Session
           </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
