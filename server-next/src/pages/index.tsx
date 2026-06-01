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
  MoreVertical,
  CheckCircle2,
  TrendingUp,
  Play,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react';

// Official Theme Colors
const COLORS = {
  background: '#13091B',
  cardBackground: '#1F0E31',
  primary: '#FF5E00',
  secondary: '#E60067',
  accent: '#FFAA00',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  border: '#2D1845',
  success: '#00E676',
  error: '#FF1744'
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    users: 1248,
    videos: 5432,
    likes: '124K',
    revenue: '$8,240'
  });

  return (
    <div className="min-h-screen bg-[#13091B] text-white font-sans selection:bg-[#FF5E00]/30">
      <Head>
        <title>Afro Vibe | Admin Suite</title>
      </Head>

      {/* Decorative Tribal Header Background */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-gradient-to-r from-[#FF5E00] via-[#FFAA00] to-[#E60067]" />
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-[#1F0E31]/50 backdrop-blur-xl border-r border-[#2D1845] z-40 transition-all duration-300">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-[#FF5E00] to-[#E60067] rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
               <div className="relative w-12 h-12 bg-[#13091B] rounded-xl flex items-center justify-center font-black text-2xl text-[#FF5E00] border border-[#2D1845]">
                AV
               </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Afro <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5E00] to-[#FFAA00]">Vibe</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-[#B3B3B3] font-bold">Admin Suite</p>
            </div>
          </div>

          <nav className="space-y-2">
            <SidebarItem icon={<LayoutDashboard />} label="Tableau de bord" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <SidebarItem icon={<Users />} label="Communauté" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <SidebarItem icon={<Video />} label="Contenu Vidéo" active={activeTab === 'videos'} onClick={() => setActiveTab('videos')} />
            <SidebarItem icon={<BarChart3 />} label="Analytiques" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          </nav>
        </div>

        <div className="absolute bottom-8 left-0 right-0 px-8">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FF5E00]/10 to-transparent border border-[#FF5E00]/20 mb-6">
            <p className="text-xs font-bold text-[#FF5E00] uppercase mb-1">Status Serveur</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></div>
              <span className="text-sm font-medium">Connecté au Cloud</span>
            </div>
          </div>
          <SidebarItem icon={<Settings />} label="Paramètres" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-72 min-h-screen">
        {/* Top Navbar */}
        <nav className="h-24 border-b border-[#2D1845] px-10 flex items-center justify-between sticky top-0 bg-[#13091B]/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-4 bg-[#1F0E31] px-4 py-2 rounded-xl border border-[#2D1845] w-96">
            <Search size={18} className="text-[#B3B3B3]" />
            <input 
              type="text" 
              placeholder="Rechercher un créateur, une vidéo..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#B3B3B3]"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 rounded-full hover:bg-[#1F0E31] transition-colors">
              <Bell size={22} className="text-[#B3B3B3]" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-[#E60067] rounded-full border-2 border-[#13091B]"></div>
            </button>
            <div className="h-8 w-[1px] bg-[#2D1845]" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold">Admin Principal</p>
                <p className="text-[10px] text-[#B3B3B3] uppercase tracking-wider">Super Utilisateur</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF5E00] to-[#E60067] p-[2px]">
                <div className="w-full h-full rounded-full bg-[#13091B] flex items-center justify-center font-bold">A</div>
              </div>
            </div>
          </div>
        </nav>

        {/* Dynamic Page Content */}
        <div className="p-10">
          {activeTab === 'overview' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-4xl font-black tracking-tight mb-2">Aperçu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5E00] to-[#E60067]">Global</span></h2>
                  <p className="text-[#B3B3B3]">Voici ce qui se passe sur Afro Vibe en ce moment.</p>
                </div>
                <button className="bg-[#FF5E00] hover:bg-[#FF5E00]/90 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-[#FF5E00]/20 transition-all flex items-center gap-2">
                  <TrendingUp size={18} />
                  Exporter les données
                </button>
              </div>

              {/* Grid des Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatBox label="Utilisateurs" value={stats.users.toLocaleString()} icon={<Users />} color="#FF5E00" trend="+14%" />
                <StatBox label="Vidéos publiées" value={stats.videos.toLocaleString()} icon={<Video />} color="#E60067" trend="+22%" />
                <StatBox label="Interactions" value={stats.likes} icon={<Heart />} color="#FFAA00" trend="+5%" />
                <StatBox label="Engagements" value="98.2%" icon={<TrendingUp />} color="#00E676" trend="+1.2%" />
              </div>

              <div className="grid grid-cols-3 gap-8">
                {/* Dernières Vidéos */}
                <div className="col-span-2 bg-[#1F0E31]/40 rounded-3xl border border-[#2D1845] p-8">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold flex items-center gap-3">
                        <div className="w-2 h-6 bg-[#FF5E00] rounded-full" />
                        Vidéos Tendances
                      </h3>
                      <button className="text-sm font-medium text-[#FF5E00] hover:underline">Voir tout</button>
                   </div>
                   
                   <div className="space-y-4">
                      <VideoRow 
                        title="Démonstration Afro Dance" 
                        user="King_Moves" 
                        views="12.5K" 
                        likes="1.2K" 
                        status="Live" 
                      />
                      <VideoRow 
                        title="Recette Jollof Rice Express" 
                        user="Maman_Africa" 
                        views="8.2K" 
                        likes="940" 
                        status="Public" 
                      />
                      <VideoRow 
                        title="Vibe de Kinshasa" 
                        user="Congolese_Vibe" 
                        views="45.1K" 
                        likes="5.6K" 
                        status="Public" 
                      />
                   </div>
                </div>

                {/* Créateurs Récents */}
                <div className="bg-[#1F0E31]/40 rounded-3xl border border-[#2D1845] p-8">
                   <h3 className="text-xl font-bold flex items-center gap-3 mb-8">
                      <div className="w-2 h-6 bg-[#E60067] rounded-full" />
                      Nouveaux Créateurs
                   </h3>
                   <div className="space-y-6">
                      <UserMini id="1" name="Sarah_D" followers="2.1K" verified />
                      <UserMini id="2" name="Bobi_M" followers="840" />
                      <UserMini id="3" name="Nia_Vibes" followers="5.4K" verified />
                      <UserMini id="4" name="Afro_Style" followers="120" />
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && <div className="text-center py-20 text-[#B3B3B3]">Gestion des utilisateurs en cours de chargement...</div>}
          {activeTab === 'videos' && <div className="text-center py-20 text-[#B3B3B3]">Gestion des vidéos en cours de chargement...</div>}
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { 
          font-family: 'Plus Jakarta Sans', sans-serif;
          margin: 0;
          overflow-x: hidden;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #13091B;
        }
        ::-webkit-scrollbar-thumb {
          background: #2D1845;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #FF5E00;
        }
      `}</style>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
        active 
          ? 'bg-gradient-to-r from-[#FF5E00] to-[#E60067] text-white shadow-xl shadow-[#FF5E00]/10' 
          : 'text-[#B3B3B3] hover:bg-[#1F0E31] hover:text-white'
      }`}
    >
      <span className={`${active ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`}>
        {React.cloneElement(icon, { size: 22 })}
      </span>
      <span className="font-bold text-sm tracking-wide">{label}</span>
      {active && <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />}
    </button>
  );
}

function StatBox({ label, value, icon, color, trend }: { label: string, value: string, icon: any, color: string, trend: string }) {
  return (
    <div className="bg-[#1F0E31] p-8 rounded-3xl border border-[#2D1845] relative overflow-hidden group hover:border-[#FF5E00]/30 transition-colors">
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700" style={{ color }}>
        {React.cloneElement(icon, { size: 100 })}
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#13091B] border border-[#2D1845]" style={{ color }}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        <div>
          <p className="text-xs font-bold text-[#B3B3B3] uppercase tracking-wider">{label}</p>
          <div className="flex items-center gap-2">
            <h4 className="text-2xl font-black">{value}</h4>
            <span className="text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 px-1.5 py-0.5 rounded">{trend}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoRow({ title, user, views, likes, status }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#13091B]/50 transition-colors border border-transparent hover:border-[#2D1845]">
      <div className="flex items-center gap-4">
        <div className="w-16 h-10 rounded-lg bg-[#13091B] border border-[#2D1845] flex items-center justify-center overflow-hidden">
          <Play size={16} className="text-[#FF5E00]" />
        </div>
        <div>
          <p className="font-bold text-sm">{title}</p>
          <p className="text-xs text-[#B3B3B3]">par @{user}</p>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right">
          <p className="text-sm font-bold">{views}</p>
          <p className="text-[10px] text-[#B3B3B3] uppercase font-bold">Vues</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">{likes}</p>
          <p className="text-[10px] text-[#B3B3B3] uppercase font-bold">Likes</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          status === 'Live' ? 'bg-[#FF0055]/10 text-[#FF0055] animate-pulse' : 'bg-[#2D1845] text-[#B3B3B3]'
        }`}>
          {status}
        </div>
        <button className="text-[#B3B3B3] hover:text-white"><MoreVertical size={18} /></button>
      </div>
    </div>
  );
}

function UserMini({ name, followers, verified }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#2D1845] flex items-center justify-center font-bold text-xs">
          {name[0]}
        </div>
        <div>
          <div className="flex items-center gap-1">
            <p className="text-sm font-bold">@{name}</p>
            {verified && <CheckCircle2 size={12} className="text-[#FFAA00]" />}
          </div>
          <p className="text-[10px] text-[#B3B3B3]">{followers} abonnés</p>
        </div>
      </div>
      <button className="text-[10px] font-bold text-[#FF5E00] uppercase tracking-wider hover:underline">Gérer</button>
    </div>
  );
}
