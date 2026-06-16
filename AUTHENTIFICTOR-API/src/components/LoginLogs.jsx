import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download } from 'lucide-react';

export default function LoginLogs() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/admin/logs');
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        }
      } catch (error) {
        console.error('[v0] Failed to fetch logs:', error);
        setLogs([
          { id: 1, user: 'Alice Dupont', app: 'TestApp', provider: 'github', status: 'success', timestamp: '2024-01-15 14:30' },
          { id: 2, user: 'Bob Martin', app: 'TestApp', provider: 'google', status: 'success', timestamp: '2024-01-15 13:15' },
          { id: 3, user: 'Claire Lefebvre', app: 'TestApp', provider: 'github', status: 'success', timestamp: '2024-01-15 12:00' },
          { id: 4, user: 'Alice Dupont', app: 'TestApp', provider: 'google', status: 'failed', timestamp: '2024-01-14 16:45' },
        ]);
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'success') return log.status === 'success';
    if (filter === 'failed') return log.status === 'failed';
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Historique des connexions</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="success">Succès</option>
              <option value="failed">Échoué</option>
            </select>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Download size={18} />
            Exporter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Application</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Fournisseur</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Date/Heure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{log.user}</td>
                  <td className="px-6 py-4 text-gray-600">{log.app}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded capitalize">
                      {log.provider}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        log.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {log.status === 'success' ? 'Succès' : 'Échoué'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                    <Calendar size={16} />
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun log trouvé
          </div>
        )}
      </div>
    </div>
  );
}
