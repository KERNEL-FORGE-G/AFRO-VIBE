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
  Music,
  Trash2
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

export default function AfroVibeCommandCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    users: 0,
    videos: 0,
    likes: 0,
    revenue: '0'
  });
  const [recentVideos, setVideos] = useState<any[]>([]);
  const [topCreators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRealData = async () => {
    try {
      setLoading(true);
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersList = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const videosQuery = query(collection(db, 'videos'), orderBy('created_at', 'desc'));
      const videosSnap = await getDocs(videosQuery);
      const videosList = videosSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const totalLikes = videosList.reduce((acc, v: any) => acc + (v.likes || 0), 0);
      setStats({
        users: usersList.length,
        videos: videosList.length,
        likes: totalLikes,
        revenue: (videosList.length * 0.5).toFixed(2)
      });
      setVideos(videosList);
      const sortedCreators = [...usersList].sort((a: any, b: any) => (b.followers || 0) - (a.followers || 0));
      setCreators(sortedCreators.slice(0, 10));
    } catch (err) {
      console.error('Error fetching data from Firestore:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  const handleDeleteVideo = async (videoId: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette vidéo ?')) {
      try {
        await deleteDoc(doc(db, 'videos', videoId));
        fetchRealData();
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FF5E00]/30 overflow-x-hidden font-sans">
      <Head>
        <title>AFRO VIBE | Command Center</title>
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF5E00]/10 blur-[150px] rounded-full animate-pulse" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 0.5 }} className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#E60067]/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <motion.aside initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-20 lg:w-72 flex flex-col items-center lg:items-stretch py-8 border-r border-white/5 bg-[#0F0916]/80 backdrop-blur-3xl sticky top-0 h-screen transition-all">
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
          </nav>

          <div className="px-4 mt-auto">
            <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </div>
        </motion.aside>

        <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
          <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-[#E60067] mb-2 text-white">
                <Zap size={14} className="fill-current text-[#E60067]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Live Firebase Data</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black tracking-tightest uppercase italic leading-none text-white">
                {activeTab === 'overview' ? 'Real-time Vibrations' : activeTab.toUpperCase()}
              </h1>
            </div>
            <button onClick={fetchRealData} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all">
              {loading ? <Loader2 className="animate-spin text-[#FF5E00]" size={24} /> : <TrendingUp size={24} />}
            </button>
          </motion.header>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="grid grid-cols-12 gap-6 mb-12">
                  <div className="col-span-12 lg:col-span-8 p-1 rounded-[32px] bg-gradient-to-br from-white/10 to-transparent border border-white/5 shadow-2xl overflow-hidden bg-[#0F0916]">
                    <div className="p-8 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#FF5E00]/10 border border-[#FF5E00]/20 flex items-center justify-center text-[#FF5E00]"><BarChart3 size={24} /></div>
                          <div><h3 className="text-xl font-black tracking-tight uppercase italic">Platform Health</h3><p className="text-xs text-white/40">Engagement stats</p></div>
                        </div>
                        <div className="text-right"><div className="text-3xl font-black text-[#FF5E00]">{stats.users} Users</div><div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Creators</div></div>
                      </div>
                      <div className="flex-1 flex items-end gap-1 min-h-[200px] py-4">
                        {[20, 40, 30, 70, 50, 60, 40, 90, 70, 80, 50, 100].map((h, index) => (
                          <motion.div key={index} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.5 + index * 0.05 }} className="flex-1 bg-gradient-to-t from-[#FF5E00]/40 to-[#FF5E00] rounded-t-lg" style={{ opacity: 0.1 + (index * 0.08) }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-6">
                    <StatCard label="Total Videos" value={stats.videos} subValue="Uploaded" icon={<Video />} color="#E60067" delay={0.1} />
                    <StatCard label="Revenue" value={`$${stats.revenue}`} subValue="Estimated" icon={<Zap />} color="#FFAA00" delay={0.2} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'videos' && (
              <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-12">
                <div className="p-8 rounded-[32px] bg-white/[0.02] backdrop-blur-md border border-white/5">
                  <h3 className="text-xl font-black italic mb-6">Content Management</h3>
                  <div className="space-y-4">
                    {recentVideos.length > 0 ? recentVideos.map((video, idx) => (
                      <ContentRow key={video.id} id={video.id} index={idx} title={video.caption || "Untitled"} user={video.user_id} reach={video.views || 0} likes={video.likes || 0} onDelete={() => handleDeleteVideo(video.id)} />
                    )) : <p className="text-white/40 text-sm italic">No videos found.</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
               <motion.div key="creators" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-12">
                 <div className="p-8 rounded-[32px] bg-[#1F0E31]/40 border border-white/5">
                    <h3 className="text-xl font-black italic mb-6">User Database</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {topCreators.map((creator, idx) => (
                        <motion.div key={creator.id} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.05 * idx }} className="bg-white/5 p-6 rounded-3xl flex items-center gap-6">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF5E00] to-[#E60067] flex items-center justify-center font-black text-2xl text-white">
                            {creator.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-lg text-[#FF5E00]">@{creator.username}</p>
                            <p className="text-sm text-white/60">{creator.fullName}</p>
                            <div className="flex gap-4 mt-2">
                               <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{creator.followers || 0} Followers</p>
                               <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{creator.following || 0} Following</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                 </div>
               </motion.div>
            )}

            {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="p-12 bg-white/5 rounded-[40px] border border-white/10 text-center">
                    <Settings size={64} className="mx-auto mb-6 text-[#FF5E00] opacity-50" />
                    <h2 className="text-3xl font-black italic mb-4">Command Settings</h2>
                    <p className="text-white/40 max-w-md mx-auto mb-8">Configure your command center preferences and production environment variables here.</p>
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                        <button className="py-4 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/5">Appearance</button>
                        <button className="py-4 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/5">Notifications</button>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Space Grotesk', sans-serif; margin: 0; background: #050505; }
      `}</style>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 group relative ${active ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white'}`}>
      {active && <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-[#FF5E00] to-[#E60067] rounded-r-full shadow-[0_0_15px_#FF5E00]" />}
      <span className={`${active ? 'text-[#FF5E00]' : ''}`}>{icon}</span>
      <span className="hidden lg:block font-bold text-sm uppercase tracking-widest">{label}</span>
    </button>
  );
}

function StatCard({ label, value, subValue, icon, color, delay }: any) {
  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay }} className="bg-[#0F0916] rounded-[32px] border border-white/5 p-8 flex flex-col justify-between group hover:border-white/20 transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">{label}</span>
        <div className="p-2 rounded-xl bg-white/5" style={{ color }}>{icon}</div>
      </div>
      <div>
        <div className="text-4xl font-black italic leading-none mb-1" style={{ color }}>{value}</div>
        <div className="text-[10px] font-bold text-white/40 uppercase">{subValue}</div>
      </div>
    </motion.div>
  );
}

function ContentRow({ id, title, user, reach, likes, onDelete, index }: any) {
  return (
    <motion.div layout initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ delay: Math.min(0.05 * index, 0.5) }} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#FF5E00]"><Play size={16} className="fill-current" /></div>
        <div><h5 className="font-bold text-sm tracking-tight">{title}</h5><p className="text-[10px] text-white/40">ID: {user}</p></div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right"><div className="text-sm font-black italic">{reach}</div><div className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Views</div></div>
        <div className="text-right"><div className="text-sm font-black italic text-[#E60067]">{likes}</div><div className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Likes</div></div>
        <button onClick={onDelete} className="text-white/20 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
      </div>
    </motion.div>
  );
}
