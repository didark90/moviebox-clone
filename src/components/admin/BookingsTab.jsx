import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { api } from '../../api';

const { FiSearch, FiFilter, FiDownload, FiEye, FiEdit, FiTrash2, FiCheck, FiClock, FiXCircle, FiRefreshCw, FiMail, FiMoreHorizontal, FiArrowUp, FiArrowDown, FiCalendar, FiUser, FiCreditCard, FiSmartphone, FiChevronDown } = FiIcons;

const BookingsTab = ({ darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [sortField, setSortField] = useState('bookingDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api('/admin/bookings')
      .then(setBookings)
      .catch(() => setBookings([]));
  }, []);

  const updateBookingStatus = async (id, paymentStatus) => {
    const updated = await api(`/admin/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus })
    });
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
      case 'pending': return darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
      default: return darkMode ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return FiCheck;
      case 'pending': return FiClock;
      case 'cancelled': return FiXCircle;
      default: return FiClock;
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleSelectBooking = (bookingId) => {
    setSelectedBookings(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleBulkAction = async (action) => {
    const status = action === 'approve' ? 'confirmed' : 'cancelled';
    await Promise.all(selectedBookings.map((id) => updateBookingStatus(id, status)));
    setSelectedBookings([]);
  };

  const toggleExpandBooking = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const filteredBookings = bookings
    .filter(booking => {
      const matchesSearch = booking.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.movie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || booking.paymentStatus === filterStatus;
      const matchesPayment = filterPayment === 'all' || booking.paymentMethod === filterPayment;
      return matchesSearch && matchesStatus && matchesPayment;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'amount') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      } else if (sortField === 'bookingDate') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const cardBorder = darkMode ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const textTertiary = darkMode ? 'text-gray-500' : 'text-gray-500';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-white';
  const inputBorder = darkMode ? 'border-gray-600' : 'border-gray-300';
  const hoverBg = darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Bookings', value: String(bookings.length), change: '', color: 'blue' },
          { label: 'Confirmed', value: String(bookings.filter((b) => b.paymentStatus === 'confirmed').length), change: '', color: 'green' },
          { label: 'Pending', value: String(bookings.filter((b) => b.paymentStatus === 'pending').length), change: '', color: 'yellow' },
          { label: 'Revenue', value: `$${bookings.filter((b) => b.paymentStatus === 'confirmed').reduce((sum, b) => sum + Number(b.amount || 0), 0).toFixed(2)}`, change: '', color: 'purple' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`${cardBg} rounded-xl p-6 border ${cardBorder} shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary} font-medium`}>{stat.label}</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stat.value}</p>
              </div>
              <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : textTertiary}`}>
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters and Actions */}
      <div className={`${cardBg} rounded-xl border ${cardBorder} p-6 shadow-sm`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <SafeIcon icon={FiSearch} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary} w-5 h-5`} />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border ${inputBorder} rounded-lg ${inputBg} ${textPrimary} placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2.5 border ${inputBorder} rounded-lg ${inputBg} ${textPrimary} focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className={`px-4 py-2.5 border ${inputBorder} rounded-lg ${inputBg} ${textPrimary} focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
            >
              <option value="all">All Payment Methods</option>
              <option value="card">Credit Card</option>
              <option value="venmo">Venmo</option>
            </select>
          </div>

          <div className="flex space-x-3">
            {selectedBookings.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  <SafeIcon icon={FiCheck} className="w-4 h-4" />
                  <span>Approve ({selectedBookings.length})</span>
                </button>
                <button
                  onClick={() => handleBulkAction('cancel')}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                >
                  <SafeIcon icon={FiXCircle} className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}

            <button className={`flex items-center space-x-2 px-4 py-2.5 ${textSecondary} hover:text-purple-600 border ${inputBorder} rounded-lg hover:border-purple-300 transition-colors duration-200`}>
              <SafeIcon icon={FiDownload} className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Cards - Mobile-First Responsive Design */}
      <div className={`${cardBg} rounded-xl border ${cardBorder} overflow-hidden shadow-sm`}>
        {/* Desktop Table Header - Hidden on Mobile */}
        <div className={`hidden lg:block ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'} border-b ${cardBorder}`}>
          <div className="grid grid-cols-12 gap-4 px-6 py-4">
            <div className="col-span-1">
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedBookings(filteredBookings.map(b => b.id));
                  } else {
                    setSelectedBookings([]);
                  }
                }}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </div>
            <div className="col-span-2">
              <button
                onClick={() => handleSort('id')}
                className={`flex items-center space-x-1 hover:text-purple-600 transition-colors duration-200 text-xs font-medium ${textSecondary} uppercase tracking-wider`}
              >
                <span>Booking ID</span>
                {sortField === 'id' && (
                  <SafeIcon icon={sortOrder === 'asc' ? FiArrowUp : FiArrowDown} className="w-3 h-3" />
                )}
              </button>
            </div>
            <div className="col-span-2">
              <button
                onClick={() => handleSort('user')}
                className={`flex items-center space-x-1 hover:text-purple-600 transition-colors duration-200 text-xs font-medium ${textSecondary} uppercase tracking-wider`}
              >
                <span>Customer</span>
                {sortField === 'user' && (
                  <SafeIcon icon={sortOrder === 'asc' ? FiArrowUp : FiArrowDown} className="w-3 h-3" />
                )}
              </button>
            </div>
            <div className="col-span-2">
              <span className={`text-xs font-medium ${textSecondary} uppercase tracking-wider`}>Movie & Show</span>
            </div>
            <div className="col-span-2">
              <button
                onClick={() => handleSort('amount')}
                className={`flex items-center space-x-1 hover:text-purple-600 transition-colors duration-200 text-xs font-medium ${textSecondary} uppercase tracking-wider`}
              >
                <span>Amount</span>
                {sortField === 'amount' && (
                  <SafeIcon icon={sortOrder === 'asc' ? FiArrowUp : FiArrowDown} className="w-3 h-3" />
                )}
              </button>
            </div>
            <div className="col-span-2">
              <span className={`text-xs font-medium ${textSecondary} uppercase tracking-wider`}>Status</span>
            </div>
            <div className="col-span-1">
              <span className={`text-xs font-medium ${textSecondary} uppercase tracking-wider`}>Actions</span>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`${hoverBg} transition-colors duration-200`}
            >
              {/* Desktop Layout */}
              <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 items-center">
                {/* Checkbox */}
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedBookings.includes(booking.id)}
                    onChange={() => handleSelectBooking(booking.id)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </div>

                {/* Booking ID */}
                <div className="col-span-2">
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    {booking.id}
                  </span>
                </div>

                {/* Customer */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <SafeIcon icon={FiUser} className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-medium ${textPrimary} truncate`}>
                        {booking.user}
                      </div>
                      <div className={`text-xs ${textTertiary} truncate`}>
                        {booking.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Movie & Show */}
                <div className="col-span-2">
                  <div className="min-w-0">
                    <div className={`text-sm font-medium ${textPrimary} truncate`}>
                      {booking.movie}
                    </div>
                    <div className={`text-xs ${textTertiary}`}>
                      {booking.date} • {booking.showtime}
                    </div>
                  </div>
                </div>

                {/* Amount & Payment */}
                <div className="col-span-2">
                  <div className={`text-sm font-medium ${textPrimary}`}>
                    ${Number(booking.amount || 0).toFixed(2)}
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <SafeIcon 
                      icon={booking.paymentMethod === 'card' ? FiCreditCard : FiSmartphone} 
                      className={`w-3 h-3 ${textSecondary}`} 
                    />
                    <span className={`text-xs ${textSecondary} capitalize`}>
                      {booking.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.paymentStatus)}`}>
                    <SafeIcon icon={getStatusIcon(booking.paymentStatus)} className="w-3 h-3 mr-1" />
                    {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="flex items-center space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-1 rounded"
                      title="Confirm"
                    >
                      <SafeIcon icon={FiCheck} className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded"
                      title="Cancel"
                    >
                      <SafeIcon icon={FiXCircle} className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="lg:hidden p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedBookings.includes(booking.id)}
                      onChange={() => handleSelectBooking(booking.id)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      {booking.id}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleExpandBooking(booking.id)}
                    className={`p-2 rounded-lg ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`}
                  >
                    <SafeIcon 
                      icon={FiChevronDown} 
                      className={`w-4 h-4 transition-transform duration-200 ${expandedBooking === booking.id ? 'rotate-180' : ''}`} 
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${textPrimary}`}>{booking.user}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.paymentStatus)}`}>
                      <SafeIcon icon={getStatusIcon(booking.paymentStatus)} className="w-3 h-3 mr-1" />
                      {booking.paymentStatus}
                    </span>
                  </div>
                  <div className={`text-sm ${textSecondary}`}>{booking.movie}</div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${textTertiary}`}>
                      {booking.date} • {booking.showtime}
                    </span>
                    <span className={`text-sm font-medium ${textPrimary}`}>
                      ${Number(booking.amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedBooking === booking.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className={`${textTertiary}`}>Email:</span>
                        <p className={`${textPrimary} break-all`}>{booking.email}</p>
                      </div>
                      <div>
                        <span className={`${textTertiary}`}>Theater:</span>
                        <p className={`${textPrimary}`}>{booking.theater}</p>
                      </div>
                      <div>
                        <span className={`${textTertiary}`}>Seats:</span>
                        <p className={`${textPrimary}`}>{booking.seats.join(', ')}</p>
                      </div>
                      <div>
                        <span className={`${textTertiary}`}>Payment:</span>
                        <div className="flex items-center space-x-1">
                          <SafeIcon 
                            icon={booking.paymentMethod === 'card' ? FiCreditCard : FiSmartphone} 
                            className={`w-3 h-3 ${textSecondary}`} 
                          />
                          <span className={`${textPrimary} capitalize`}>{booking.paymentMethod}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium"
                      >
                        <SafeIcon icon={FiEye} className="w-4 h-4 mr-1 inline" />
                        View
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium"
                      >
                        <SafeIcon icon={FiMail} className="w-4 h-4 mr-1 inline" />
                        Email
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm font-medium"
                      >
                        <SafeIcon icon={FiEdit} className="w-4 h-4 mr-1 inline" />
                        Edit
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className={`${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'} px-6 py-3 border-t ${cardBorder}`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${textSecondary}`}>
              Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
              <span className="font-medium">{filteredBookings.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button className={`px-3 py-1 text-sm ${textTertiary} hover:text-purple-600 border ${inputBorder} rounded transition-colors duration-200`}>
                Previous
              </button>
              <button className="px-3 py-1 text-sm bg-purple-600 text-white rounded">
                1
              </button>
              <button className={`px-3 py-1 text-sm ${textTertiary} hover:text-purple-600 border ${inputBorder} rounded transition-colors duration-200`}>
                2
              </button>
              <button className={`px-3 py-1 text-sm ${textTertiary} hover:text-purple-600 border ${inputBorder} rounded transition-colors duration-200`}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingsTab;