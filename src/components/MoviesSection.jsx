import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import MovieCard from './MovieCard';
import { api } from '../api';

const MoviesSection = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (location) params.set('location', location);
    const query = params.toString();
    api(`/movies${query ? `?${query}` : ''}`)
      .then(setMovies)
      .catch((err) => setError(err.message));
  }, [q, location]);

  return (
    <section id="movies" className="scroll-mt-20 py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Now <span className="bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent">Playing</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover the latest blockbusters and book your tickets for an unforgettable experience
          </p>
          {(q || location) && (
            <p className="text-purple-300 mt-3">
              Showing results for “{q || location}”
            </p>
          )}
          {movies[0]?.source === 'rapidapi' && (
            <p className="text-sm text-gold-400 mt-2">Live titles from RapidAPI</p>
          )}
        </motion.div>

        {error && <p className="text-center text-red-400 mb-8">{error}</p>}

        {movies.length === 0 && !error && (
          <p className="text-center text-gray-400">No movies found.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <MovieCard movie={movie} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoviesSection;
