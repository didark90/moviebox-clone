import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const { FiArrowLeft, FiUser, FiClock, FiMapPin, FiCheck, FiX, FiZoomIn, FiZoomOut, FiMaximize2 } = FiIcons;

const SeatSelection = () => {
  const { id, showtimeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [movie, setMovie] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/showtimes/${id}/${showtimeId}/seats`)
      .then((data) => {
        const show = data.showtime;
        setMovie({
          id: data.movie.id,
          title: data.movie.title,
          poster: data.movie.poster,
          rating: data.movie.rating,
          duration: data.movie.duration,
          showtime: {
            time: show.time,
            date: show.date || 'March 15, 2024',
            theater: show.theater,
            price: Number(show.price)
          }
        });
        setBookedSeats(data.bookedSeats || []);
      })
      .catch((err) => setError(err.message));
  }, [id, showtimeId]);

  const generateSeatMap = () => {
    if (!movie) return [];
    const rows = [];
    const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

    for (let i = 0; i < 12; i++) {
      const seats = [];
      for (let j = 1; j <= 16; j++) {
        const seatId = `${rowLabels[i]}${j}`;
        seats.push({
          id: seatId,
          row: rowLabels[i],
          number: j,
          status: bookedSeats.includes(seatId) ? 'booked' : 'available',
          isPremium: i < 3,
          price: i < 3 ? movie.showtime.price + 5 : movie.showtime.price
        });
      }
      rows.push(seats);
    }
    return rows;
  };

  const seatMap = generateSeatMap();

  const handleSeatClick = (seat) => {
    if (seat.status === 'booked') return;
    
    const seatId = seat.id;
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const getSeatStatus = (seat) => {
    if (seat.status === 'booked') return 'booked';
    if (selectedSeats.includes(seat.id)) return 'selected';
    return 'available';
  };

  const getSeatStyles = (seat) => {
    const status = getSeatStatus(seat);
    const baseStyles = "rounded-lg border-2 transition-all duration-300 cursor-pointer flex items-center justify-center font-medium";
    
    // Responsive sizing
    const sizeClasses = "w-6 h-6 text-xs sm:w-8 sm:h-8 sm:text-xs md:w-10 md:h-10 md:text-sm";
    
    switch (status) {
      case 'available':
        return `${baseStyles} ${sizeClasses} ${
          seat.isPremium 
            ? 'bg-purple-500/20 border-purple-400 text-purple-300 hover:bg-purple-500/40 hover:border-purple-300' 
            : 'bg-green-500/20 border-green-400 text-green-300 hover:bg-green-500/40 hover:border-green-300'
        }`;
      case 'selected':
        return `${baseStyles} ${sizeClasses} bg-gradient-to-br from-gold-400 to-gold-600 border-gold-400 text-black shadow-lg shadow-gold-400/30`;
      case 'booked':
        return `${baseStyles} ${sizeClasses} bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed`;
      default:
        return `${baseStyles} ${sizeClasses}`;
    }
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seatMap.flat().find(s => s.id === seatId);
      return total + (seat?.price || 0);
    }, 0);
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0 || !movie) return;
    if (!user) {
      navigate('/login', { state: { from: `/payment/${id}/${showtimeId}` } });
      return;
    }

    navigate(`/payment/${id}/${showtimeId}`, {
      state: {
        movie: {
          title: movie.title,
          poster: movie.poster,
          rating: movie.rating,
          duration: movie.duration
        },
        showtime: movie.showtime,
        seats: selectedSeats,
        pricing: {
          tickets: calculateTotal(),
          convenienceFee: 2.50,
          total: calculateTotal() + 2.50
        }
      }
    });
  };

  const handleZoom = (direction) => {
    setZoomLevel(prev => {
      const newLevel = direction === 'in' ? Math.min(prev + 0.2, 2) : Math.max(prev - 0.2, 0.6);
      return newLevel;
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
        <p className="pt-32 text-center text-white">Loading seats...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300 self-start"
            >
              <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
              <span className="text-sm sm:text-base">Back to Movie Details</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Select Your Seats</h1>
              <p className="text-gray-400 text-sm sm:text-base">Choose your preferred seats</p>
            </div>
            
            {/* Zoom Controls - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-2">
              <button
                onClick={() => handleZoom('out')}
                className="p-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors duration-200"
              >
                <SafeIcon icon={FiZoomOut} className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleZoom('in')}
                className="p-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors duration-200"
              >
                <SafeIcon icon={FiZoomIn} className="w-4 h-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors duration-200"
              >
                <SafeIcon icon={FiMaximize2} className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Movie Info Bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-12 h-16 sm:w-16 sm:h-24 object-cover rounded-lg flex-shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white truncate">{movie.title}</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-gray-400 text-xs sm:text-sm mt-1 space-y-1 sm:space-y-0">
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiClock} className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{movie.showtime.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiMapPin} className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">{movie.showtime.theater}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-gray-400 text-xs sm:text-sm">Date</p>
                <p className="text-white font-medium text-sm sm:text-base">{movie.showtime.date}</p>
              </div>
            </div>
          </motion.div>

          {/* Screen Indicator */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-6 sm:mb-8"
          >
            <div className="relative">
              <div className="w-full h-1 sm:h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full mb-2"></div>
              <p className="text-gray-400 text-xs sm:text-sm">SCREEN</p>
            </div>
          </motion.div>

          {/* Seat Map Container */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden ${
              isFullscreen ? 'fixed inset-4 z-50 bg-gray-900' : ''
            }`}
          >
            {/* Mobile Zoom Controls */}
            <div className="lg:hidden flex items-center justify-between p-3 sm:p-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleZoom('out')}
                  className="p-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors duration-200"
                >
                  <SafeIcon icon={FiZoomOut} className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleZoom('in')}
                  className="p-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors duration-200"
                >
                  <SafeIcon icon={FiZoomIn} className="w-4 h-4" />
                </button>
              </div>
              <span className="text-white text-sm font-medium">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>

            {/* Seat Map - Scrollable Container */}
            <div className="overflow-x-auto overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
              <div 
                className="min-w-fit mx-auto transition-transform duration-300"
                style={{ 
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center top'
                }}
              >
                <div className="space-y-1 sm:space-y-2 md:space-y-3">
                  {seatMap.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center justify-center space-x-1 sm:space-x-2">
                      {/* Row Label */}
                      <div className="w-6 sm:w-8 text-center text-gray-400 font-medium text-xs sm:text-sm flex-shrink-0">
                        {row[0].row}
                      </div>

                      {/* Left Section (seats 1-4) */}
                      <div className="flex space-x-0.5 sm:space-x-1">
                        {row.slice(0, 4).map((seat) => (
                          <motion.button
                            key={seat.id}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSeatClick(seat)}
                            className={getSeatStyles(seat)}
                            disabled={seat.status === 'booked'}
                          >
                            <span className="hidden sm:inline">{seat.number}</span>
                          </motion.button>
                        ))}
                      </div>

                      {/* Aisle */}
                      <div className="w-2 sm:w-4 md:w-8 flex-shrink-0"></div>

                      {/* Middle Section (seats 5-12) */}
                      <div className="flex space-x-0.5 sm:space-x-1">
                        {row.slice(4, 12).map((seat) => (
                          <motion.button
                            key={seat.id}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSeatClick(seat)}
                            className={getSeatStyles(seat)}
                            disabled={seat.status === 'booked'}
                          >
                            <span className="hidden sm:inline">{seat.number}</span>
                          </motion.button>
                        ))}
                      </div>

                      {/* Aisle */}
                      <div className="w-2 sm:w-4 md:w-8 flex-shrink-0"></div>

                      {/* Right Section (seats 13-16) */}
                      <div className="flex space-x-0.5 sm:space-x-1">
                        {row.slice(12, 16).map((seat) => (
                          <motion.button
                            key={seat.id}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSeatClick(seat)}
                            className={getSeatStyles(seat)}
                            disabled={seat.status === 'booked'}
                          >
                            <span className="hidden sm:inline">{seat.number}</span>
                          </motion.button>
                        ))}
                      </div>

                      {/* Row Label */}
                      <div className="w-6 sm:w-8 text-center text-gray-400 font-medium text-xs sm:text-sm flex-shrink-0">
                        {row[0].row}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="border-t border-white/10 p-3 sm:p-4 md:p-6">
              <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-3 sm:gap-4 md:gap-8">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500/20 border border-green-400 rounded flex-shrink-0"></div>
                  <span className="text-gray-400 text-xs sm:text-sm">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-500/20 border border-purple-400 rounded flex-shrink-0"></div>
                  <span className="text-gray-400 text-xs sm:text-sm">Premium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-gold-400 to-gold-600 border border-gold-400 rounded flex-shrink-0"></div>
                  <span className="text-gray-400 text-xs sm:text-sm">Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-600 border border-gray-500 rounded flex-shrink-0"></div>
                  <span className="text-gray-400 text-xs sm:text-sm">Booked</span>
                </div>
              </div>
            </div>

            {/* Fullscreen Close Button */}
            {isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 p-2 bg-black/50 border border-white/20 rounded-lg text-white hover:bg-black/70 transition-colors duration-200"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            )}
          </motion.div>

          {/* Booking Summary */}
          <AnimatePresence>
            {selectedSeats.length > 0 && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="mt-6 sm:mt-8 bg-gradient-to-r from-purple-600/20 to-gold-600/20 backdrop-blur-md border border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6"
              >
                <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:items-center">
                  {/* Selected Seats */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Selected Seats</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map((seatId) => (
                        <motion.div
                          key={seatId}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="bg-gold-500/20 border border-gold-400 rounded-lg px-2 sm:px-3 py-1 flex items-center space-x-2"
                        >
                          <SafeIcon icon={FiUser} className="w-3 h-3 sm:w-4 sm:h-4 text-gold-400 flex-shrink-0" />
                          <span className="text-gold-300 font-medium text-sm sm:text-base">{seatId}</span>
                          <button
                            onClick={() => handleSeatClick({ id: seatId, status: 'available' })}
                            className="text-gold-400 hover:text-gold-300"
                          >
                            <SafeIcon icon={FiX} className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Price Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-300 text-sm sm:text-base">
                        <span>{selectedSeats.length} × Tickets</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-300 text-sm sm:text-base">
                        <span>Convenience Fee</span>
                        <span>$2.50</span>
                      </div>
                      <div className="border-t border-white/10 pt-2 flex justify-between text-white font-bold text-base sm:text-lg">
                        <span>Total</span>
                        <span>${(calculateTotal() + 2.50).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <div className="text-center lg:text-right">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleProceedToPayment}
                      className="w-full lg:w-auto bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full shadow-lg shadow-gold-500/20 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <SafeIcon icon={FiCheck} className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">Proceed to Payment</span>
                    </motion.button>
                    <p className="text-gray-400 text-xs sm:text-sm mt-2">
                      {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {selectedSeats.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 sm:py-12 mt-6 sm:mt-8"
            >
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8">
                <SafeIcon icon={FiUser} className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Select Your Seats</h3>
                <p className="text-gray-400 text-sm sm:text-base">
                  Tap on the available seats to select them for booking
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;