import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  BarChart3, 
  Settings, 
  Search, 
  Bell, 
  TrendingUp,
  Play,
  Heart,
  PlusCircle,
  MoreVertical,
  Activity,
  Globe,
  Music
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#13091B] text-white selection:bg-afro-orange/30">
      <Head>
        <title>Afro Vibe | Command Center</title>
      </Head>

      {/* Decorative Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-gradient-to-r from-afro-orange via-afro-gold to-afro-pink shadow-[0_0_15px_rgba(255,94,0,0.5)]" />
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-afro-card/40 backdrop-blur-2xl border-r border-afro-border z-40">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="relative group">
               <div className="absolute -inset-1.5 bg-gradient-to-r from-afro-orange to-afro-pink rounded-xl blur-md opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
               <div className="relative w-12 h-12 bg-afro-dark rounded-xl flex items-center justify-center font-black text-2xl text-afro-orange border border-afro-border shadow-inner">
                AV
               </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Afro <span className="text-transparent bg-clip-text bg-gradient-to-r from-afro-orange to-afro-gold">Vibe</span></h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Admin Suite</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <SidebarItem icon={<Users size={20} />} label="Community" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <SidebarItem icon={<Video size={20} />} label="Video Feed" active={activeTab === 'videos'} onClick={() => setActiveTab('videos')} />
            <SidebarItem icon={<Music size={20} />} label="Music Library" active={activeTab === 'music'} onClick={() => setActiveTab('music')} />
            <SidebarItem icon={<BarChart3 size={20} />} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          </nav>
        </div>

        <div className="absolute bottom-8 left-0 right-0 px-8 space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-afro-orange/10 to-transparent border border-afro-orange/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe size={40} className="text-afro-orange" />
            </div>
            <p className="text-[10px] font-black text-afro-orange uppercase tracking-wider mb-2">Cloud Status</p>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-sm font-bold text-slate-200">Supabase Online</span>
            </div>
          </div>
          <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-72 min-h-screen">
        {/* Navbar */}
        <header className="h-24 border-b border-afro-border px-10 flex items-center justify-between sticky top-0 bg-afro-dark/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-4 bg-afro-card/60 px-5 py-2.5 rounded-2xl border border-afro-border w-[450px] group focus-within:border-afro-orange/50 transition-all">
            <Search size={18} className="text-slate-400 group-focus-within:text-afro-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search creators, videos, tags..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-8">
            <button className="relative p-2.5 rounded-xl bg-afro-card/60 border border-afro-border hover:bg-afro-card transition-colors group">
              <Bell size={20} className="text-slate-300 group-hover:text-afro-orange" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-afro-pink rounded-full ring-2 ring-afro-dark" />
            </button>
            <div className="h-10 w-px bg-afro-border" />
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold tracking-tight">Main Admin</p>
                <p className="text-[10px] text-afro-gold font-black uppercase tracking-widest">Superuser</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-afro-orange to-afro-pink p-0.5 shadow-lg shadow-afro-orange/10">
                <div className="w-full h-full rounded-[14px] bg-afro-dark flex items-center justify-center font-bold text-afro-orange text-lg">
                  A
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-10 space-y-10">
          <section className="flex items-end justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-afro-pink">
                 <Activity size={18} />
                 <span className="text-xs font-black uppercase tracking-[0.2em]">Real-time Overview</span>
              </div>
              <h2 className="text-5xl font-black tracking-tighter">Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-afro-orange to-afro-pink">Center</span></h2>
            </div>
            
            <button className="bg-white text-black hover:bg-slate-200 font-black px-8 py-4 rounded-2xl shadow-xl transition-all flex items-center gap-3 group active:scale-95">
              <PlusCircle size={20} />
              Create Campaign
            </button>
          </section>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total Creators" value="4,821" icon={<Users />} color="text-afro-orange" bg="bg-afro-orange/5" trend="+12.5%" />
            <StatCard label="Global Views" value="2.4M" icon={<TrendingUp />} color="text-afro-gold" bg="bg-afro-gold/5" trend="+24.1%" />
            <StatCard label="Live Streams" value="84" icon={<Activity />} color="text-afro-pink" bg="bg-afro-pink/5" trend="+8%" />
            <StatCard label="App Revenue" value="$12.8k" icon={<Globe />} color="text-emerald-400" bg="bg-emerald-400/5" trend="+15.3%" />
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Main Data Table Area */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="bg-afro-card/30 rounded-[32px] border border-afro-border p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold tracking-tight flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-afro-orange rounded-full" />
                    Trending Performance
                  </h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-xl bg-afro-dark text-xs font-bold border border-afro-border hover:border-afro-orange/40 transition-all">Weekly</button>
                    <button className="px-4 py-2 rounded-xl bg-afro-orange text-white text-xs font-bold shadow-lg shadow-afro-orange/20">Monthly</button>
                  </div>
                </div>

                <div className="space-y-2">
                   <TableRow title="Afrobeat Dance Challenge" creator="King_Moves" status="Viral" metrics="1.2M views" date="2h ago" />
                   <TableRow title="Lagos Street Style 2026" creator="StyleMaster" status="Hot" metrics="450k views" date="5h ago" />
                   <TableRow title="Cook with Auntie: Fufu Special" creator="Auntie_Chef" status="New" metrics="12k views" date="8h ago" />
                   <TableRow title="Kinshasa Night Vibes" creator="VibeSeeker" status="Viral" metrics="890k views" date="1d ago" />
                </div>
              </div>
            </div>

            {/* Side Column */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
               <div className="bg-gradient-to-br from-afro-pink/10 to-transparent rounded-[32px] border border-afro-pink/20 p-8">
                  <h3 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-afro-pink rounded-full" />
                    Top Creators
                  </h3>
                  <div className="space-y-6">
                    <CreatorItem rank="1" name="Burna_Vibe" followers="1.2M" />
                    <CreatorItem rank="2" name="Queen_Afro" followers="840k" />
                    <CreatorItem rank="3" name="Urban_Mover" followers="620k" />
                    <CreatorItem rank="4" name="Nature_Soul" followers="510k" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-[20px] transition-all duration-300 group ${
        active 
          ? 'bg-gradient-to-r from-afro-orange to-afro-pink text-white shadow-xl shadow-afro-orange/15' 
          : 'text-slate-400 hover:bg-afro-card/80 hover:text-white'
      }`}
    >
      <span className={`${active ? 'scale-110' : 'group-hover:scale-110 transition-transform duration-300'}`}>
        {icon}
      </span>
      <span className="font-bold text-sm tracking-wide">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
    </button>
  );
}

function StatCard({ label, value, icon, color, bg, trend }: any) {
  return (
    <div className={`p-8 rounded-[32px] border border-afro-border ${bg} backdrop-blur-sm relative overflow-hidden group hover:border-afro-orange/30 transition-all duration-500`}>
      <div className={`absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-125 transition-all duration-700 ${color}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 140 })}
      </div>
      <div className="relative z-10 space-y-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-afro-dark/50 border border-afro-border shadow-inner ${color}`}>
          {React.cloneElement(icon as React.ReactElement, { size: 28 })}
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
          <div className="flex items-end gap-3">
            <h4 className="text-3xl font-black tracking-tight">{value}</h4>
            <span className="text-[10px] font-bold text-emerald-400 mb-1.5 px-2 py-0.5 rounded-full bg-emerald-400/10">{trend}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableRow({ title, creator, status, metrics, date }: any) {
  return (
    <div className="flex items-center justify-between p-5 rounded-[22px] hover:bg-afro-card/40 transition-all border border-transparent hover:border-afro-border group">
      <div className="flex items-center gap-5">
        <div className="w-20 h-12 rounded-xl bg-afro-dark border border-afro-border flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-tr from-afro-orange/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           <Play size={18} className="text-afro-orange relative z-10" />
        </div>
        <div>
          <p className="font-bold text-sm tracking-tight text-white">{title}</p>
          <p className="text-xs text-slate-500 font-medium">@{creator}</p>
        </div>
      </div>
      <div className="flex items-center gap-12">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-bold text-white">{metrics}</p>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">{date}</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          status === 'Viral' ? 'bg-afro-orange/10 text-afro-orange border-afro-orange/20' : 
          status === 'Hot' ? 'bg-afro-pink/10 text-afro-pink border-afro-pink/20' : 
          'bg-slate-800/50 text-slate-400 border-slate-700'
        }`}>
          {status}
        </div>
        <button className="text-slate-600 hover:text-white transition-colors"><MoreVertical size={20} /></button>
      </div>
    </div>
  );
}

function CreatorItem({ rank, name, followers }: any) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex items-center gap-4">
        <span className="text-xs font-black text-slate-600 group-hover:text-afro-pink transition-colors">0{rank}</span>
        <div className="w-12 h-12 rounded-2xl bg-afro-dark border border-afro-border flex items-center justify-center font-black text-afro-pink shadow-inner group-hover:border-afro-pink/30 transition-all">
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-bold text-white group-hover:text-afro-pink transition-colors">@{name}</p>
          <p className="text-[10px] text-slate-500 font-medium">{followers} followers</p>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full border border-afro-border flex items-center justify-center text-slate-600 group-hover:bg-afro-pink group-hover:text-white group-hover:border-afro-pink transition-all">
        <TrendingUp size={14} />
      </div>
    </div>
  );
}
