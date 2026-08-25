import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import SafeImage from '../common/SafeImage';
import LogoLoader from './LogoLoader';
import * as FiIcons from 'react-icons/fi';
import { api } from '../api';

const { FiMapPin, FiStar, FiClock, FiChevronLeft, FiChevronRight } = FiIcons;

const formatPrice = (price) => `$${Number(price).toFixed(2)}`;

const formatShowDate = (value) => {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const localDate = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const upcomingDates = (span = 7) => Array.from({ length: span }, (_, i) => localDate(i));

const theaterLabel = (theater) =>
  [theater?.name, theater?.city].filter(Boolean).join(', ');

const theaterAddress = (theater) =>
  [theater?.address, theater?.city].filter(Boolean).join(', ');

const TheatersSection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locationQuery = searchParams.get('location') || '';
  const dateQuery = searchParams.get('date') || localDate();
  const dates = upcomingDates();
  const [theaters, setTheaters] = useState([]);
  const [loadingTheaters, setLoadingTheaters] = useState(true);
  const [theatersError, setTheatersError] = useState('');
  const [playing, setPlaying] = useState([]);
  const [displayDate, setDisplayDate] = useState('');
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [openId, setOpenId] = useState(searchParams.get('theater'));
  const scrollerRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const fromUrl = searchParams.get('theater');
    setOpenId(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoadingTheaters(true);
    setTheatersError('');
    const query = locationQuery ? `?q=${encodeURIComponent(locationQuery)}` : '';
    api(`/theaters${query}`)
      .then((data) => {
        if (!cancelled) setTheaters(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setTheaters([]);
          setTheatersError(err.message || 'Theater listings are unavailable right now');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingTheaters(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locationQuery]);

  useEffect(() => {
    if (!openId) {
      setPlaying([]);
      setDisplayDate('');
      return;
    }
    let cancelled = false;
    setLoadingMovies(true);
    const dateParam = dateQuery ? `?date=${encodeURIComponent(dateQuery)}` : '';
    api(`/theaters/${encodeURIComponent(openId)}/showtimes${dateParam}`)
      .then((data) => {
        if (cancelled) return;
        setDisplayDate(data.displayDate || dateQuery || '');
        setPlaying(
          (data.movies || []).map((movie) => ({
            movie,
            times: movie.times || []
          }))
        );
      })
      .catch(() => {
        if (!cancelled) {
          setPlaying([]);
          setDisplayDate(dateQuery || '');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingMovies(false);
      });
    return () => {
      cancelled = true;
    };
  }, [openId, dateQuery]);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 12);
    setCanNext(maxScroll > 12 && el.scrollLeft < maxScroll - 12);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    const frame = requestAnimationFrame(updateArrows);
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
      observer.disconnect();
    };
  }, [theaters, updateArrows]);

  const scrollByPage = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.children[0];
    if (!card) return;
    const styles = window.getComputedStyle(el);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 24;
    const amount = card.getBoundingClientRect().width + gap;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    const next = Math.max(0, Math.min(max, el.scrollLeft + direction * amount));
    el.style.scrollBehavior = 'smooth';
    el.scrollLeft = next;
  };

  const handleViewShowtimes = (theater) => {
    const id = String(theater.id);
    const next = String(openId) === id ? null : id;
    setPlaying([]);
    setDisplayDate(dateQuery);
    setLoadingMovies(Boolean(next));
    setOpenId(next);
    const params = ['section=theaters'];
    if (locationQuery) params.push(`location=${encodeURIComponent(locationQuery)}`);
    if (dateQuery) params.push(`date=${encodeURIComponent(dateQuery)}`);
    if (next) params.push(`theater=${encodeURIComponent(id)}`);
    navigate(`/?${params.join('&')}`, { replace: true });
  };

  const selectDate = (day) => {
    const params = [`section=theaters`, `date=${encodeURIComponent(day)}`];
    if (locationQuery) params.push(`location=${encodeURIComponent(locationQuery)}`);
    if (openId) params.push(`theater=${encodeURIComponent(openId)}`);
    navigate(`/?${params.join('&')}`, { replace: true });
  };

  const openShow = (movie, show) => {
    if (movie.catalogId && show.bookShowId) {
      navigate(`/movie/${movie.catalogId}/seats/${show.bookShowId}`);
      return;
    }
    if (movie.catalogId) {
      navigate(`/movie/${movie.catalogId}`);
    }
  };

  const openTheater = theaters.find((theater) => String(theater.id) === String(openId));

  return (
    <section id="theaters" className="scroll-mt-20 py-12 sm:py-16 lg:py-20 bg-black">
      <div className="page-shell">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Our <span className="bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent">Theaters</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            French cinema listings with showtimes by date
          </p>
          {locationQuery && !theatersError && (
            <p className="text-purple-300 mt-3">
              {theaters.length
                ? `Showing theaters near “${locationQuery}”`
                : `No theaters found for “${locationQuery}”`}
            </p>
          )}
        </motion.div>

        {loadingTheaters && <LogoLoader label="Loading theaters" />}

        {!loadingTheaters && theatersError ? (
          <p className="text-center text-gray-400">{theatersError}</p>
        ) : null}

        {!loadingTheaters && !theatersError && !theaters.length && locationQuery ? (
          <p className="text-center text-gray-400">
            Try Paris, Lyon, Marseille, or a 5-digit French postal code.
          </p>
        ) : null}

        {!loadingTheaters && theaters.length > 0 && (
          <div className="flex items-stretch gap-3 sm:gap-4 lg:gap-6" onMouseEnter={updateArrows}>
            <button
              type="button"
              aria-label="Previous theaters"
              onClick={() => scrollByPage(-1)}
              className={`self-center shrink-0 rounded-full p-2 sm:p-3 text-white bg-black/50 border border-white/25 backdrop-blur-sm transition-all duration-200 hover:bg-black/70 active:scale-95 focus:outline-none ${
                canPrev ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <SafeIcon icon={FiChevronLeft} className="w-6 h-6 pointer-events-none" />
            </button>

            <div
              ref={scrollerRef}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  scrollByPage(-1);
                }
                if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  scrollByPage(1);
                }
              }}
              className="min-w-0 flex-1 flex items-stretch gap-4 sm:gap-6 overflow-x-auto overflow-y-hidden pb-4 pt-2 outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {theaters.map((theater, index) => {
                const isOpen = String(openId) === String(theater.id);
                return (
                  <motion.div
                    key={theater.id}
                    id={`theater-${theater.id}`}
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: Math.min(index, 3) * 0.1 }}
                    viewport={{ once: true }}
                    className={`shrink-0 w-[85%] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] bg-white/5 backdrop-blur-md border rounded-2xl overflow-hidden transition-colors duration-300 flex flex-col ${
                      isOpen || locationQuery
                        ? 'border-gold-400/50'
                        : 'border-white/10 hover:border-purple-500/30'
                    }`}
                  >
                    <SafeImage
                      src={theater.image}
                      alt={theater.name}
                      className="w-full h-48 object-cover shrink-0"
                    />
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-3 gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-white">{theater.name}</h3>
                          {theater.city && (
                            <p className="text-gold-400 text-sm mt-1">{theater.city}</p>
                          )}
                        </div>
                        {theater.rating ? (
                        <div className="flex items-center space-x-1 bg-black/40 rounded-full px-2 py-1">
                          <SafeIcon icon={FiStar} className="w-4 h-4 text-gold-400" />
                          <span className="text-white text-sm">{theater.rating}</span>
                        </div>
                        ) : null}
                      </div>
                      <div className="flex items-start space-x-2 text-gray-400 text-sm mb-2">
                        <SafeIcon icon={FiMapPin} className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold-400" />
                        <span>{theaterAddress(theater)}</span>
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
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleViewShowtimes(theater)}
                        className="mt-auto w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-medium py-3 rounded-xl transition-all duration-300"
                      >
                        {isOpen ? 'Hide Showtimes' : 'View Showtimes'}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <button
              type="button"
              aria-label="Next theaters"
              onClick={() => scrollByPage(1)}
              className={`self-center shrink-0 rounded-full p-2 sm:p-3 text-white bg-black/50 border border-white/25 backdrop-blur-sm transition-all duration-200 hover:bg-black/70 active:scale-95 focus:outline-none ${
                canNext ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <SafeIcon icon={FiChevronRight} className="w-6 h-6 pointer-events-none" />
            </button>
          </div>
        )}

        <AnimatePresence>
          {openTheater && (
            <motion.div
              key={openTheater.id}
              id="theater-showtimes"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="mt-8 bg-white/5 border border-gold-400/40 rounded-2xl p-5 sm:p-8"
            >
              <h4 className="text-white text-xl sm:text-2xl font-bold mb-2">
                Showtimes — {theaterLabel(openTheater)}
              </h4>
              <p className="flex items-start gap-2 text-gold-400 text-sm mb-3">
                <SafeIcon icon={FiMapPin} className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{theaterAddress(openTheater)}</span>
              </p>
              <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Showtime dates">
                {dates.map((day) => {
                  const active = day === dateQuery;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => selectDate(day)}
                      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition-colors ${
                        active
                          ? 'bg-gold-500 border-gold-400 text-black'
                          : 'bg-white/10 border-white/15 text-gray-300 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      {formatShowDate(day)}
                    </button>
                  );
                })}
              </div>
              <p className="text-gray-400 text-sm mb-6">
                {displayDate ? `Schedule for ${formatShowDate(displayDate)}` : 'Pick a date to see times'}
              </p>

              {loadingMovies && <LogoLoader label="Loading showtimes" />}

              {!loadingMovies && playing.length === 0 && (
                <p className="text-gray-400 text-sm">Showtimes are still being updated for this location.</p>
              )}

              {!loadingMovies && playing.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {playing.map(({ movie, times }) => (
                    <div key={movie.id} className="bg-black/30 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3 text-left w-full">
                        <SafeImage
                          src={movie.poster}
                          alt=""
                          className="w-12 h-16 object-cover rounded-md shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-white font-medium leading-snug">{movie.title}</p>
                          {movie.duration ? (
                            <p className="text-gray-400 text-xs mt-1">{movie.duration}</p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {times.map((show) => (
                          <button
                            key={`${movie.id}-${show.id}`}
                            type="button"
                            onClick={() => openShow(movie, show)}
                            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-gold-500 hover:text-black border border-white/15 text-white text-sm font-medium transition-colors"
                          >
                            {show.time}
                            <span className="block text-[11px] opacity-80 font-normal">
                              {show.format || show.theater}
                              {show.price != null ? ` · ${formatPrice(show.price)}` : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default TheatersSection;
