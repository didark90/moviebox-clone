import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSearch, FiMapPin } = FiIcons;

const SearchBar = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('movie');
  const [query, setQuery] = useState('');

  const runSearch = (value = query) => {
    const trimmed = value.trim();
    if (activeTab === 'movie') {
      navigate(`/?section=movies&q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate(`/?section=movies&location=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="flex mb-4 bg-white/10 backdrop-blur-md rounded-full p-1">
        <button
          onClick={() => setActiveTab('movie')}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
            activeTab === 'movie'
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Search Movies
        </button>
        <button
          onClick={() => setActiveTab('location')}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
            activeTab === 'location'
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Search by Location
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SafeIcon
            icon={activeTab === 'movie' ? FiSearch : FiMapPin}
            className="h-5 w-5 text-gray-400"
          />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch()}
          placeholder={
            activeTab === 'movie'
              ? 'Search for movies, genres...'
              : 'Enter your city or location...'
          }
          className="w-full pl-12 pr-32 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
        />

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => runSearch()}
          className="absolute inset-y-0 right-0 pr-2 flex items-center"
        >
          <div className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black px-6 py-2 rounded-full font-medium transition-all duration-300 flex items-center space-x-2">
            <SafeIcon icon={FiSearch} className="w-4 h-4" />
            <span>Search</span>
          </div>
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 flex flex-wrap gap-2 justify-center"
      >
        {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi'].map((genre) => (
          <motion.button
            key={genre}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              setActiveTab('movie');
              setQuery(genre);
              navigate(`/?section=movies&q=${encodeURIComponent(genre)}`);
            }}
            className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300"
          >
            {genre}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default SearchBar;
