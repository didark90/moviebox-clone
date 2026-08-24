import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { api } from '../../api';

const { FiDollarSign, FiCalendar, FiFilm, FiClock, FiTrendingUp, FiTrendingDown, FiUsers, FiCreditCard, FiActivity, FiAlertCircle } = FiIcons;

const DashboardTab = ({ darkMode }) => {
  const [statsData, setStatsData] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    Promise.all([
      api('/admin/stats'),
      api('/admin/bookings'),
      api('/admin/messages')
    ])
      .then(([stats, bookings, messages]) => {
        setStatsData(stats);
        const sorted = [...bookings].sort(
          (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
        );
        setRecentBookings(
          sorted.slice(0, 5).map((b) => ({
            id: b.id,
            user: b.user,
            movie: b.movie,
            amount: `$${Number(b.amount || 0).toFixed(2)}`,
            status: b.paymentStatus,
            time: new Date(b.bookingDate).toLocaleString()
          }))
        );
        const byMovie = {};
        bookings.forEach((b) => {
          if (!byMovie[b.movie]) byMovie[b.movie] = { title: b.movie, bookings: 0, revenue: 0 };
          byMovie[b.movie].bookings += 1;
          byMovie[b.movie].revenue += Number(b.amount || 0);
        });
        setPopularMovies(
          Object.values(byMovie)
            .sort((a, b) => b.bookings - a.bookings)
            .slice(0, 3)
            .map((m) => ({ ...m, revenue: `$${m.revenue.toFixed(2)}` }))
        );
        setNotifications(
          [...messages].reverse().slice(0, 3).map((m) => ({
            type: 'info',
            message: `${m.name}: ${m.message}`,
            time: new Date(m.createdAt).toLocaleString()
          }))
        );
        if (!messages.length) {
          setNotifications([{ type: 'info', message: 'No contact messages yet', time: '—' }]);
        }
      })
      .catch(() => {});
  }, []);

  const stats = [
    { label: 'Total Bookings', value: String(statsData?.totalBookings ?? '—'), change: '+12%', trend: 'up', icon: FiCalendar, color: 'blue' },
    { label: 'Revenue', value: statsData ? `$${statsData.revenue}` : '—', change: '+8.2%', trend: 'up', icon: FiDollarSign, color: 'green' },
    { label: 'Active Movies', value: String(statsData?.activeMovies ?? '—'), change: '+2', trend: 'up', icon: FiFilm, color: 'purple' },
    { label: 'Pending Payments', value: String(statsData?.pending ?? '—'), change: '-15%', trend: 'down', icon: FiClock, color: 'orange' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return darkMode 
          ? 'bg-green-900/30 text-green-400' 
          : 'bg-green-100 text-green-800';
      case 'pending':
        return darkMode 
          ? 'bg-yellow-900/30 text-yellow-400' 
          : 'bg-yellow-100 text-yellow-800';
      default:
        return darkMode 
          ? 'bg-gray-900/30 text-gray-400' 
          : 'bg-gray-100 text-gray-800';
    }
  };

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const cardBorder = darkMode ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const textTertiary = darkMode ? 'text-gray-500' : 'text-gray-500';
  const hoverBg = darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`${cardBg} rounded-xl p-6 border ${cardBorder} shadow-sm hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textSecondary} font-medium`}>
                  {stat.label}
                </p>
                <p className={`text-3xl font-bold ${textPrimary} mt-2`}>
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  <SafeIcon
                    icon={stat.trend === 'up' ? FiTrendingUp : FiTrendingDown}
                    className={`w-4 h-4 mr-1 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
                  />
                  <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  <span className={`text-sm ${textTertiary} ml-1`}>vs last week</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${darkMode ? `bg-${stat.color}-900/30` : `bg-${stat.color}-100`}`}>
                <SafeIcon
                  icon={stat.icon}
                  className={`w-6 h-6 ${darkMode ? `text-${stat.color}-400` : `text-${stat.color}-600`}`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`${cardBg} rounded-xl p-6 border ${cardBorder} shadow-sm`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${textPrimary}`}>
              Daily Bookings Trend
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${textTertiary}`}>Last 7 days</span>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[65, 45, 78, 52, 89, 67, 95].map((height, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-md flex-1 min-h-[20px]"
              />
            ))}
          </div>
          <div className={`flex justify-between mt-4 text-xs ${textTertiary}`}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </motion.div>

        {/* Popular Movies */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className={`${cardBg} rounded-xl p-6 border ${cardBorder} shadow-sm`}
        >
          <h3 className={`text-lg font-semibold ${textPrimary} mb-6`}>
            Most Popular Movies
          </h3>
          <div className="space-y-4">
            {popularMovies.map((movie, index) => (
              <div key={movie.title} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-gold-500 to-gold-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <p className={`font-medium ${textPrimary}`}>
                      {movie.title}
                    </p>
                    <p className={`text-sm ${textTertiary}`}>{movie.bookings} bookings</p>
                  </div>
                </div>
                <span className="font-semibold text-green-600">{movie.revenue}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className={`${cardBg} rounded-xl p-6 border ${cardBorder} shadow-sm`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${textPrimary}`}>
              Recent Bookings
            </h3>
            <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className={`flex items-center justify-between p-3 rounded-lg ${hoverBg} transition-colors duration-200`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <SafeIcon icon={FiUsers} className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className={`font-medium ${textPrimary}`}>
                        {booking.user}
                      </p>
                      <p className={`text-sm ${textTertiary}`}>{booking.movie}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${textPrimary}`}>
                    {booking.amount}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className={`text-xs ${textTertiary}`}>{booking.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className={`${cardBg} rounded-xl p-6 border ${cardBorder} shadow-sm`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${textPrimary}`}>
              System Notifications
            </h3>
            <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              Mark All Read
            </button>
          </div>
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg ${hoverBg} transition-colors duration-200`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    notification.type === 'warning'
                      ? darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'
                      : notification.type === 'success'
                      ? darkMode ? 'bg-green-900/30' : 'bg-green-100'
                      : darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                  }`}
                >
                  <SafeIcon
                    icon={notification.type === 'warning' ? FiAlertCircle : FiActivity}
                    className={`w-4 h-4 ${
                      notification.type === 'warning'
                        ? darkMode ? 'text-yellow-400' : 'text-yellow-600'
                        : notification.type === 'success'
                        ? darkMode ? 'text-green-400' : 'text-green-600'
                        : darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${textPrimary}`}>
                    {notification.message}
                  </p>
                  <p className={`text-xs ${textTertiary} mt-1`}>{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardTab;