import React from 'react';

const colors = {
  blue: 'from-blue-400 to-blue-600',
  red: 'from-red-400 to-red-600',
  purple: 'from-purple-400 to-purple-600',
  dark: 'from-gray-700 to-gray-900',
  green: 'from-green-400 to-green-600',
  yellow: 'from-yellow-400 to-yellow-600',
  teal: 'from-teal-400 to-teal-600',
  orange: 'from-orange-400 to-orange-600',
};

export default function StatsCard({ icon: Icon, label, value, color = 'blue', trend }) {
  return (
    <div
      className={`bg-gradient-to-r ${colors[color]} rounded-full px-6 py-4 text-white flex items-center gap-4 shadow-lg hover:shadow-xl transition-shadow min-h-24 flex-1`}
    >
      <div className="flex-shrink-0">
        <Icon size={40} className="text-white opacity-90" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white text-opacity-80">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {trend && <p className="text-xs text-white text-opacity-70 mt-1">{trend}</p>}
      </div>
    </div>
  );
}
