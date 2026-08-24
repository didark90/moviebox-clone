import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const { FiMenu, FiX, FiUser, FiSettings, FiLogOut } = FiIcons;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Movies', href: '#movies' },
    { name: 'Theaters', href: '#theaters' },
    { name: 'Contact', href: '#contact' }
  ];

  const scrollToSection = (selector) => {
    const element = document.querySelector(selector);
    if (!element) return;
    const navOffset = 80;
    let offset = 0;
    let node = element;
    while (node) {
      offset += node.offsetTop;
      node = node.offsetParent;
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    window.scrollTo({ top: Math.max(0, offset - navOffset), behavior: 'smooth' });
  };

  const handleNavClick = (item) => {
    const section = item.href.replace('#', '');
    if (location.pathname === '/') {
      scrollToSection(item.href);
    }
    navigate(`/?section=${section}`);
    setIsMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-gold-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-white font-bold text-xl">MovieBox</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavClick(item)}
                  whileHover={{ scale: 1.05 }}
                  className="text-gray-300 hover:text-gold-400 px-3 py-2 text-sm font-medium transition-colors duration-300"
                >
                  {item.name}
                </motion.button>
              ))}
              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/admin')}
                  className="text-gray-300 hover:text-purple-400 px-3 py-2 text-sm font-medium transition-colors duration-300 flex items-center space-x-1"
                >
                  <SafeIcon icon={FiSettings} className="w-4 h-4" />
                  <span>Admin</span>
                </motion.button>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <span className="text-gray-300 text-sm">{user.name}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { logout(); navigate('/'); }}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center space-x-2"
                >
                  <SafeIcon icon={FiLogOut} className="w-4 h-4" />
                  <span>Logout</span>
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 flex items-center space-x-2"
              >
                <SafeIcon icon={FiUser} className="w-4 h-4" />
                <span>Login</span>
              </motion.button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              <SafeIcon icon={isMenuOpen ? FiX : FiMenu} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-black/90 backdrop-blur-md rounded-lg mt-2 p-4"
          >
            <div className="space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item)}
                  className="block w-full text-left text-gray-300 hover:text-gold-400 px-3 py-2 text-sm font-medium transition-colors duration-300"
                >
                  {item.name}
                </button>
              ))}
              {isAdmin && (
                <button
                  onClick={() => {
                    navigate('/admin');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left text-gray-300 hover:text-purple-400 px-3 py-2 text-sm font-medium transition-colors duration-300 flex items-center space-x-2"
                >
                  <SafeIcon icon={FiSettings} className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              )}
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full bg-white/10 text-white px-6 py-2 rounded-full font-medium flex items-center justify-center space-x-2"
                >
                  <SafeIcon icon={FiLogOut} className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate('/login');
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <SafeIcon icon={FiUser} className="w-4 h-4" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;