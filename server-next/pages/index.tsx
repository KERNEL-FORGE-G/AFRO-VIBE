import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import {
  Gauge,
  LayoutDashboard,
  Loader2,
  Palette,
  Play,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
} from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import { db, firebaseConfigMissingKeys, firebaseConfigReady } from '../lib/firebase';

type Stats = {
  users: number;
  videos: number;
  recentLikes: number;
  revenue: string;
};

type VideoRecord = {
  id: string;
  caption?: string;
  user_id?: string;
  views?: number;
  likes?: number;
};

type CreatorRecord = {
  id: string;
  username?: string;
  fullName?: string;
  followers?: number;
  following?: number;
};

const TABS = [
  { id: 'overview', label: 'Vue', icon: LayoutDashboard },
  { id: 'users', label: 'Createurs', icon: Users },
  { id: 'videos', label: 'Contenu', icon: Video },
  { id: 'settings', label: 'Studio', icon: Settings },
] as const;

const chartSeries = [26, 38, 34, 48, 52, 64, 58, 72, 68, 84, 76, 96];

export default function AfroVibeCommandCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<Stats>({
    users: 0,
    videos: 0,
    recentLikes: 0,
    revenue: '0.00',
  });
  const [recentVideos, setVideos] = useState<VideoRecord[]>([]);
  const [topCreators, setCreators] = useState<CreatorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTopCreators = useCallback(async () => {
    if (!db) return [];

    try {
      const topCreatorsQuery = query(collection(db, 'users'), orderBy('followers', 'desc'), limit(6));
      const topCreatorsSnap = await getDocs(topCreatorsQuery);
      return topCreatorsSnap.docs.map((entry) => ({ id: entry.id, ...entry.data() })) as CreatorRecord[];
    } catch (queryError) {
      const fallbackSnap = await getDocs(collection(db, 'users'));
      const fallbackUsers = fallbackSnap.docs.map((entry) => ({ id: entry.id, ...entry.data() })) as CreatorRecord[];
      return fallbackUsers
        .sort((a, b) => (b.followers || 0) - (a.followers || 0))
        .slice(0, 6);
    }
  }, []);

  const fetchRealData = useCallback(async () => {
    if (!firebaseConfigReady || !db) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const [usersCountSnap, videosCountSnap, videosSnap, creatorsList] = await Promise.all([
        getCountFromServer(collection(db, 'users')),
        getCountFromServer(collection(db, 'videos')),
        getDocs(query(collection(db, 'videos'), orderBy('created_at', 'desc'), limit(12))),
        fetchTopCreators(),
      ]);

      const videosList = videosSnap.docs.map((entry) => ({ id: entry.id, ...entry.data() })) as VideoRecord[];
      const recentLikes = videosList.reduce((acc, video) => acc + Number(video.likes || 0), 0);

      setStats({
        users: usersCountSnap.data().count,
        videos: videosCountSnap.data().count,
        recentLikes,
        revenue: (videosCountSnap.data().count * 0.5).toFixed(2),
      });
      setVideos(videosList);
      setCreators(creatorsList);
    } catch (err) {
      console.error('Error fetching data from Firestore:', err);
      setError('Impossible de charger les donnees temps reel.');
    } finally {
      setLoading(false);
    }
  }, [fetchTopCreators]);

  useEffect(() => {
    fetchRealData();
  }, [fetchRealData]);

  const handleDeleteVideo = useCallback(async (videoId: string) => {
    if (!db) return;

    if (confirm('Voulez-vous vraiment supprimer cette video ?')) {
      try {
        await deleteDoc(doc(db, 'videos', videoId));
        fetchRealData();
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  }, [fetchRealData]);

  const activeTabLabel = useMemo(
    () => TABS.find((tab) => tab.id === activeTab)?.label || 'Vue',
    [activeTab],
  );

  const overviewCards = useMemo(() => ([
    {
      label: 'Createurs',
      value: stats.users,
      meta: 'Comptes detectes',
      icon: Users,
      accent: 'text-[#FF5E00]',
      iconBg: 'bg-[#FF5E00]/12',
    },
    {
      label: 'Videos',
      value: stats.videos,
      meta: 'Posts publies',
      icon: Video,
      accent: 'text-[#E60067]',
      iconBg: 'bg-[#E60067]/12',
    },
    {
      label: 'Likes recents',
      value: stats.recentLikes,
      meta: 'Lot recent',
      icon: Sparkles,
      accent: 'text-[#FFAA00]',
      iconBg: 'bg-[#FFAA00]/12',
    },
  ]), [stats]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#09050E] text-white selection:bg-[#FF5E00]/30 font-sans">
      <Head>
        <title>AFRO VIBE | Command Center</title>
        <meta name="theme-color" content="#13091B" />
      </Head>

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,94,0,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(230,0,103,0.16),transparent_26%),linear-gradient(180deg,#09050E_0%,#13091B_50%,#09050E_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/8 bg-[#100917]/88 px-6 py-8 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="mb-12 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5E00] via-[#FFAA00] to-[#E60067] shadow-[0_0_30px_rgba(255,94,0,0.25)]">
              <span className="text-xl font-black italic text-white">V</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/50">Brand Console</p>
              <h1 className="text-2xl font-black uppercase italic tracking-tight text-white">Afro Vibe</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {TABS.map((tab) => (
              <SidebarItem
                key={tab.id}
                icon={<tab.icon size={18} />}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </nav>

          <div className="mt-auto rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Direction</p>
            <p className="text-sm leading-6 text-white/70">
              Palette sombre premium, accents orange et magenta, surfaces plus nettes et lecture rapide.
            </p>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 flex flex-col gap-6 rounded-[32px] border border-white/8 bg-white/[0.035] p-6 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <div className="mb-3 flex items-center gap-2 text-[#E60067]">
                <Zap size={14} className="text-[#E60067]" />
                <span className="text-[10px] font-black uppercase tracking-[0.32em] text-white/70">Live Firebase Data</span>
              </div>
              <h2 className="text-4xl font-black uppercase italic leading-none tracking-tight text-white lg:text-5xl">
                {activeTab === 'overview' ? 'Command Center' : activeTabLabel}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
                Interface epuree, plus rapide et plus lisible pour piloter la plateforme sans surcharge visuelle.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <QuickPill icon={Gauge} label="Performance" />
              <QuickPill icon={Palette} label="Brand Theme" />
              <QuickPill icon={ShieldCheck} label="Stable Data" />
              <button
                onClick={fetchRealData}
                disabled={!firebaseConfigReady}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#FF5E00]/30 bg-[#FF5E00]/10 px-4 py-3 text-sm font-bold text-[#FFAA00] transition hover:bg-[#FF5E00]/16 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                Actualiser
              </button>
            </div>
          </motion.header>

          {!firebaseConfigReady ? (
            <Panel
              title="Configuration requise"
              subtitle="Variables .env manquantes pour le dashboard"
            >
              <div className="space-y-3 text-sm text-white/75">
                <p>Ajoute ces variables dans `server-next/.env.local` :</p>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4 font-mono text-xs leading-6 text-white/80">
                  {firebaseConfigMissingKeys.map((entry) => (
                    <div key={entry}>{entry}=...</div>
                  ))}
                </div>
              </div>
            </Panel>
          ) : null}

          {error ? (
            <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.section
                key="overview"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                className="space-y-6"
              >
                <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
                  <div className="rounded-[32px] border border-white/8 bg-[#12091A]/90 p-6 shadow-[0_12px_50px_rgba(0,0,0,0.28)]">
                    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/45">Signal plateforme</p>
                        <h3 className="text-2xl font-black uppercase italic text-white">Croissance lisible</h3>
                      </div>
                      <div className="rounded-2xl border border-[#FF5E00]/20 bg-[#FF5E00]/10 p-3 text-[#FF5E00]">
                        <TrendingUp size={20} />
                      </div>
                    </div>

                    <div className="flex min-h-[240px] items-end gap-2">
                      {chartSeries.map((value, index) => (
                        <div key={index} className="flex flex-1 flex-col items-center gap-3">
                          <div
                            className="w-full rounded-t-2xl bg-gradient-to-t from-[#FF5E00]/35 via-[#FF5E00]/70 to-[#FFAA00]"
                            style={{ height: `${value}%`, opacity: 0.45 + index * 0.03 }}
                          />
                          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-1">
                    {overviewCards.map((card) => (
                      <StatCard
                        key={card.label}
                        label={card.label}
                        value={card.value}
                        subValue={card.meta}
                        accent={card.accent}
                        iconBg={card.iconBg}
                        icon={<card.icon size={18} />}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <Panel title="Createurs en vue" subtitle="Top comptes par audience">
                    <div className="space-y-4">
                      {topCreators.map((creator) => (
                        <CreatorRow key={creator.id} creator={creator} />
                      ))}
                    </div>
                  </Panel>

                  <Panel title="Contenu recent" subtitle="Dernieres videos detectees">
                    <div className="space-y-4">
                      {recentVideos.map((video) => (
                        <ContentRow
                          key={video.id}
                          id={video.id}
                          title={video.caption || 'Sans titre'}
                          user={video.user_id || 'inconnu'}
                          reach={video.views || 0}
                          likes={video.likes || 0}
                          onDelete={() => handleDeleteVideo(video.id)}
                        />
                      ))}
                    </div>
                  </Panel>
                </div>
              </motion.section>
            )}

            {activeTab === 'videos' && (
              <motion.section
                key="videos"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
              >
                <Panel title="Gestion du contenu" subtitle="Suppression rapide et lecture des signaux clefs">
                  <div className="space-y-4">
                    {recentVideos.length > 0 ? (
                      recentVideos.map((video) => (
                        <ContentRow
                          key={video.id}
                          id={video.id}
                          title={video.caption || 'Sans titre'}
                          user={video.user_id || 'inconnu'}
                          reach={video.views || 0}
                          likes={video.likes || 0}
                          onDelete={() => handleDeleteVideo(video.id)}
                        />
                      ))
                    ) : (
                      <EmptyState label="Aucune video recente disponible." />
                    )}
                  </div>
                </Panel>
              </motion.section>
            )}

            {activeTab === 'users' && (
              <motion.section
                key="users"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
              >
                <Panel title="Base createurs" subtitle="Vue plus compacte et plus lisible">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {topCreators.map((creator) => (
                      <CreatorCard key={creator.id} creator={creator} />
                    ))}
                  </div>
                </Panel>
              </motion.section>
            )}

            {activeTab === 'settings' && (
              <motion.section
                key="settings"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <SettingsCard
                    icon={Palette}
                    title="Theme"
                    description="Palette noir profond, violet premium, orange tribal et magenta electrique."
                  />
                  <SettingsCard
                    icon={Gauge}
                    title="Performance"
                    description="Requetes reduites, surfaces plus simples et animations moins couteuses."
                  />
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
        body {
          margin: 0;
          background: #09050e;
          font-family: 'Space Grotesk', sans-serif;
        }
      `}</style>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
        active
          ? 'bg-white/[0.06] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.05)]'
          : 'text-white/45 hover:bg-white/[0.03] hover:text-white'
      }`}
    >
      {active ? (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[#FF5E00] to-[#E60067]" />
      ) : null}
      <span className={active ? 'text-[#FF5E00]' : ''}>{icon}</span>
      <span className="text-sm font-bold uppercase tracking-[0.16em]">{label}</span>
    </button>
  );
}

function QuickPill({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3 text-sm font-semibold text-white/75">
      <Icon size={15} className="text-[#FFAA00]" />
      {label}
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[32px] border border-white/8 bg-white/[0.03] p-6 backdrop-blur-xl">
      <div className="mb-6">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{subtitle}</p>
        <h3 className="text-2xl font-black uppercase italic text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  subValue,
  icon,
  accent,
  iconBg,
}: {
  label: string;
  value: string | number;
  subValue: string;
  icon: React.ReactNode;
  accent: string;
  iconBg: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/8 bg-[#12091A]/95 p-6">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.26em] text-white/40">{label}</span>
        <div className={`rounded-2xl p-3 ${iconBg}`}>{icon}</div>
      </div>
      <div className={`text-4xl font-black italic leading-none ${accent}`}>{value}</div>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/38">{subValue}</p>
    </div>
  );
}

function CreatorRow({ creator }: { creator: CreatorRecord }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/7 bg-white/[0.025] px-4 py-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5E00] to-[#E60067] font-black text-white">
          {creator.username?.[0]?.toUpperCase() || 'A'}
        </div>
        <div>
          <p className="font-bold text-white">@{creator.username || 'createur'}</p>
          <p className="text-sm text-white/48">{creator.fullName || 'Afro Vibe Creator'}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-black text-[#FFAA00]">{creator.followers || 0}</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/38">followers</p>
      </div>
    </div>
  );
}

function CreatorCard({ creator }: { creator: CreatorRecord }) {
  return (
    <div className="rounded-[28px] border border-white/8 bg-[#12091A]/95 p-5">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#FF5E00] to-[#E60067] text-2xl font-black text-white">
        {creator.username?.[0]?.toUpperCase() || 'A'}
      </div>
      <p className="text-lg font-black text-[#FF5E00]">@{creator.username || 'createur'}</p>
      <p className="mt-1 text-sm text-white/55">{creator.fullName || 'Afro Vibe Creator'}</p>
      <div className="mt-5 flex gap-6 text-xs font-bold uppercase tracking-[0.16em] text-white/38">
        <span>{creator.followers || 0} followers</span>
        <span>{creator.following || 0} following</span>
      </div>
    </div>
  );
}

function ContentRow({
  id,
  title,
  user,
  reach,
  likes,
  onDelete,
}: {
  id: string;
  title: string;
  user: string;
  reach: number;
  likes: number;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-white/8 bg-white/[0.02] p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF5E00]/10 text-[#FF5E00]">
          <Play size={16} className="fill-current" />
        </div>
        <div>
          <h4 className="font-bold text-white">{title}</h4>
          <p className="text-xs text-white/40">ID auteur: {user}</p>
          <p className="text-[11px] text-white/28">Document: {id}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Metric label="Views" value={reach} accent="text-white" />
        <Metric label="Likes" value={likes} accent="text-[#E60067]" />
        <button
          onClick={onDelete}
          className="rounded-2xl border border-red-500/15 bg-red-500/6 p-3 text-red-200 transition hover:bg-red-500/12"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="text-right">
      <p className={`text-lg font-black italic ${accent}`}>{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/38">{label}</p>
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[32px] border border-white/8 bg-white/[0.03] p-6">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF5E00]/10 text-[#FF5E00]">
        <Icon size={20} />
      </div>
      <h3 className="text-2xl font-black uppercase italic text-white">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-white/60">{description}</p>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-white/45">
      {label}
    </div>
  );
}
