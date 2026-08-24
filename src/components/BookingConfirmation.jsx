import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiDownload, FiMail, FiHome, FiCalendar, FiClock, FiMapPin, FiUser, FiCreditCard, FiSmartphone } = FiIcons;

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state;

  if (!bookingData) {
    // Redirect if no booking data
    navigate('/');
    return null;
  }

  const handleDownloadTicket = () => {
    // Handle ticket download logic
    console.log('Downloading ticket...');
  };

  const handleEmailTicket = () => {
    // Handle email ticket logic
    console.log('Emailing ticket...');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="text-center mb-8"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiCheck} className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-gray-400 text-lg">Your tickets have been successfully booked</p>
          </motion.div>

          {/* Booking Details Card */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Side - Movie & Booking Info */}
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-gold-400 to-gold-600 rounded"></div>
                  <h2 className="text-2xl font-bold text-white">Booking Details</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex space-x-4">
                    <img
                      src={bookingData.movie.poster}
                      alt={bookingData.movie.title}
                      className="w-24 h-32 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{bookingData.movie.title}</h3>
                      <div className="space-y-2 text-gray-300">
                        <div className="flex items-center space-x-2">
                          <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                          <span>{bookingData.showtime.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <SafeIcon icon={FiClock} className="w-4 h-4" />
                          <span>{bookingData.showtime.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <SafeIcon icon={FiMapPin} className="w-4 h-4" />
                          <span>{bookingData.showtime.theater}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <SafeIcon icon={FiUser} className="w-4 h-4 text-gold-400" />
                      <span className="text-white font-medium">Your Seats</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {bookingData.seats.map((seat) => (
                        <span
                          key={seat}
                          className="bg-gold-500/20 border border-gold-400 text-gold-300 px-4 py-2 rounded-lg font-bold"
                        >
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Payment & Booking ID */}
              <div>
                <div className="bg-gradient-to-br from-purple-600/10 to-gold-600/10 border border-purple-500/20 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-white mb-4">Booking ID</h3>
                  <div className="text-3xl font-mono font-bold text-gold-400 tracking-wider mb-4">
                    {bookingData.bookingId}
                  </div>
                  <p className="text-gray-400 text-sm">
                    Please save this booking ID for your records
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Payment Method</span>
                    <div className="flex items-center space-x-2">
                      <SafeIcon 
                        icon={bookingData.paymentMethod === 'card' ? FiCreditCard : FiSmartphone} 
                        className="w-4 h-4 text-purple-400" 
                      />
                      <span className="text-white capitalize">{bookingData.paymentMethod}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Total Paid</span>
                    <span className="text-white font-bold text-xl">${bookingData.pricing.total.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Status</span>
                    <span className="bg-green-500/20 border border-green-400 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadTicket}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiDownload} className="w-5 h-5" />
              <span>Download Ticket</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEmailTicket}
              className="bg-white/10 border border-white/20 hover:bg-white/20 text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiMail} className="w-5 h-5" />
              <span>Email Ticket</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-medium py-3 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiHome} className="w-5 h-5" />
              <span>Back to Home</span>
            </motion.button>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Important Information</h3>
              <div className="text-gray-300 text-sm space-y-2">
                <p>• Please arrive at the theater at least 15 minutes before showtime</p>
                <p>• Present your booking ID or downloaded ticket at the entrance</p>
                <p>• Outside food and beverages are not permitted</p>
                <p>• For any issues, contact our support team</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;