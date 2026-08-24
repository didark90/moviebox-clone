import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { api } from '../api';

const { FiArrowLeft, FiSmartphone, FiShield, FiCheck, FiUser, FiClock, FiMapPin, FiCalendar, FiStar, FiRefreshCw } = FiIcons;

const PaymentPage = () => {
  const { id, showtimeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Mock booking data - in real app, this would come from state/props
  const bookingData = location.state || {
    movie: {
      title: "Avatar: The Way of Water",
      poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      rating: 8.1,
      duration: "3h 12m"
    },
    showtime: {
      time: "7:00 PM",
      date: "March 15, 2024",
      theater: "IMAX Screen 1"
    },
    seats: ['F7', 'F8'],
    pricing: {
      tickets: 37.00,
      convenienceFee: 2.50,
      total: 39.50
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');
    try {
      const booking = await api('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          movieId: id,
          showtimeId,
          seats: bookingData.seats,
          paymentMethod: 'venmo'
        })
      });
      navigate('/booking-confirmation', {
        state: {
          ...bookingData,
          paymentMethod: 'venmo',
          bookingId: booking.id,
          booking
        }
      });
    } catch (err) {
      setError(err.message || 'Payment could not be completed');
      setIsProcessing(false);
    }
  };

  // Generate a proper QR code URL using a QR code API service
  const generateVenmoQRCode = () => {
    const bookingId = 'MB' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const amount = bookingData.pricing.total.toFixed(2);
    const note = `MovieBox Booking ${bookingId}`;
    
    // Using QR Server API to generate a QR code
    const qrData = `venmo://paycharge?txn=pay&recipients=MovieBox&amount=${amount}&note=${encodeURIComponent(note)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}&bgcolor=FFFFFF&color=000000&format=png&ecc=M`;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between mb-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300"
            >
              <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
              <span>Back to Seat Selection</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white">Pay with Venmo</h1>
              <p className="text-gray-400">Secure and instant payment</p>
            </div>
            
            <div className="w-40"></div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Venmo Payment - Left Column (2/3 width) */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="xl:col-span-2 space-y-6"
            >
              {/* Payment Method Header */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <SafeIcon icon={FiSmartphone} className="w-8 h-8 text-blue-400" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Venmo Payment</h2>
                    <p className="text-gray-400">Quick and secure mobile payment</p>
                  </div>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <SafeIcon icon={FiShield} className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">Secure Payment</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Your payment is protected by Venmo's security measures and encryption.
                  </p>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 lg:p-8">
                <div className="text-center space-y-6">
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="bg-white rounded-2xl p-4 shadow-2xl max-w-xs w-full">
                      <img
                        src={generateVenmoQRCode()}
                        alt="Venmo QR Code"
                        className="w-full h-auto max-w-[200px] mx-auto"
                        onError={(e) => {
                          // Fallback QR code if the API fails
                          e.target.src = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=venmo://paycharge?txn=pay&recipients=MovieBox&amount=39.50&note=MovieBox%20Booking&bgcolor=FFFFFF&color=000000";
                        }}
                      />
                      <div className="mt-3 text-center">
                        <p className="text-gray-700 font-semibold">MovieBox Payment</p>
                        <p className="text-blue-600 font-bold text-2xl">${bookingData.pricing.total.toFixed(2)}</p>
                        <p className="text-gray-600 text-xs mt-1">
                          Booking ID: MB{Math.random().toString(36).substr(2, 6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">How to Pay</h3>
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4 lg:p-6 text-left">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                            <p className="text-gray-300 text-sm">Open the Venmo app on your phone</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                            <p className="text-gray-300 text-sm">Tap the scan icon (📷) in the top right corner</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                            <p className="text-gray-300 text-sm">Scan this QR code with your camera</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                            <p className="text-gray-300 text-sm">Confirm the payment amount: <span className="font-bold text-white">${bookingData.pricing.total.toFixed(2)}</span></p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</div>
                            <p className="text-gray-300 text-sm">Complete the payment and return here</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                      <p className="text-yellow-300 text-sm text-center">
                        <strong>Important:</strong> After completing payment in Venmo, click "Confirm Payment" below to finalize your booking.
                      </p>
                    </div>
                  </div>

                  {/* Alternative Payment Info */}
                  <div className="text-center pt-4 border-t border-white/10">
                    <p className="text-gray-400 text-sm mb-2">Don't have Venmo?</p>
                    <p className="text-gray-500 text-xs">
                      You can pay @MovieBox directly: <span className="text-blue-400 font-medium">@MovieBox-Cinema</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Booking Summary - Right Column (1/3 width) */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="xl:col-span-1"
            >
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sticky top-24">
                <h3 className="text-xl font-bold text-white mb-6">Booking Summary</h3>

                {/* Movie Info */}
                <div className="flex space-x-4 mb-6">
                  <img
                    src={bookingData.movie.poster}
                    alt={bookingData.movie.title}
                    className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-lg mb-2 truncate">{bookingData.movie.title}</h4>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <SafeIcon icon={FiStar} className="w-3 h-3 text-gold-400 flex-shrink-0" />
                        <span>{bookingData.movie.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <SafeIcon icon={FiClock} className="w-3 h-3 flex-shrink-0" />
                        <span>{bookingData.movie.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-4 mb-6">
                  <div className="bg-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <SafeIcon icon={FiCalendar} className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{bookingData.showtime.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <SafeIcon icon={FiClock} className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{bookingData.showtime.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <SafeIcon icon={FiMapPin} className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{bookingData.showtime.theater}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <SafeIcon icon={FiUser} className="w-4 h-4 text-gold-400" />
                      <span className="text-white font-medium">Selected Seats</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {bookingData.seats.map((seat) => (
                        <span
                          key={seat}
                          className="bg-gold-500/20 border border-gold-400 text-gold-300 px-3 py-1 rounded-lg text-sm font-medium"
                        >
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-300">
                    <span>Tickets ({bookingData.seats.length}x)</span>
                    <span>${bookingData.pricing.tickets.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Convenience Fee</span>
                    <span>${bookingData.pricing.convenienceFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between text-white font-bold text-xl">
                    <span>Total</span>
                    <span>${bookingData.pricing.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="mb-6">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                    <SafeIcon icon={FiSmartphone} className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-blue-300 font-medium">Waiting for Venmo Payment</p>
                    <p className="text-gray-400 text-sm mt-1">Complete payment in your Venmo app</p>
                  </div>
                </div>

                {error && (
                  <p className="mb-4 text-center text-red-400 text-sm">{error}</p>
                )}

                {/* Confirm Payment Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white disabled:text-gray-400 font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Verifying Payment...</span>
                    </>
                  ) : (
                    <>
                      <SafeIcon icon={FiCheck} className="w-5 h-5" />
                      <span>Confirm Payment Completed</span>
                    </>
                  )}
                </motion.button>

                {/* Security Notice */}
                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs">
                    <SafeIcon icon={FiShield} className="w-3 h-3" />
                    <span>Secured by Venmo's encryption technology</span>
                  </div>
                </div>

                {/* Refresh Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.reload()}
                  className="w-full mt-3 bg-white/10 border border-white/20 hover:bg-white/20 text-gray-300 hover:text-white font-medium py-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
                  <span>Refresh QR Code</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;