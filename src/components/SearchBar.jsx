import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { api } from '../api';

const { FiSearch, FiMapPin } = FiIcons;
const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi'];
const FALLBACK_CITIES = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Nice'];
const TABS = [
  { id: 'movie', short: 'Movies', label: 'Search Movies' },
  { id: 'location', short: 'Location', label: 'Search by Location' }
];

const SearchBar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlLocation = searchParams.get('location') || '';
  const urlQuery = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState(urlLocation ? 'location' : 'movie');
  const [query, setQuery] = useState(urlLocation || urlQuery);
  const [cities, setCities] = useState(FALLBACK_CITIES);

  useEffect(() => {
    api('/theaters/cities')
      .then((data) => {
        if (Array.isArray(data) && data.length) setCities(data);
      })
      .catch(() => setCities(FALLBACK_CITIES));
  }, []);

  useEffect(() => {
    if (urlLocation) {
      setActiveTab('location');
      setQuery(urlLocation);
    } else if (urlQuery) {
      setActiveTab('movie');
      setQuery(urlQuery);
    }
  }, [urlLocation, urlQuery]);

  const selectTab = (id) => {
    setActiveTab(id);
    setQuery(id === 'location' ? urlLocation : urlQuery);
  };

  const runMovieSearch = (value) => {
    const trimmed = value.trim();
    navigate(trimmed ? `/?section=movies&q=${encodeURIComponent(trimmed)}` : '/?section=movies');
  };

  const runLocationSearch = (value) => {
    const trimmed = value.trim();
    navigate(
      trimmed
        ? `/?section=theaters&location=${encodeURIComponent(trimmed)}`
        : '/?section=theaters'
    );
  };

  const runSearch = (value = query) => {
    if (activeTab === 'movie') runMovieSearch(value);
    else runLocationSearch(value);
  };

  return (
    <div className="w-full mx-auto">
      <div
        role="tablist"
        aria-label="Search type"
        className="flex mb-3 sm:mb-4 rounded-full p-1 bg-purple-950/45 backdrop-blur-md border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => selectTab(tab.id)}
              className="relative flex-1 z-0 py-2.5 sm:py-3 px-2 sm:px-4 rounded-full text-xs sm:text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/80"
            >
              {isActive && (
                <motion.span
                  layoutId="search-tab-pill"
                  className="absolute inset-0 rounded-full bg-purple-600 shadow-[0_0_0_1px_rgba(167,139,250,0.35)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">
                <span className="sm:hidden">{tab.short}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
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
              ? 'Search movies, genres...'
              : 'City or French postal code...'
          }
          className="w-full pl-10 sm:pl-12 pr-16 sm:pr-32 py-3 sm:py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />

        <button
          type="button"
          onClick={() => runSearch()}
          className="absolute inset-y-0 right-0 pr-1.5 sm:pr-2 flex items-center"
        >
          <div className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black px-3 sm:px-6 py-2 rounded-full font-medium flex items-center space-x-2">
            <SafeIcon icon={FiSearch} className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </div>
        </button>
      </div>

      <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 justify-center">
        {activeTab === 'movie'
          ? GENRES.map((genre) => {
              const active = urlQuery.toLowerCase() === genre.toLowerCase();
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => {
                    setActiveTab('movie');
                    setQuery(genre);
                    runMovieSearch(genre);
                  }}
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm transition-all duration-300 border ${
                    active
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {genre}
                </button>
              );
            })
          : cities.map((city) => {
              const active = urlLocation.toLowerCase() === city.toLowerCase();
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setActiveTab('location');
                    setQuery(city);
                    runLocationSearch(city);
                  }}
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm transition-all duration-300 border ${
                    active
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {city}
                </button>
              );
            })}
      </div>
    </div>
  );
};

export default SearchBar;
