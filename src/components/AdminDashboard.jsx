import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import DashboardTab from './admin/DashboardTab';
import BookingsTab from './admin/BookingsTab';
import MoviesTab from './admin/MoviesTab';
import UsersTab from './admin/UsersTab';
import SettingsTab from './admin/SettingsTab';
import { useAuth } from '../context/AuthContext';

const { FiMenu, FiX, FiHome, FiCalendar, FiFilm, FiUsers, FiSettings, FiSun, FiMoon, FiBell, FiLogOut, FiChevronDown } = FiIcons;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage or default to true
    const saved = localStorage.getItem('admin-dark-mode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState(3);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('admin-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: FiHome },
    { id: 'bookings', name: 'Bookings', icon: FiCalendar },
    { id: 'movies', name: 'Movies', icon: FiFilm },
    { id: 'users', name: 'Users', icon: FiUsers },
    { id: 'settings', name: 'Settings', icon: FiSettings }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab darkMode={darkMode} />;
      case 'bookings':
        return <BookingsTab darkMode={darkMode} />;
      case 'movies':
        return <MoviesTab darkMode={darkMode} />;
      case 'users':
        return <UsersTab darkMode={darkMode} />;
      case 'settings':
        return <SettingsTab darkMode={darkMode} />;
      default:
        return <DashboardTab darkMode={darkMode} />;
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const theme = darkMode ? 'dark' : '';

  return (
    <div className={`${theme} min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`fixed inset-y-0 left-0 z-50 w-64 border-r shadow-xl transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}
            >
              {/* Sidebar Header */}
              <div className={`flex items-center justify-between p-6 border-b transition-colors duration-300 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-gold-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <div>
                    <span className={`text-xl font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>MovieBox</span>
                    <p className={`text-xs transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Admin Panel</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="p-4 space-y-2 flex-1">
                {sidebarItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25'
                        : darkMode
                        ? 'text-gray-300 hover:bg-gray-700/50'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <SafeIcon icon={item.icon} className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </motion.button>
                ))}
              </nav>

              {/* Bottom Actions */}
              <div className={`p-4 border-t space-y-2 transition-colors duration-300 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <button
                  onClick={() => navigate('/')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    darkMode
                      ? 'text-gray-400 hover:text-purple-400 hover:bg-gray-700/50'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
                  }`}
                >
                  <SafeIcon icon={FiHome} className="w-5 h-5" />
                  <span>Back to Site</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  darkMode
                    ? 'text-red-400 hover:bg-red-900/20'
                    : 'text-red-600 hover:bg-red-50'
                }`}>
                  <SafeIcon icon={FiLogOut} className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className={`flex-1 ${sidebarOpen ? 'lg:ml-64' : ''} transition-all duration-300`}>
          {/* Header */}
          <header className={`border-b px-6 py-4 sticky top-0 z-40 transition-colors duration-300 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    darkMode
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <SafeIcon icon={FiMenu} className="w-5 h-5" />
                </button>
                <div>
                  <h1 className={`text-2xl font-bold capitalize transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {activeTab}
                  </h1>
                  <p className={`text-sm transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Manage your movie booking platform
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-2 rounded-lg transition-all duration-200 ${
                    darkMode
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <SafeIcon icon={FiBell} className="w-5 h-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </motion.button>

                {/* Theme Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    darkMode
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <SafeIcon icon={darkMode ? FiSun : FiMoon} className="w-5 h-5" />
                </motion.button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-gold-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">{(user?.name || 'A').charAt(0)}</span>
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className={`font-medium text-sm transition-colors duration-300 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{user?.name || 'Admin User'}</p>
                      <p className={`text-xs transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>{user?.role === 'admin' ? 'Super Admin' : 'Admin'}</p>
                    </div>
                    <SafeIcon icon={FiChevronDown} className={`w-4 h-4 transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                  </motion.button>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6">
            {renderActiveTab()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;