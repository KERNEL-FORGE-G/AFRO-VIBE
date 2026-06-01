import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { LayoutDashboard, Users, Video, BarChart3, Settings } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, videos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch - in a real app, you would fetch from your API
    const fetchStats = async () => {
      try {
        // Mock data for now
        setStats({ users: 42, videos: 156 });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Head>
        <title>Afro Vibe | Admin Dashboard</title>
      </Head>

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-xl">AV</div>
          <span className="text-xl font-bold tracking-tight">Afro Vibe <span className="text-orange-500">Admin</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active />
          <NavItem icon={<Users size={20} />} label="Users" />
          <NavItem icon={<Video size={20} />} label="Content" />
          <NavItem icon={<BarChart3 size={20} />} label="Analytics" />
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </div>
      </div>

      {/* Main Content */}
      <main className="ml-64 p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Admin</h1>
          <p className="text-slate-400">Everything looks great today. Here's what's happening on the platform.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Users" value={stats.users.toString()} change="+12% this month" />
          <StatCard title="Total Videos" value={stats.videos.toString()} change="+8% this month" />
          <StatCard title="Total Views" value="1.2M" change="+25% this week" />
          <StatCard title="Revenue" value="$4.5k" change="+5% today" />
        </div>

        {/* Recent Activity Section */}
        <section className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Platform Activity</h2>
            <button className="text-orange-500 text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="p-6">
            <div className="text-slate-400 text-sm italic">
              Platform activity monitoring is initializing...
            </div>
          </div>
        </section>
      </main>

      {/* Style overrides for the demo (no external CSS needed) */}
      <style jsx global>{`
        body { margin: 0; background: #020617; }
        .font-sans { font-family: system-ui, -apple-system, sans-serif; }
      `}</style>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}

function StatCard({ title, value, change }: { title: string, value: string, change: string }) {
  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
      <h3 className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wider">{title}</h3>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className="text-xs text-green-400 font-medium">{change}</div>
    </div>
  );
}
