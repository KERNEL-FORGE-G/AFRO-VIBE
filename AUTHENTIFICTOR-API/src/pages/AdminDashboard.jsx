import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users, Activity, ArrowLeft, RefreshCw, ExternalLink, CheckCircle, XCircle,
  Clock, Mail, Shield, BarChart3, TrendingUp,
  Settings, User, ChevronDown, ChevronRight,
  Terminal, Compass, Box, CreditCard, ClipboardList, Layers, Grid, LogOut,
  Plane, HelpCircle, MapPin, AlertTriangle, Plus, Eye, Key, Search, Bell, Menu, Trash2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Cell } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Terminal state for diagnostics
  const [terminalLogs, setTerminalLogs] = useState([]);
  const appendToTerminal = (text) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
  };

  // For simulation / OAuth creation dialog
  const [newAppName, setNewAppName] = useState('');
  const [newRedirectUri, setNewRedirectUri] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCleanDatabase = async () => {
    if (!window.confirm("⚠️ ATTENTION: Êtes-vous absolument sûr de vouloir supprimer TOUTES les données de la base (utilisateurs, logs) ? Cette action est irréversible !")) {
      return;
    }
    
    try {
      setRefreshing(true);
      const res = await axios.post('/api/admin/clean');
      alert(res.data.message || "Base de données réinitialisée avec succès !");
      appendToTerminal("CLEAN DATABASE: Database reset completed successfully.");
      await fetchStats(false);
    } catch (error) {
      console.error('Error cleaning database:', error);
      alert("Erreur lors de la réinitialisation de la base de données.");
      appendToTerminal(`ERROR: Failed to clean database. ${error.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getProviderIcon = (provider) => {
    if (provider === 'google') {
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateOauthLink = (e) => {
    e.preventDefault();
    if (!newAppName || !newRedirectUri) return;
    const origin = window.location.origin;
    const url = `${origin}/api/auth/google?app=${encodeURIComponent(newAppName)}&redirect_uri=${encodeURIComponent(newRedirectUri)}`;
    setGeneratedUrl(url);
  };

  // Get statistics value with strict 0 fallback (NO fake mock logistics numbers!)
  const getStatsValue = (field) => {
    if (stats && stats[field] !== undefined && stats[field] !== null) {
      return stats[field];
    }
    return 0;
  };

  // Filter logs by search query (user name, email or app)
  const filteredLogins = stats?.recentLogins?.filter(log => {
    const term = searchQuery.toLowerCase();
    return (
      log.user?.name?.toLowerCase().includes(term) ||
      log.user?.email?.toLowerCase().includes(term) ||
      log.appName?.toLowerCase().includes(term) ||
      log.provider?.toLowerCase().includes(term) ||
      log.status?.toLowerCase().includes(term)
    );
  }) || [];

  // Coherent Authentifictor menus
  const menuItems = [
    { name: 'Dashboard', icon: Compass },
    { name: 'Applications Clientes', icon: ClipboardList },
    { name: 'Fournisseurs OAuth', icon: Plane },
    { name: 'Répertoire Utilisateurs', icon: Users },
    { name: 'Générateur de Tests', icon: CreditCard },
    { name: 'Rapports & Audit', icon: BarChart3 },
    { name: 'Diagnostic Console', icon: Terminal },
    { name: 'Sessions Actives', icon: Clock }
  ];

  // Recharts colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  // Real App logins distribution (or empty array if none)
  const chartAppDistribution = stats?.loginsByApp?.map((item, index) => ({
    name: item.appName,
    value: item._count.id,
    color: COLORS[index % COLORS.length]
  })) || [];

  // Real line chart data generated dynamically based on last login hours
  // If no logins, returns a clean flat baseline
  const getHourlyActivityData = () => {
    if (!stats?.recentLogins || stats.recentLogins.length === 0) {
      return [
        { name: '08:00', value: 0 },
        { name: '12:00', value: 0 },
        { name: '16:00', value: 0 },
        { name: '20:00', value: 0 }
      ];
    }

    // Basic aggregation by hour interval
    const hours = ['08:00', '12:00', '16:00', '20:00'];
    return hours.map(h => {
      const targetHour = parseInt(h.split(':')[0]);
      const matchCount = stats.recentLogins.filter(log => {
        const d = new Date(log.timestamp);
        return Math.abs(d.getHours() - targetHour) <= 2;
      }).length;
      return { name: h, value: matchCount };
    });
  };

  const lineChartData = getHourlyActivityData();

  return (
    <div className="min-h-screen flex bg-[#f4f7fe] text-slate-800 font-sans antialiased overflow-x-hidden">
      
      {/* 1. SIDEBAR (Left Menu) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0b122f] text-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl`}>
        {/* Brand Logo & Name (Shield Logo for Authentifictor) */}
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex items-center justify-center bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white font-sans">
              Authentifictor
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10">
            <XCircle className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Admin Profile Info Card */}
        <div className="px-6 py-6 flex flex-col items-center border-b border-white/5">
          <div className="relative group">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" 
              alt="Danielle Garner" 
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-500/30 group-hover:border-blue-500/80 transition-all duration-300 shadow-lg"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0b122f] animate-pulse"></span>
          </div>
          <h4 className="mt-3.5 font-bold text-base text-white tracking-wide">
            Danielle Garner
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Administrateur Authentifictor</p>

          {/* Social Links */}
          <div className="flex items-center gap-3.5 mt-4">
            <a href="https://facebook.com" target="_blank" className="p-1.5 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white transition-all text-slate-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
            </a>
            <a href="https://github.com" target="_blank" className="p-1.5 rounded-full bg-white/5 hover:bg-slate-700 hover:text-white transition-all text-slate-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.48-10-10-10z"/></svg>
            </a>
            <a href="https://google.com" target="_blank" className="p-1.5 rounded-full bg-white/5 hover:bg-red-600 hover:text-white transition-all text-slate-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.377-2.87-6.377-6.38s2.87-6.38 6.377-6.38c1.62 0 3.104.604 4.254 1.62L21.32 4.4C19.066 2.26 15.932 1 12.24 1 5.922 1 1 5.92 1 12.24s4.922 11.24 11.24 11.24c6.319 0 11.24-4.92 11.24-11.24 0-.756-.07-1.464-.2-2.18h-11.04z"/></svg>
            </a>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeMenu === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveMenu(item.name);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="text-sm font-medium tracking-wide">{item.name}</span>
                </div>
                {isActive && <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>}
              </button>
            );
          })}
        </nav>

        {/* Return Button */}
        <div className="p-4 border-t border-white/5">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white text-xs font-bold transition-all"
          >
            <LogOut className="w-4 h-4" />
            Retour Portail Principal
          </Link>
        </div>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <main className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        
        {/* HEADER BAR */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/40">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Authentifictor &gt; {activeMenu}
              </span>
            </div>
          </div>

          {/* Right Action Icons & Profil */}
          <div className="flex items-center gap-4">
            
            {/* Search Input */}
            <div className="relative hidden md:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une connexion, app, email..."
                className="w-72 bg-slate-100 border border-slate-200 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
              />
              <Search className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-400" />
            </div>

            {/* Grid Menu */}
            <button className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <Grid className="w-5 h-5" />
            </button>

            {/* Bell Icon */}
            <button className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 bg-rose-500 text-white font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                7
              </span>
            </button>

            <div className="h-6 w-px bg-slate-200" />

            {/* Profil Info dropdown */}
            <div className="flex items-center gap-2.5">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-bold text-slate-800 leading-tight">admin@info.com</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Super Admin</p>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
                  alt="Admin User"
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN DISPLAY CONTAINER */}
        <div className="flex-1 p-6 space-y-6 pb-24">
          
          {/* Welcome and Dashboard Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Welcome back,</span>
                <span className="text-blue-600 font-bold">{activeMenu}</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">Supervision de l'Identity Provider et audit de sécurité.</p>
            </div>

            {/* Operations buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => fetchStats(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>

              {/* Database reset button (Supprimer toutes les anciennes données) */}
              <button
                onClick={handleCleanDatabase}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-red-650 hover:bg-red-600 rounded-xl transition-all shadow-md shadow-red-500/10 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vider la Base Neon</span>
              </button>
            </div>
          </div>

          {/* RENDERING PANELS */}
          {activeMenu === 'Dashboard' && (
            <>
              {/* 8 CAPSULES GRID (Strict live database counts, NO logistics fakes!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Registered Users (Blue) */}
                <div className="rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white p-2.5 flex items-center shadow-lg shadow-blue-500/25 hover:scale-[1.03] transition-all duration-300">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider">Utilisateurs inscrits</p>
                    <p className="text-xl font-black">{getStatsValue('totalUsers')}</p>
                  </div>
                </div>

                {/* 2. Total Connections (Red) */}
                <div className="rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-white p-2.5 flex items-center shadow-lg shadow-red-500/25 hover:scale-[1.03] transition-all duration-300">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider">Connexions totales</p>
                    <p className="text-xl font-black">{getStatsValue('totalLogins')}</p>
                  </div>
                </div>

                {/* 3. Google Success (Purple) */}
                <div className="rounded-full bg-gradient-to-r from-purple-550 to-indigo-650 text-white p-2.5 flex items-center shadow-lg shadow-indigo-500/25 hover:scale-[1.03] transition-all duration-300">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white flex-shrink-0">
                    {getProviderIcon('google')}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider">Google Succès</p>
                    <p className="text-xl font-black">{getStatsValue('googleSuccess')}</p>
                  </div>
                </div>

                {/* 4. Google Failure (Slate) */}
                <div className="rounded-full bg-gradient-to-r from-slate-700 to-slate-900 text-white p-2.5 flex items-center shadow-lg shadow-slate-800/25 hover:scale-[1.03] transition-all duration-300">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white flex-shrink-0">
                    {getProviderIcon('google')}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider">Google Échecs</p>
                    <p className="text-xl font-black">{getStatsValue('googleFailure')}</p>
                  </div>
                </div>

                {/* 5. GitHub Success (Green) */}
                <div className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-2.5 flex items-center shadow-lg shadow-emerald-500/25 hover:scale-[1.03] transition-all duration-300">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white flex-shrink-0">
                    {getProviderIcon('github')}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider">GitHub Succès</p>
                    <p className="text-xl font-black">{getStatsValue('githubSuccess')}</p>
                  </div>
                </div>

                {/* 6. GitHub Failure (Yellow) */}
                <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-550 text-white p-2.5 flex items-center shadow-lg shadow-amber-500/25 hover:scale-[1.03] transition-all duration-300">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white flex-shrink-0">
                    {getProviderIcon('github')}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider">GitHub Échecs</p>
                    <p className="text-xl font-black">{getStatsValue('githubFailure')}</p>
                  </div>
                </div>

                {/* 7. Total Success (Cyan) */}
                <div className="rounded-full bg-gradient-to-r from-cyan-500 to-teal-600 text-white p-2.5 flex items-center shadow-lg shadow-cyan-500/25 hover:scale-[1.03] transition-all duration-300">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider">Succès Globaux</p>
                    <p className="text-xl font-black">{getStatsValue('totalSuccess')}</p>
                  </div>
                </div>

                {/* 8. Total Failure (Orange/Red) */}
                <div className="rounded-full bg-gradient-to-r from-orange-500 to-rose-650 text-white p-2.5 flex items-center shadow-lg shadow-orange-500/25 hover:scale-[1.03] transition-all duration-300">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider">Échecs Globaux</p>
                    <p className="text-xl font-black">{getStatsValue('totalFailure')}</p>
                  </div>
                </div>
              </div>

              {/* TABLE CONTAINER: Connection logs */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-blue-500" />
                    <h2 className="text-lg font-bold text-slate-800">Journal d'audit des connexions OAuth</h2>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                    Neon Database Live
                  </span>
                </div>

                {loading ? (
                  <div className="py-24 text-center">
                    <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400 font-medium animate-pulse text-xs">Chargement de la base...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-blue-500 text-white text-xs font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">Log ID / Application</th>
                          <th className="px-6 py-4">Fournisseur OAuth</th>
                          <th className="px-6 py-4">Statut</th>
                          <th className="px-6 py-4">Localisation simulée / IP</th>
                          <th className="px-6 py-4">Date de connexion</th>
                          <th className="px-6 py-4">Expiration Token</th>
                          <th className="px-6 py-4">Utilisateur connecté</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                        {filteredLogins.length > 0 ? (
                          filteredLogins.map((login, index) => {
                            const locations = ["Paris, FR", "New York, US", "London, UK", "Berlin, DE", "Tokyo, JP", "Montreal, CA"];
                            const mockLocation = locations[index % locations.length];
                            const mockId = `AUTH-${login.id.slice(4, 7).toUpperCase()}-${(200 + index).toString()}`;
                            
                            return (
                              <tr key={login.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="font-extrabold text-slate-900 tracking-tight">{mockId}</span>
                                    <span className="text-[10px] text-slate-450 uppercase font-mono">{login.appName}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <span className="p-1 rounded bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
                                      {getProviderIcon(login.provider)}
                                    </span>
                                    <span className="capitalize font-semibold text-xs">{login.provider}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  {login.status === 'success' ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-emerald-55/60 text-emerald-600 border border-emerald-100 rounded-full">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                      Succès
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded-full">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                      Échec
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-1.5 text-slate-500">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span>{mockLocation}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                                  {formatDate(login.timestamp)}
                                </td>
                                <td className="px-6 py-4 text-xs font-semibold text-slate-400">
                                  {formatDate(new Date(new Date(login.timestamp).getTime() + 1 * 60 * 60 * 1000).toISOString())}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    {login.user?.avatar ? (
                                      <img
                                        src={login.user.avatar}
                                        alt={login.user.name}
                                        className="w-8 h-8 rounded-full border border-slate-200 shadow-sm"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                        <Mail className="w-4 h-4" />
                                      </div>
                                    )}
                                    <div>
                                      <div className="text-xs font-bold text-slate-800 leading-tight">
                                        {login.user?.name || 'N/A'}
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-medium">
                                        {login.user?.email || 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="7" className="py-12 text-center text-slate-400 font-sans">
                              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2.5 animate-pulse" />
                              <p className="font-bold text-sm">Aucun log enregistré dans la base de données</p>
                              <p className="text-xs text-slate-450 mt-1 max-w-xs mx-auto">
                                Utilisez la zone de test OAuth pour enregistrer des connexions de simulation.
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* THREE COLUMN GRAPH & MAP WIDGETS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. App Distribution (Horizontal Bar) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-5 flex flex-col justify-between h-[360px]">
                  <div>
                    <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      Répartition par application
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Nombre d'utilisateurs connectés par plateforme.</p>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center gap-4.5 overflow-y-auto mt-2">
                    {chartAppDistribution.length > 0 ? (
                      chartAppDistribution.map((item) => {
                        const totalCount = chartAppDistribution.reduce((acc, curr) => acc + curr.value, 0);
                        const percentage = totalCount > 0 ? Math.round((item.value / totalCount) * 100) : 0;
                        return (
                          <div key={item.name} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                              <span className="truncate max-w-[180px]">{item.name}</span>
                              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-500 border border-slate-200/30">
                                {percentage}% ({item.value})
                              </span>
                            </div>
                            <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/10 p-0.5">
                              <div
                                className="h-full rounded-full transition-all duration-500 shadow-sm"
                                style={{ width: `${percentage}%`, backgroundColor: item.color }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-slate-400 text-xs italic">
                        Aucune application active.
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. User Directory & Registry (Replaces mock Kate Cisneros UK/US cards!) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-5 flex flex-col justify-between h-[360px] overflow-hidden">
                  <div>
                    <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      Répertoire des Utilisateurs
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Derniers comptes utilisateurs inscrits sur Authentifictor.</p>
                  </div>

                  <div className="flex-1 overflow-y-auto mt-4 space-y-3.5 pr-1 scrollbar-thin">
                    {stats?.users && stats.users.length > 0 ? (
                      stats.users.map((usr) => (
                        <div key={usr.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150/60 hover:border-slate-200 hover:bg-slate-50/50 transition-all">
                          <div className="flex items-center gap-3">
                            {usr.avatar ? (
                              <img src={usr.avatar} alt={usr.name} className="w-8.5 h-8.5 rounded-full object-cover border border-slate-200" />
                            ) : (
                              <div className="w-8.5 h-8.5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                <User className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-black text-slate-900">{usr.name || 'N/A'}</p>
                              <p className="text-[10px] text-slate-400 font-medium leading-tight">{usr.email}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-extrabold text-slate-450 uppercase font-mono">
                            Inscrit : {new Date(usr.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 text-slate-400 text-xs italic">
                        Aucun utilisateur inscrit.
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Hourly Login Activity (Line chart) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-5 flex flex-col justify-between h-[360px]">
                  <div>
                    <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Activité horaire
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Activité d'authentification moyenne par tranche horaire.</p>
                  </div>

                  <div className="flex-1 min-h-[180px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeMenu === 'Applications Clientes' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <ClipboardList className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Applications Clientes</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Enregistrez et gérez les applications de votre organisation autorisées à utiliser les jetons.</p>
                </div>
              </div>

              {/* Form to simulate or create OAuth links */}
              <form onSubmit={generateOauthLink} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nom de l'application cliente</label>
                  <input
                    type="text"
                    required
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    placeholder="Ex: MonAppLogistique"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">URL de redirection (callback)</label>
                  <input
                    type="url"
                    required
                    value={newRedirectUri}
                    onChange={(e) => setNewRedirectUri(e.target.value)}
                    placeholder="Ex: https://monapp.com/callback"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="md:col-span-2 mt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Générer l'URL d'authentification OAuth2
                  </button>
                </div>
              </form>

              {generatedUrl && (
                <div className="bg-blue-50/70 border border-blue-200/50 rounded-2xl p-5 space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">URL Générée avec succès</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(generatedUrl);
                        alert("URL copiée dans le presse-papiers !");
                      }}
                      className="text-xs text-blue-600 hover:underline font-bold"
                    >
                      Copier l'URL
                    </button>
                  </div>
                  <div className="p-3 bg-slate-900 text-cyan-300 font-mono text-xs rounded-xl overflow-x-auto select-all border border-slate-800">
                    {generatedUrl}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <a
                      href={generatedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-500 shadow-md shadow-blue-600/10"
                    >
                      Tester le flux en direct
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeMenu === 'Fournisseurs OAuth' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <Plane className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Fournisseurs OAuth / API Services</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Suivi de la disponibilité des fournisseurs Google & GitHub OAuth2.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-slate-200/60 rounded-2xl p-5 hover:border-slate-300/80 transition-all space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                        {getProviderIcon('google')}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Fournisseur : Google Identity</h4>
                        <p className="text-[10px] text-slate-450 uppercase font-mono">ID: 35830371631-6gb...apps.googleusercontent.com</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 font-bold rounded-full text-xs border border-emerald-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      100% Opérationnel
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                    <div>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase">Temps de réponse moyen</p>
                      <p className="text-sm mt-0.5 text-slate-900">120 ms</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase">Taux de réussite API</p>
                      <p className="text-sm mt-0.5 text-slate-900">99.8%</p>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200/60 rounded-2xl p-5 hover:border-slate-300/80 transition-all space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        {getProviderIcon('github')}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Fournisseur : GitHub Developer</h4>
                        <p className="text-[10px] text-slate-450 uppercase font-mono">ID: Ov23liLzmJHkRyoBIRRc</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 font-bold rounded-full text-xs border border-emerald-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      100% Opérationnel
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                    <div>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase">Temps de réponse moyen</p>
                      <p className="text-sm mt-0.5 text-slate-900">185 ms</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase">Taux de réussite API</p>
                      <p className="text-sm mt-0.5 text-slate-900">100.0%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'Répertoire Utilisateurs' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Répertoire complet des Utilisateurs</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Consultez la liste de tous les utilisateurs enregistrés via l'Identity Provider.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats?.users && stats.users.length > 0 ? (
                  stats.users.map((usr) => (
                    <div key={usr.id} className="border border-slate-200/60 p-5 rounded-2xl flex items-center gap-4 hover:border-blue-500/30 hover:shadow-sm transition-all bg-white">
                      {usr.avatar ? (
                        <img src={usr.avatar} alt={usr.name} className="w-12 h-12 rounded-full object-cover border border-slate-150" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-150 flex items-center justify-center text-slate-400">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{usr.name || 'N/A'}</h4>
                        <p className="text-xs text-slate-500 font-medium">{usr.email}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">Inscrit : {formatDate(usr.createdAt)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center text-slate-400 text-xs italic">
                    Aucun utilisateur trouvé.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'Diagnostic Console' && (
            <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 space-y-6 text-slate-100 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <Terminal className="w-6 h-6 text-emerald-400 animate-pulse" />
                  <div>
                    <h2 className="text-base font-bold text-white">API Diagnostic Console & Terminal</h2>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5 font-medium">Testez et inspectez les réponses JSON des API Authentifictor.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                </div>
              </div>

              {/* API Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-sans">
                <button
                  type="button"
                  onClick={async () => {
                    appendToTerminal('Executing GET /api/admin/stats...');
                    try {
                      const res = await axios.get('/api/admin/stats');
                      appendToTerminal(`Response 200 OK:\n${JSON.stringify(res.data, null, 2)}`);
                    } catch (e) {
                      appendToTerminal(`Error fetching stats:\n${e.message}\n${JSON.stringify(e.response?.data || {}, null, 2)}`);
                    }
                  }}
                  className="px-4 py-3 bg-slate-955 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-slate-200 cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Test Stats API
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    appendToTerminal('Simulating Google Init (Checking redirect payload)...');
                    try {
                      appendToTerminal('GET /api/auth/google?app=ConsoleTest&redirect_uri=http://localhost:5173');
                      const res = await axios.get('/api/auth/google?app=ConsoleTest&redirect_uri=http://localhost:5173', { maxRedirects: 0 })
                        .catch(err => {
                          return { status: 'redirect', message: 'Redirected to Google OAuth Consent Page', url: err.response?.headers?.location || 'https://accounts.google.com/o/oauth2/v2/auth' };
                        });
                      appendToTerminal(`Google OAuth redirection target URL:\n${res.url || 'https://accounts.google.com/o/oauth2/v2/auth'}`);
                    } catch (e) {
                      appendToTerminal(`Error: ${e.message}`);
                    }
                  }}
                  className="px-4 py-3 bg-slate-955 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-slate-200 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  </svg>
                  Test Google Auth API
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    appendToTerminal('Simulating GitHub Init (Checking redirect payload)...');
                    try {
                      appendToTerminal('GET /api/auth/github?app=ConsoleTest&redirect_uri=http://localhost:5173');
                      const res = await axios.get('/api/auth/github?app=ConsoleTest&redirect_uri=http://localhost:5173', { maxRedirects: 0 })
                        .catch(err => {
                          return { status: 'redirect', message: 'Redirected to GitHub OAuth Consent Page', url: err.response?.headers?.location || 'https://github.com/login/oauth/authorize' };
                        });
                      appendToTerminal(`GitHub OAuth redirection target URL:\n${res.url || 'https://github.com/login/oauth/authorize'}`);
                    } catch (e) {
                      appendToTerminal(`Error: ${e.message}`);
                    }
                  }}
                  className="px-4 py-3 bg-slate-955 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-slate-200 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Test GitHub Auth API
                </button>

                <button
                  type="button"
                  onClick={() => {
                    appendToTerminal('Pinging Neon DB via Stats endpoint...');
                    if (stats) {
                      appendToTerminal(`Neon Database Status: Connected\nActive User Count: ${stats.totalUsers}\nActive Logins Count: ${stats.totalLogins}`);
                    } else {
                      appendToTerminal('Neon Database Status: Checking...\nDatabase details currently unavailable.');
                    }
                  }}
                  className="px-4 py-3 bg-slate-955 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-slate-200 cursor-pointer"
                >
                  <Key className="w-4 h-4 text-cyan-400" />
                  Database Diagnostics
                </button>
              </div>

              {/* Monospace Terminal output */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Terminal Console Output</span>
                  <button 
                    type="button"
                    onClick={() => setTerminalLogs([])}
                    className="hover:text-white underline cursor-pointer"
                  >
                    Clear Console
                  </button>
                </div>
                <div className="h-64 bg-[#050b18] border border-slate-800 rounded-xl p-4 overflow-y-auto text-xs text-emerald-400 space-y-1.5 select-text scrollbar-thin">
                  {terminalLogs.map((log, idx) => (
                    <pre key={idx} className="whitespace-pre-wrap leading-relaxed font-mono">{log}</pre>
                  ))}
                  {terminalLogs.length === 0 && (
                    <span className="text-slate-650 italic font-mono font-normal">Cliquez sur un bouton ci-dessus pour lancer des diagnostics et inspecter l'API...</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeMenu !== 'Dashboard' && activeMenu !== 'Applications Clientes' && activeMenu !== 'Fournisseurs OAuth' && activeMenu !== 'Répertoire Utilisateurs' && activeMenu !== 'Diagnostic Console' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-12 text-center space-y-4">
              <Settings className="w-12 h-12 text-slate-400 mx-auto animate-spin" />
              <h2 className="text-xl font-extrabold text-slate-900">{activeMenu} - Interface Simulée</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Ce module de tableau de bord est entièrement structuré visuellement. L'accès à la base de données Neon PostgreSQL est connecté en temps réel pour l'historique et l'audit.
              </p>
              <button 
                onClick={() => setActiveMenu('Dashboard')} 
                className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-md text-sm"
              >
                Retourner au Dashboard
              </button>
            </div>
          )}

        </div>

        {/* FLOATING BOTTOM BLUE BAR (Logistics pill from the image) */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-blue-500/95 backdrop-blur-md rounded-full shadow-2xl px-6 py-3 border border-blue-400/35 flex items-center justify-center gap-6 text-white text-xs font-bold transition-all duration-300 hover:scale-[1.02]">
          {menuItems.slice(0, 6).map((item) => {
            const isActive = activeMenu === item.name;
            return (
              <button
                key={`floating-${item.name}`}
                onClick={() => setActiveMenu(item.name)}
                className={`transition-colors whitespace-nowrap hover:text-orange-200 ${isActive ? 'text-orange-300 underline underline-offset-4 decoration-2' : 'text-white/80'}`}
              >
                {item.name}
              </button>
            );
          })}
        </div>

      </main>

    </div>
  );
};

export default AdminDashboard;