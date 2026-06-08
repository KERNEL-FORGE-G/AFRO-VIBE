import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  BarChart3, 
  Settings, 
  TrendingUp,
  Play,
  ArrowUpRight,
  Zap,
  Loader2,
  Music
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AfroVibeCommandCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    users: 0,
    videos: 0,
    likes: 0,
    revenue: '$0'
  });
  const [recentVideos, setVideos] = useState<any[]>([]);
  const [topCreators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRealData() {
      try {
        setLoading(true);
        
        // 1. Fetch Users Count
        const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        
        // 2. Fetch Videos and Stats
        const { data: videos } = await supabase
          .from('videos')
          .select('*, users(username, full_name, avatar_url)')
          .order('created_at', { ascending: false })
          .limit(5);

        // 3. Fetch Total Likes
        const { data: allVideos } = await supabase.from('videos').select('likes_count');
        const totalLikes = allVideos?.reduce((acc, v) => acc + (v.likes_count || 0), 0) || 0;

        // 4. Fetch Top Creators (Simulated by follower count for now)
        const { data: creators } = await supabase
          .from('users')
          .select('*')
          .order('followers_count', { ascending: false })
          .limit(4);

        setStats({
          users: userCount || 0,
          videos: allVideos?.length || 0,
          likes: totalLikes,
          revenue: `$${((allVideos?.length || 0) * 0.5).toFixed(2)}` // Simulated revenue
        });

        if (videos) setVideos(videos);
        if (creators) setCreators(creators);

      } catch (err) {
        console.error('Error fetching real data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRealData();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FF5E00]/30 overflow-x-hidden font-sans">
      <Head>
        <title>AFRO VIBE | Command Center 2026</title>
        <link rel="icon" href="/logo.png" />
      </Head>

      {/* Futuristic Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF5E00]/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#E60067]/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        
        {/* Sidebar */}
        <aside className="w-20 lg:w-72 flex flex-col items-center lg:items-stretch py-8 border-r border-white/5 bg-[#0F0916]/80 backdrop-blur-3xl sticky top-0 h-screen transition-all">
          <div className="px-6 mb-12 flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF5E00] to-[#E60067] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,94,0,0.3)]">
              <span className="font-black text-xl italic text-white">V</span>
            </div>
            <span className="hidden lg:block text-2xl font-black tracking-tighter uppercase italic text-white">Afro Vibe</span>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            <SidebarItem icon={<LayoutDashboard size={20} />} label="Command" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <SidebarItem icon={<Users size={20} />} label="Creators" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <SidebarItem icon={<Video size={20} />} label="Content" active={activeTab === 'videos'} onClick={() => setActiveTab('videos')} />
            <SidebarItem icon={<Music size={20} />} label="Beats" active={activeTab === 'music'} onClick={() => setActiveTab('music')} />
            <SidebarItem icon={<BarChart3 size={20} />} label="Insights" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          </nav>

          <div className="px-4 mt-auto">
            <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-[#E60067] mb-2 text-white">
                <Zap size={14} className="fill-current text-[#E60067]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Live Production Data</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black tracking-tightest uppercase italic leading-none text-white">
                Real-time <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5E00] via-[#FFAA00] to-[#E60067]">Vibrations</span>
              </h1>
            </div>

            {loading && <Loader2 className="animate-spin text-[#FF5E00]" size={32} />}
          </header>

          <div className="grid grid-cols-12 gap-6 mb-12">
            
            {/* Hero Tile */}
            <div className="col-span-12 lg:col-span-8 p-1 rounded-[32px] bg-gradient-to-br from-white/10 to-transparent border border-white/5 shadow-2xl overflow-hidden group hover:border-[#FF5E00]/20 transition-all">
              <div className="h-full bg-[#0F0916] rounded-[28px] p-8 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FF5E00]/10 border border-[#FF5E00]/20 flex items-center justify-center text-[#FF5E00]">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight uppercase italic text-white">Platform Health</h3>
                      <p className="text-xs text-white/40">Engagement based on actual records</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-[#FF5E00]">{stats.users} Users</div>
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Accounts</div>
                  </div>
                </div>
                
                <div className="flex-1 flex items-end gap-1 min-h-[200px] py-4">
                  {[20, 40, 30, 70, 50, 60, 40, 90, 70, 80, 50, 100].map((h, index) => (
                    <div 
                      key={index} 
                      className="flex-1 bg-gradient-to-t from-[#FF5E00]/40 to-[#FF5E00] rounded-t-lg"
                      style={{ height: `${h}%`, opacity: 0.1 + (index * 0.08) }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Side Stats */}
            <div className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-6">
              <StatCard label="Total Content" value={stats.videos} subValue="Uploaded Videos" icon={<Video />} color="#E60067" />
              <StatCard label="Revenue" value={stats.revenue} subValue="Simulated Earnings" icon={<Zap />} color="#FFAA00" />
            </div>

            {/* Content List */}
            <div className="col-span-12 md:col-span-8 lg:col-span-9 p-8 rounded-[32px] bg-white/[0.02] backdrop-blur-md border border-white/5 overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-xl font-black italic mb-6 text-white text-white">Latest Drops</h3>
                <div className="space-y-4 text-white">
                  {recentVideos.length > 0 ? recentVideos.map(video => (
                    <ContentRow 
                      key={video.id} 
                      title={video.caption || "Untitled"} 
                      user={video.users?.username || "anonymous"} 
                      reach={video.views_count || 0} 
                      status={video.likes_count > 10 ? "Hot" : "New"} 
                    />
                  )) : (
                    <p className="text-white/40 text-sm italic">No videos recorded yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Top Creators */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3 p-8 rounded-[32px] bg-[#1F0E31]/40 border border-white/5">
                <h3 className="text-xl font-black italic mb-6 text-white text-white">Elite Creators</h3>
                <div className="space-y-6 text-white">
                  {topCreators.map((creator) => (
                    <div key={creator.id} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#FF5E00]/20 flex items-center justify-center font-black text-[#FF5E00]">
                        {creator.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold">@{creator.username}</p>
                        <p className="text-[10px] text-white/40">{creator.followers_count} followers</p>
                      </div>
                    </div>
                  ))}
                </div>
            </div>

          </div>
        </main>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Space Grotesk', sans-serif; margin: 0; background: #050505; }
        .animate-spin-slow { animation: spin 20s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 group relative ${
        active ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white'
      }`}
    >
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-[#FF5E00] to-[#E60067] rounded-r-full shadow-[0_0_15px_#FF5E00]" />
      )}
      <span className={`${active ? 'text-[#FF5E00]' : ''}`}>
        {icon}
      </span>
      <span className="hidden lg:block font-bold text-sm uppercase tracking-widest">{label}</span>
    </button>
  );
}

function StatCard({ label, value, subValue, icon, color }: any) {
  return (
    <div className="bg-[#0F0916] rounded-[32px] border border-white/5 p-8 flex flex-col justify-between group hover:border-white/20 transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">{label}</span>
        <div className="p-2 rounded-xl bg-white/5" style={{ color }}>{icon}</div>
      </div>
      <div>
        <div className="text-4xl font-black italic leading-none mb-1" style={{ color }}>{value}</div>
        <div className="text-[10px] font-bold text-white/40 uppercase">{subValue}</div>
      </div>
    </div>
  );
}

function ContentRow({ title, user, reach, status }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all group">
      <div className="flex items-center gap-4 text-white">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#FF5E00]">
          <Play size={16} className="fill-current text-[#FF5E00]" />
        </div>
        <div>
          <h5 className="font-bold text-sm tracking-tight text-white">{title}</h5>
          <p className="text-[10px] text-white/40">@{user}</p>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right">
          <div className="text-sm font-black italic text-white">{reach}</div>
          <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest text-white">Views</div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
          status === 'Viral' ? 'bg-[#FF5E00]/10 text-[#FF5E00] border-[#FF5E00]/20' : 
          status === 'Hot' ? 'bg-[#E60067]/10 text-[#E60067] border-[#E60067]/20' : 
          'bg-white/5 text-white/40 border-white/10'
        }`}>
          {status}
        </div>
        <button className="text-white/20 hover:text-white"><ArrowUpRight size={18} /></button>
      </div>
    </div>
  );
}
