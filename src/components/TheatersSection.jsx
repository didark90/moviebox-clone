import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import * as FiIcons from 'react-icons/fi';
import { api } from '../api';

const { FiMapPin, FiStar, FiClock } = FiIcons;

const TheatersSection = () => {
  const navigate = useNavigate();
  const [theaters, setTheaters] = useState([]);

  useEffect(() => {
    api('/theaters').then(setTheaters).catch(() => setTheaters([]));
  }, []);

  return (
    <section id="theaters" className="scroll-mt-20 py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Our <span className="bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent">Theaters</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Find a MovieBox cinema near you and enjoy IMAX, premium, and standard screens
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {theaters.map((theater, index) => (
            <motion.div
              key={theater.id}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300"
            >
              <SafeImage
                src={theater.image}
                alt={theater.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-white">{theater.name}</h3>
                  <div className="flex items-center space-x-1 bg-black/40 rounded-full px-2 py-1">
                    <SafeIcon icon={FiStar} className="w-4 h-4 text-gold-400" />
                    <span className="text-white text-sm">{theater.rating}</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2 text-gray-400 text-sm mb-2">
                  <SafeIcon icon={FiMapPin} className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold-400" />
                  <span>{theater.address}{theater.city ? `, ${theater.city}` : ''}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm mb-4">
                  <SafeIcon icon={FiClock} className="w-4 h-4 text-purple-400" />
                  <span>{theater.hours}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {(theater.screens || []).map((screen) => (
                    <span
                      key={screen}
                      className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-xs text-gray-300"
                    >
                      {screen}
                    </span>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/?section=movies&location=${encodeURIComponent(theater.city || theater.name)}`)}
                  className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-medium py-3 rounded-xl transition-all duration-300"
                >
                  View Showtimes
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TheatersSection;
