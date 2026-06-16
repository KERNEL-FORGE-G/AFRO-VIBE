import React, { useState, useEffect } from 'react';
import { Users, Activity, TrendingUp, Clock } from 'lucide-react';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    totalLogins: 0,
    avgSessionTime: 0,
  });

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('[v0] Failed to fetch stats:', error);
        // Set demo data
        setStats({
          totalUsers: 42,
          activeToday: 18,
          totalLogins: 156,
          avgSessionTime: 24,
        });
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      icon: Users,
      label: 'Utilisateurs totaux',
      value: stats.totalUsers,
      color: 'bg-blue-500',
    },
    {
      icon: Activity,
      label: 'Actifs aujourd\'hui',
      value: stats.activeToday,
      color: 'bg-green-500',
    },
    {
      icon: TrendingUp,
      label: 'Total des connexions',
      value: stats.totalLogins,
      color: 'bg-purple-500',
    },
    {
      icon: Clock,
      label: 'Temps moyen (min)',
      value: stats.avgSessionTime,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Vue d'ensemble</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg text-white`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart placeholder */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Connexions par jour</h3>
          <div className="h-64 bg-gradient-to-b from-blue-100 to-blue-50 rounded flex items-center justify-center text-gray-500">
            Graphique des connexions
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Activité récente</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-900">Utilisateur {i}</p>
                  <p className="text-xs text-gray-600">il y a {i} heures</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Connecté</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
