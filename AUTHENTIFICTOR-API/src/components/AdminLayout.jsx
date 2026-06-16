import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Menu, X, ChevronDown, Search, Bell,
  BarChart3, Truck, Package, Warehouse, DollarSign,
  Users, Settings, HelpCircle
} from 'lucide-react';

export default function AdminLayout({ children, activeTab = 'logistics' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigationItems = [
    { id: 'logistics', label: 'Logistics', icon: BarChart3 },
    { id: 'orders', label: 'Order Management', icon: Package },
    { id: 'fleet', label: 'Fleet Management', icon: Truck },
    { id: 'warehouse', label: 'Warehouse', icon: Warehouse },
    { id: 'income', label: 'Orders & Income', icon: DollarSign },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const menuItems = [
    { label: 'Logistics', icon: BarChart3 },
    { label: 'Order Management', icon: Package },
    { label: 'Fleet Management', icon: Truck },
    { label: 'Warehouse', icon: Warehouse },
    { label: 'Orders & Income', icon: DollarSign },
    { label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-indigo-900 to-indigo-800 text-white transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-indigo-700">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center font-bold">
                L
              </div>
              <span className="text-xl font-bold">Logistix</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-indigo-700">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || 'https://via.placeholder.com/40'}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-indigo-300 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 space-y-2 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  sidebarOpen ? 'justify-start' : 'justify-center'
                } hover:bg-indigo-700`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Menu */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-indigo-700 bg-indigo-900">
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-700 transition-colors">
            <Settings size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-600 transition-colors text-red-300 hover:text-white"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center flex-1 gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <img
                  src={user?.avatar || 'https://via.placeholder.com/32'}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                <ChevronDown size={16} />
              </button>
              {profileDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-48 z-50">
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                    Preferences
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>

        {/* Bottom Navigation Bar */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white p-4 flex items-center justify-center gap-8">
          {navigationItems.slice(0, 6).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === item.id ? 'bg-white bg-opacity-20' : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
