import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, ChevronDown } from 'lucide-react';

export default function AdminHeader({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-blue-500 rounded-lg transition"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm">
            <p className="font-semibold">{user?.name || 'User'}</p>
            <p className="text-blue-100 text-xs">{user?.email || 'No email'}</p>
          </div>

          {user?.avatar && (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full border-2 border-white"
            />
          )}

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 hover:bg-blue-500 rounded-lg transition"
            >
              <ChevronDown size={20} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white text-gray-800 rounded-lg shadow-xl z-50 min-w-48">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2 rounded-lg transition"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
