import React, { useState } from 'react';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    appName: 'Authentificator',
    allowGithub: true,
    allowGoogle: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('[v0] Failed to save settings:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Paramètres</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* App Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Nom de l'application
            </label>
            <input
              type="text"
              name="appName"
              value={settings.appName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Session Timeout */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Délai d'expiration de session (minutes)
            </label>
            <input
              type="number"
              name="sessionTimeout"
              value={settings.sessionTimeout}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Max Login Attempts */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Tentatives de connexion maximum
            </label>
            <input
              type="number"
              name="maxLoginAttempts"
              value={settings.maxLoginAttempts}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* OAuth Providers */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-bold text-gray-900">Fournisseurs OAuth</h3>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="allowGithub"
                checked={settings.allowGithub}
                onChange={handleChange}
                className="w-5 h-5 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">Activer GitHub OAuth</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="allowGoogle"
                checked={settings.allowGoogle}
                onChange={handleChange}
                className="w-5 h-5 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">Activer Google OAuth</span>
            </label>
          </div>

          {/* Info box */}
          <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Information</p>
              <p className="text-sm text-blue-800 mt-1">
                Les modifications apportées à ces paramètres affecteront tous les utilisateurs de l'application.
              </p>
            </div>
          </div>

          {/* Save Status */}
          {saved && (
            <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Paramètres sauvegardés</p>
                <p className="text-sm text-green-800 mt-1">
                  Vos paramètres ont été mis à jour avec succès.
                </p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Save size={20} />
            Enregistrer les paramètres
          </button>
        </div>
      </div>
    </div>
  );
}
