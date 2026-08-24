import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import * as FiIcons from 'react-icons/fi';

const { FiStar, FiClock, FiPlay } = FiIcons;

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate(`/movie/${movie.id}`);
  };

  const handlePlayTrailer = (e) => {
    e.stopPropagation();
    // Handle trailer play logic here
  };

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      onClick={handleBookNow}
      className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 hover:bg-white/10 hover:border-purple-500/30 cursor-pointer"
    >
      {/* Poster Image */}
      <div className="relative overflow-hidden">
        <SafeImage
          src={movie.poster}
          alt={movie.title}
          className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlayTrailer}
              className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-4 text-white hover:bg-white/30 transition-all duration-300"
            >
              <SafeIcon icon={FiPlay} className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md rounded-full px-3 py-1 flex items-center space-x-1">
          <SafeIcon icon={FiStar} className="w-4 h-4 text-gold-400" />
          <span className="text-white text-sm font-medium">{movie.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
          {movie.title}
        </h3>
        
        <div className="flex items-center justify-between text-gray-400 text-sm mb-4">
          <span>{movie.genre}</span>
          <div className="flex items-center space-x-1">
            <SafeIcon icon={FiClock} className="w-4 h-4" />
            <span>{movie.duration}</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBookNow}
          className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-medium py-3 rounded-xl transition-all duration-300 transform group-hover:shadow-lg group-hover:shadow-gold-500/20"
        >
          Book Now
        </motion.button>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-gold-500/0 group-hover:from-purple-500/10 group-hover:via-transparent group-hover:to-gold-500/10 transition-all duration-500 pointer-events-none"></div>
    </motion.div>
  );
};

export default MovieCard;