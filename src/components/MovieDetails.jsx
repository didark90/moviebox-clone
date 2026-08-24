import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import * as FiIcons from 'react-icons/fi';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const { FiStar, FiClock, FiCalendar, FiMapPin, FiPlay, FiHeart, FiShare2 } = FiIcons;

const formatPrice = (price) => {
  if (typeof price === 'string' && price.startsWith('$')) return price;
  return `$${Number(price).toFixed(2)}`;
};

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/movies/${id}`)
      .then(setMovie)
      .catch((err) => setError(err.message));
  }, [id]);

  const handleSelectSeats = () => {
    if (!selectedShowtime) return;
    if (!user) {
      navigate('/login', { state: { from: `/movie/${id}/seats/${selectedShowtime}` } });
      return;
    }
    navigate(`/movie/${id}/seats/${selectedShowtime}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <p className="pt-32 text-center text-red-400">{error}</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <p className="pt-32 text-center text-white">Loading movie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      {/* Background with Blurred Poster */}
      <div className="fixed inset-0 z-0">
        <SafeImage
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            
            {/* Left Side - Movie Poster */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-2 flex justify-center lg:justify-start"
            >
              <div className="relative group w-full max-w-sm">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative overflow-hidden rounded-2xl shadow-2xl"
                >
                  <SafeImage
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full aspect-[2/3] object-cover transition-transform duration-500"
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-6 text-white hover:bg-white/30 transition-all duration-300"
                    >
                      <SafeIcon icon={FiPlay} className="w-8 h-8" />
                    </motion.button>
                  </div>
                  
                  {/* Floating Rating Badge */}
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md rounded-full px-4 py-2 flex items-center space-x-2">
                    <SafeIcon icon={FiStar} className="w-5 h-5 text-gold-400" />
                    <span className="text-white font-bold text-lg">{movie.rating}</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Side - Movie Information */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-3 space-y-8"
            >
              {/* Title and Actions */}
              <div>
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
                >
                  {movie.title}
                </motion.h1>
                
                <div className="flex items-center space-x-4 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-3 rounded-full border transition-all duration-300 ${
                      isLiked
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    <SafeIcon icon={FiHeart} className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                  >
                    <SafeIcon icon={FiShare2} className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Movie Meta Information */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiClock} className="w-5 h-5 text-gold-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="text-white font-medium">{movie.duration}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiCalendar} className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Release Date</p>
                    <p className="text-white font-medium">{movie.releaseDate}</p>
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <p className="text-gray-400 text-sm mb-1">Genre</p>
                  <p className="text-white font-medium">{movie.genre}</p>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h3 className="text-xl font-bold text-white mb-3">Synopsis</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {movie.description}
                </p>
              </motion.div>

              {/* Cast and Crew */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Director</h4>
                  <p className="text-purple-300 font-medium">{movie.director}</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Cast</h4>
                  <p className="text-gray-300">{Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast}</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Showtimes Section */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
                  <SafeIcon icon={FiMapPin} className="w-8 h-8 text-gold-400" />
                  <span>Showtimes</span>
                </h2>
                <div className="text-gray-400">
                  <p>Today, March 15</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {movie.showtimes.map((showtime) => (
                  <motion.button
                    key={showtime.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedShowtime(showtime.id)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                      selectedShowtime === showtime.id
                        ? 'bg-gradient-to-r from-purple-600/20 to-gold-600/20 border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-2xl font-bold text-white">{showtime.time}</span>
                      <span className="text-gold-400 font-semibold text-lg">{formatPrice(showtime.price)}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{showtime.theater}</p>
                  </motion.button>
                ))}
              </div>

              {/* Select Seats CTA */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-8 text-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!selectedShowtime}
                  onClick={handleSelectSeats}
                  className={`px-12 py-4 rounded-full font-bold text-lg transition-all duration-300 ${
                    selectedShowtime
                      ? 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black shadow-lg shadow-gold-500/20'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {selectedShowtime ? 'Select Seats' : 'Choose a Showtime'}
                </motion.button>
                
                {selectedShowtime && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-400 mt-3"
                  >
                    Selected: {movie.showtimes.find(s => s.id === selectedShowtime)?.time} - {movie.showtimes.find(s => s.id === selectedShowtime)?.theater}
                  </motion.p>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;