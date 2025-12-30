import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Network, 
  Settings2, 
  History, 
  Search, 
  Bell, 
  User, 
  Filter, 
  ArrowUpRight, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight,
  Database,
  BrainCircuit,
  Info,
  Upload,
  X,
  Loader2,
  Sparkles
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

// --- MOCK DATA GENERATION ---
const PROGRAMS = ['Scholarship', 'Pension', 'Public Works', 'Procurement'];
const STATUSES = ['Pending', 'Confirmed Fraud', 'Legitimate', 'Escalated'];

const generateMockCases = (count = 50) => {
  return Array.from({ length: count }, (_, i) => {
    const riskScore = Math.floor(Math.random() * 100);
    const rulesWeight = Math.floor(Math.random() * 40);
    const mlWeight = Math.floor(Math.random() * 40);
    const networkWeight = Math.floor(Math.random() * 20);
    
    return {
      id: `VS-2025-${1000 + i}`,
      entityName: [
        'Aditi Sharma', 'Rajesh Kumar', 'Global Tech Solutions', 'Nirmala Devi', 
        'Suresh Enterprises', 'Vikram Singh', 'Asha Foundation', 'Metro Builders'
      ][Math.floor(Math.random() * 8)] + (i % 3 === 0 ? ' & Co.' : ''),
      program: PROGRAMS[Math.floor(Math.random() * PROGRAMS.length)],
      riskScore,
      riskBreakdown: { rules: rulesWeight, ml: mlWeight, network: networkWeight },
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      amount: Math.floor(Math.random() * 5000000) + 10000,
      dateFlagged: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleDateString(),
      reasons: [
        "Duplicate bank account usage detected",
        "Transaction amount exceeds historical average by 400%",
        "Entity linked to blacklisted vendor 'K-Corp'",
        "High frequency of withdrawals in low-activity periods"
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      evidence: [
        { date: '2024-11-12', description: 'Initial Application Submitted', value: '₹45,000' },
        { date: '2024-12-05', description: 'System Auto-Flag: Rule #412', value: 'High Priority' },
        { date: '2025-01-10', description: 'Unusual Transaction Cluster', value: '₹1,20,000' }
      ]
    };
  });
};

const MOCK_RULES = [
  { id: 1, name: 'SINGLE_BIDDER_TENDER', description: 'Contracts with only one bidder', points: 25, triggers: 142, accuracy: 89, active: true },
  { id: 2, name: 'BANK_SHARING', description: 'Multiple recipients using same bank account', points: 40, triggers: 86, accuracy: 94, active: true },
  { id: 3, name: 'INFLATED_PRICING', description: 'Unit price 200% above district average', points: 30, triggers: 210, accuracy: 62, active: true },
  { id: 4, name: 'PHANTOM_RECIPIENT', description: 'Entity details fail national database check', points: 50, triggers: 45, accuracy: 98, active: true },
];

// --- REUSABLE COMPONENTS ---
const Badge = ({ children, color = 'violet' }) => {
  const colors = {
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    gray: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider font-black border ${colors[color]}`}>
      {children}
    </span>
  );
};

const Card = ({ title, children, className = '', action }) => (
  <div className={`bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl overflow-hidden transition-all duration-300 hover:border-white/10 ${className}`}>
    {title && (
      <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/5">
        <h3 className="font-black text-slate-200 tracking-tight text-xs uppercase">{title}</h3>
        {action}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

// --- MAIN APP ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedCases = localStorage.getItem('vigilant_cases_dark');
    if (savedCases) {
      setCases(JSON.parse(savedCases));
    } else {
      const initial = generateMockCases(60);
      setCases(initial);
      localStorage.setItem('vigilant_cases_dark', JSON.stringify(initial));
    }
    
    const savedHistory = localStorage.getItem('vigilant_history_dark');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = (caseId, status) => {
    const updated = cases.map(c => c.id === caseId ? { ...c, status } : c);
    setCases(updated);
    localStorage.setItem('vigilant_cases_dark', JSON.stringify(updated));
    
    const newLog = {
      caseId,
      status,
      timestamp: new Date().toLocaleString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    const updatedHistory = [newLog, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('vigilant_history_dark', JSON.stringify(updatedHistory));
    
    showToast(`Case ${caseId} updated to ${status}. AI Intelligence Synced.`, status === 'Legitimate' ? 'info' : 'success');
    setSelectedCase(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setTimeout(() => {
      const newCases = generateMockCases(5).map(c => ({
        ...c,
        id: `UPLOAD-${Math.floor(Math.random() * 9000) + 1000}`,
        status: 'Pending'
      }));
      const updated = [...newCases, ...cases];
      setCases(updated);
      localStorage.setItem('vigilant_cases_dark', JSON.stringify(updated));
      setIsUploading(false);
      showToast("Data Batch Successfully Ingested");
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 2000);
  };

  const runNewScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      showToast("System Scan Complete: 4 new anomalies detected.");
    }, 2500);
  };

  const filteredCases = useMemo(() => {
    return cases.filter(c => 
      c.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.program.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.riskScore - a.riskScore);
  }, [cases, searchQuery]);

  const stats = useMemo(() => {
    const highRisk = cases.filter(c => c.riskScore > 75 && c.status === 'Pending').length;
    return {
      highRisk,
      falsePositiveRate: '16.4%',
      moneyAtRisk: '₹5.1 Cr'
    };
  }, [cases]);

  // --- SUB-PAGES ---
  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => { setActiveTab(id); setSelectedCase(null); }}
      className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 relative group ${
        activeTab === id 
        ? 'text-white' 
        : 'text-slate-500 hover:text-slate-200'
      }`}
    >
      {activeTab === id && (
        <div className="absolute inset-0 bg-violet-600 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] z-0"></div>
      )}
      <Icon size={18} className="relative z-10" />
      <span className="font-black text-xs tracking-widest uppercase relative z-10">{label}</span>
    </button>
  );

  const DashboardView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none bg-gradient-to-br from-rose-600 to-rose-900 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Anomalies Detected</p>
              <h4 className="text-4xl font-black mt-2 tracking-tighter">{stats.highRisk}</h4>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <ShieldAlert size={28} />
            </div>
          </div>
          <div className="mt-8 flex items-center text-xs font-black uppercase tracking-widest gap-2">
            <TrendingUp size={16} />
            <span className="opacity-80">Requires Urgent Scrutiny</span>
          </div>
        </Card>
        
        <Card className="border-none bg-gradient-to-br from-violet-600 to-indigo-900 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">System Exposure</p>
              <h4 className="text-4xl font-black mt-2 tracking-tighter">{stats.moneyAtRisk}</h4>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <TrendingUp size={28} />
            </div>
          </div>
          <div className="mt-8 flex items-center text-xs font-black uppercase tracking-widest gap-2">
            <Sparkles size={16} />
            <span className="opacity-80">Target Recovery Phase</span>
          </div>
        </Card>

        <Card className="border-none bg-slate-900 text-white border border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Model Error Rate</p>
              <h4 className="text-4xl font-black mt-2 tracking-tighter">{stats.falsePositiveRate}</h4>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
              <BrainCircuit size={28} />
            </div>
          </div>
          <div className="mt-8 flex items-center text-xs font-black uppercase tracking-widest text-emerald-400 gap-2">
            <CheckCircle2 size={16} />
            <span>Optimization Active</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Heuristic Velocity" className="lg:col-span-2">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: '01/12', risk: 40 }, { name: '05/12', risk: 30 },
                { name: '10/12', risk: 85 }, { name: '15/12', risk: 45 },
                { name: '20/12', risk: 95 }, { name: '25/12', risk: 60 },
                { name: '30/12', risk: 80 },
              ]}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff'}}
                />
                <Area type="monotone" dataKey="risk" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Detection Density">
          <div className="h-[320px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Scholarship', value: 400 },
                    { name: 'Pension', value: 300 },
                    { name: 'Works', value: 300 },
                    { name: 'Contracts', value: 200 },
                  ]}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {[0,1,2,3].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index]} fillOpacity={0.8} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-tighter">
              <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div>
              <span>Scholarship</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-tighter">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span>Pension</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Critical Anomalies" action={<button onClick={() => setActiveTab('queue')} className="text-violet-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Access All Logs</button>}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="pb-4 px-2">Identification</th>
                <th className="pb-4 px-2">Program</th>
                <th className="pb-4 px-2 text-center">Threat Lvl</th>
                <th className="pb-4 px-2 text-right">Magnitude</th>
                <th className="pb-4 px-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {cases.slice(0, 5).sort((a,b) => b.riskScore - a.riskScore).map((c) => (
                <tr key={c.id} className="group hover:bg-white/5 transition-all cursor-pointer" onClick={() => setSelectedCase(c)}>
                  <td className="py-5 px-2">
                    <div className="font-black text-slate-200 tracking-tight">{c.entityName}</div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">{c.id}</div>
                  </td>
                  <td className="py-5 px-2"><Badge color="violet">{c.program}</Badge></td>
                  <td className="py-5 px-2 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-xs bg-slate-800 text-white border border-white/5">
                      {c.riskScore}
                    </div>
                  </td>
                  <td className="py-5 px-2 text-right font-black text-slate-300">₹{c.amount.toLocaleString()}</td>
                  <td className="py-5 px-2 text-right">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-slate-400 group-hover:bg-violet-600 group-hover:text-white">
                      <ChevronRight size={14} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const QueueView = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-2xl">
        <div className="relative w-full md:w-[450px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
          <input 
            type="text" 
            placeholder="Search Global Threat Database..." 
            className="w-full pl-14 pr-6 py-4 bg-slate-950 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all font-bold text-slate-200 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex items-center gap-2 px-6 py-4 bg-white/5 rounded-2xl text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5">
            <Filter size={16} />
            <span>Parameters</span>
          </button>
        </div>
      </div>

      <Card className="p-0 bg-transparent border-none">
        <div className="overflow-x-auto rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse bg-slate-900/40">
            <thead className="bg-slate-950 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="py-6 px-10">Entity Identification</th>
                <th className="py-6 px-4">Domain</th>
                <th className="py-6 px-4">Threat</th>
                <th className="py-6 px-4">Pattern</th>
                <th className="py-6 px-4 text-center">Status</th>
                <th className="py-6 px-10 text-right">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedCase(c)}>
                  <td className="py-6 px-10">
                    <div className="font-black text-slate-200 tracking-tight text-base">{c.entityName}</div>
                    <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">{c.id}</div>
                  </td>
                  <td className="py-6 px-4">
                    <span className="text-xs font-black text-slate-400">{c.program}</span>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            c.riskScore > 75 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 
                            c.riskScore > 40 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 
                            'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                          }`}
                          style={{ width: `${c.riskScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-black text-white">{c.riskScore}</span>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex gap-2">
                      {c.riskBreakdown.rules > 10 && <Badge color="violet">Rules</Badge>}
                      {c.riskBreakdown.ml > 10 && <Badge color="green">ML</Badge>}
                    </div>
                  </td>
                  <td className="py-6 px-4 text-center">
                    <Badge color={
                      c.status === 'Confirmed Fraud' ? 'red' :
                      c.status === 'Legitimate' ? 'green' :
                      c.status === 'Escalated' ? 'orange' : 'gray'
                    }>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-6 px-10 text-right">
                    <div className="w-10 h-10 flex items-center justify-center bg-white/5 text-slate-400 rounded-xl hover:bg-violet-600 hover:text-white transition-all ml-auto">
                      <ChevronRight size={20} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex font-sans selection:bg-violet-500/30">
      {/* Toast */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4">
          <div className={`px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-4 ${
            toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-violet-500/10 border-violet-500/20 text-violet-400'
          }`}>
            <Sparkles size={18} />
            <span className="font-black text-xs uppercase tracking-widest">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-72 bg-slate-950/50 backdrop-blur-xl border-r border-white/5 flex flex-col fixed h-full z-20">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-16 group cursor-pointer">
            <div className="p-3 bg-violet-600 text-white rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-transform duration-500 group-hover:scale-110">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tighter text-white uppercase leading-none">Vigilant<span className="text-violet-500">AI</span></h1>
              <p className="text-[9px] font-black tracking-[0.4em] text-slate-600 uppercase mt-1">Audit Shield</p>
            </div>
          </div>

          <nav className="space-y-3">
            <SidebarItem id="dashboard" icon={LayoutDashboard} label="Operations" />
            <SidebarItem id="queue" icon={ShieldAlert} label="Intelligence" />
            <SidebarItem id="rules" icon={Settings2} label="Logic Base" />
            <SidebarItem id="feedback" icon={History} label="System Log" />
          </nav>
        </div>

        <div className="mt-auto p-8">
          <div className="p-6 bg-slate-900 rounded-3xl border border-white/10 flex items-center gap-4 transition-all hover:border-violet-500/30">
            <div className="w-12 h-12 rounded-xl border border-violet-500/30 overflow-hidden bg-slate-800 p-1">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="rounded-lg" alt="avatar" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-white tracking-tight">Cpt. Arjun</p>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">L3 Specialist</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-72 p-12 relative overflow-y-auto">
        <header className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-5xl font-black text-white tracking-tighter capitalize mb-3">
              {activeTab} <span className="text-violet-600">.</span>
            </h2>
            <div className="flex items-center gap-4 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                <span>Node: Secure-Alpha</span>
              </div>
              <span className="w-px h-3 bg-slate-800"></span>
              <div className="flex items-center gap-2">
                <Clock size={12} />
                <span>Last Sync: 10:42:01</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-6 py-4 bg-slate-900 border border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-300 hover:text-white hover:border-violet-500/50 transition-all flex items-center gap-3 shadow-2xl"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin text-violet-500" /> : <Upload size={16} className="text-violet-500" />}
              <span>{isUploading ? 'Parsing' : 'Ingest'}</span>
            </button>
            
            <button 
              onClick={runNewScan}
              disabled={isScanning}
              className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${
                isScanning 
                ? 'bg-slate-800 text-slate-600' 
                : 'bg-violet-600 text-white shadow-[0_10px_30px_rgba(139,92,246,0.3)] hover:bg-violet-700 hover:-translate-y-1'
              }`}
            >
              {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
              <span>{isScanning ? 'Scrutinizing' : 'Run Scan'}</span>
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'queue' && <QueueView />}
        {activeTab === 'rules' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {MOCK_RULES.map(rule => (
              <Card key={rule.id} className="p-0 bg-slate-900/50 border-white/5">
                <div className="p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                  <div className="flex gap-8 items-start">
                    <div className={`p-6 rounded-3xl ${rule.active ? 'bg-violet-600 shadow-[0_0_30px_rgba(139,92,246,0.4)] text-white' : 'bg-slate-800 text-slate-600'}`}>
                      <Database size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-4">
                        <h4 className="font-black text-white text-2xl tracking-tight">{rule.name}</h4>
                        <Badge color={rule.active ? 'green' : 'gray'}>{rule.active ? 'Operational' : 'Idle'}</Badge>
                      </div>
                      <p className="text-slate-500 font-bold text-sm mt-2 max-w-xl">{rule.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-16 border-t lg:border-none border-white/5 pt-8 lg:pt-0">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-1">Impact</p>
                      <p className="text-3xl font-black text-white">+{rule.points}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-1">Accuracy</p>
                      <p className={`text-3xl font-black ${rule.accuracy > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{rule.accuracy}%</p>
                    </div>
                    <div className="flex items-center gap-6 border-l pl-16 border-white/5">
                      <div className="w-16 h-9 bg-slate-950 rounded-full relative p-1.5 cursor-pointer shadow-inner">
                        <div className={`w-6 h-6 rounded-full shadow-lg transition-all transform ${rule.active ? 'translate-x-7 bg-violet-600' : 'bg-slate-700'}`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        {activeTab === 'feedback' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card title="Decision History" className="lg:col-span-1 border-none bg-slate-900 shadow-2xl">
                <div className="py-12 flex flex-col items-center">
                  <div className="w-48 h-48 rounded-full border-[12px] border-violet-500/10 border-t-violet-500 flex items-center justify-center relative shadow-[0_0_40px_rgba(139,92,246,0.1)]">
                    <div className="text-center">
                      <span className="text-6xl font-black text-white tracking-tighter leading-none">{history.length}</span>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Actions</p>
                    </div>
                  </div>
                </div>
              </Card>
              <Card title="Intelligence Evolution" className="lg:col-span-2 border-none bg-slate-900 shadow-2xl">
                <div className="h-[280px] mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { month: 'JAN', acc: 60 }, { month: 'FEB', acc: 68 },
                      { month: 'MAR', acc: 75 }, { month: 'APR', acc: 80 },
                      { month: 'MAY', acc: 88 }, { month: 'JUN', acc: 94 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#475569'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#475569'}} />
                      <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff'}} />
                      <Line type="monotone" dataKey="acc" stroke="#8b5cf6" strokeWidth={8} dot={{r: 10, fill: '#8b5cf6', stroke: '#0f172a', strokeWidth: 4}} activeDot={{r: 12}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
            
            <Card title="Execution Log" className="bg-slate-900/40">
              <div className="divide-y divide-white/5">
                {history.map((log) => (
                  <div key={log.id} className="py-6 flex items-center justify-between group">
                    <div className="flex items-center gap-8">
                      <div className={`p-4 rounded-2xl ${
                        log.status === 'Confirmed Fraud' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {log.status === 'Confirmed Fraud' ? <XCircle size={28} /> : <CheckCircle2 size={28} />}
                      </div>
                      <div>
                        <p className="text-xl font-black text-slate-200 tracking-tight">Case {log.caseId}</p>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">Resolution: {log.status}</p>
                      </div>
                    </div>
                    <p className="text-xs font-black text-slate-600 font-mono tracking-tighter">{log.timestamp}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Case Detail Modal */}
        {selectedCase && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-8">
            <div className="bg-slate-900 w-full max-w-6xl rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-500 border border-white/10">
              {/* Header */}
              <div className="bg-slate-950 px-14 py-12 flex justify-between items-center relative overflow-hidden border-b border-white/5">
                <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]"></div>
                <div className="flex items-center gap-12 relative z-10">
                  <div className="w-28 h-28 rounded-[32px] flex flex-col items-center justify-center bg-violet-600 text-white shadow-[0_0_40px_rgba(139,92,246,0.4)]">
                    <span className="text-4xl font-black leading-none">{selectedCase.riskScore}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest mt-1">Risk</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-5 mb-3">
                      <h2 className="text-5xl font-black text-white tracking-tighter">{selectedCase.entityName}</h2>
                      <div className="px-4 py-1.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse">Critical</div>
                    </div>
                    <div className="flex items-center gap-10 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <span className="font-mono text-violet-400">{selectedCase.id}</span>
                      <span className="flex items-center gap-2"><Clock size={12} /> Detected: {selectedCase.dateFlagged}</span>
                      <span className="text-slate-300 font-bold">Amt: ₹{selectedCase.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedCase(null)} className="p-5 bg-white/5 text-slate-400 hover:text-white hover:bg-rose-600 rounded-3xl transition-all">
                  <X size={32} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-14 bg-slate-900/50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
                  <div className="lg:col-span-2 space-y-14">
                    <section>
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                        <AlertTriangle size={18} className="text-amber-500" />
                        Intelligence Summary
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        {selectedCase.reasons.map((reason, i) => (
                          <div key={i} className="bg-slate-950 border border-white/5 p-8 rounded-[32px] flex items-center gap-8 transition-all hover:border-white/10">
                            <div className="text-4xl font-black text-slate-800">0{i+1}</div>
                            <p className="text-slate-300 font-bold text-lg leading-relaxed">{reason}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Data Chain</h3>
                      <div className="space-y-8 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-white/5">
                        {selectedCase.evidence.map((item, i) => (
                          <div key={i} className="relative pl-16 group">
                            <div className="absolute left-2.5 top-1.5 w-5 h-5 bg-slate-900 border-[6px] border-violet-600 rounded-full group-hover:scale-125 transition-all"></div>
                            <div className="bg-slate-950/50 p-8 rounded-[32px] border border-white/5 shadow-inner">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-lg font-black text-white tracking-tight">{item.description}</span>
                                <span className="text-[10px] font-black text-slate-600 uppercase">{item.date}</span>
                              </div>
                              <span className="px-3 py-1 bg-violet-600/10 text-violet-400 font-mono text-[10px] rounded-lg border border-violet-600/20 uppercase">Vector: {item.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-10">
                    <Card title="Factor Breakdown" className="bg-slate-950 border-white/5">
                      <div className="space-y-10 py-6">
                        {Object.entries(selectedCase.riskBreakdown).map(([key, val]) => (
                          <div key={key}>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-4 text-slate-500">
                              <span>{key} Analysis</span>
                              <span className="text-white">{val}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  key === 'rules' ? 'bg-violet-600 shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 
                                  key === 'ml' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                                  'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                                }`}
                                style={{ width: `${val}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <div className="p-10 bg-gradient-to-br from-violet-600/20 to-transparent rounded-[40px] border border-violet-500/20">
                      <h4 className="font-black text-white uppercase text-xs tracking-widest mb-4">Auditor Note</h4>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed italic">
                        "Initial pattern matching suggests a sophisticated account-sharing cluster. High correlation with previous VS-2024 escalations in the Scholarship sector."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-slate-950 border-t border-white/5 px-14 py-10 flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-600 border border-white/5"><Database size={28} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Assigned Protocol</p>
                    <p className="text-sm font-black text-white">Manual Verification <span className="text-violet-500">_Required</span></p>
                  </div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button 
                    onClick={() => handleAction(selectedCase.id, 'Legitimate')}
                    className="flex-1 md:flex-none px-12 py-5 bg-white/5 text-slate-300 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/5"
                  >
                    Reject Flag
                  </button>
                  <button 
                    onClick={() => handleAction(selectedCase.id, 'Confirmed Fraud')}
                    className="flex-1 md:flex-none px-14 py-5 bg-rose-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 shadow-[0_15px_40px_rgba(244,63,94,0.3)] transition-all transform hover:-translate-y-2 active:scale-95"
                  >
                    Confirm Anomaly
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}