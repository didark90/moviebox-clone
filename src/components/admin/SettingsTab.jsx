import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { api } from '../../api';

const {
  FiCreditCard, FiSmartphone, FiUpload, FiSave, FiKey, FiMail,
  FiUsers, FiMapPin, FiGrid, FiSettings, FiShield, FiEye, FiEyeOff
} = FiIcons;

const SettingsTab = ({ darkMode }) => {
  const [activeSection, setActiveSection] = useState('payment');
  const [showApiKey, setShowApiKey] = useState(false);
  const [venmoQR, setVenmoQR] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [settings, setSettings] = useState({
    stripePublishableKey: 'pk_test_51Hf...',
    stripeSecretKey: 'sk_test_51Hf...',
    venmoUsername: '@moviebox',
    venmoQRCode: '',
    emailFrom: 'noreply@moviebox.com',
    emailTemplate: 'default',
    theaterLayout: 'standard',
    maxSeatsPerBooking: 8,
    bookingTimeLimit: 15,
    cancellationPolicy: 24
  });

  useEffect(() => {
    api('/admin/settings')
      .then((data) => setSettings((prev) => ({ ...prev, ...data })))
      .catch(() => {});
  }, []);

  const sections = [
    { id: 'payment', name: 'Payment Settings', icon: FiCreditCard },
    { id: 'email', name: 'Email Templates', icon: FiMail },
    { id: 'theater', name: 'Theater Layout', icon: FiMapPin },
    { id: 'admin', name: 'Admin Roles', icon: FiUsers },
    { id: 'security', name: 'Security', icon: FiShield }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setVenmoQR(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaveMessage('');
    try {
      const saved = await api('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      setSettings((prev) => ({ ...prev, ...saved }));
      setSaveMessage('Settings saved');
    } catch (err) {
      setSaveMessage(err.message || 'Could not save settings');
    }
  };

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Stripe Configuration
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Publishable Key
            </label>
            <input
              type="text"
              value={settings.stripePublishableKey}
              onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="pk_test_..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Secret Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.stripeSecretKey}
                onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="sk_test_..."
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={showApiKey ? FiEyeOff : FiEye} className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Venmo Configuration
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Venmo Username
            </label>
            <input
              type="text"
              value={settings.venmoUsername}
              onChange={(e) => setSettings({ ...settings, venmoUsername: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="@moviebox"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              QR Code
            </label>
            <div className="flex items-center space-x-4">
              {venmoQR ? (
                <img src={venmoQR} alt="Venmo QR" className="w-24 h-24 object-cover rounded-lg border" />
              ) : (
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                  <SafeIcon icon={FiUpload} className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="venmo-qr-upload"
                />
                <label
                  htmlFor="venmo-qr-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <SafeIcon icon={FiUpload} className="w-4 h-4 mr-2" />
                  Upload QR Code
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Email Configuration
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Email Address
            </label>
            <input
              type="email"
              value={settings.emailFrom}
              onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="noreply@moviebox.com"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Email Templates
        </h3>
        <div className="space-y-4">
          {[
            { name: 'Booking Confirmation', key: 'booking_confirmation' },
            { name: 'Payment Receipt', key: 'payment_receipt' },
            { name: 'Cancellation Notice', key: 'cancellation' },
            { name: 'Reminder Email', key: 'reminder' }
          ].map((template) => (
            <div key={template.key} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Edit Template
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Customize the {template.name.toLowerCase()} email sent to customers.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTheaterSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Seat Layout Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Layout
            </label>
            <select
              value={settings.theaterLayout}
              onChange={(e) => setSettings({ ...settings, theaterLayout: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="standard">Standard (12x16)</option>
              <option value="imax">IMAX (14x20)</option>
              <option value="premium">Premium (10x14)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Seats per Booking
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={settings.maxSeatsPerBooking}
              onChange={(e) => setSettings({ ...settings, maxSeatsPerBooking: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Booking Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Booking Time Limit (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={settings.bookingTimeLimit}
              onChange={(e) => setSettings({ ...settings, bookingTimeLimit: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cancellation Policy (hours)
            </label>
            <input
              type="number"
              min="1"
              max="72"
              value={settings.cancellationPolicy}
              onChange={(e) => setSettings({ ...settings, cancellationPolicy: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Admin Users
        </h3>
        <div className="space-y-4">
          {[
            { name: 'John Admin', email: 'john@moviebox.com', role: 'Super Admin', status: 'active' },
            { name: 'Jane Manager', email: 'jane@moviebox.com', role: 'Manager', status: 'active' },
            { name: 'Mike Support', email: 'mike@moviebox.com', role: 'Support', status: 'inactive' }
          ].map((admin, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {admin.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{admin.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{admin.role}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    admin.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}>
                    {admin.status}
                  </span>
                  <button className="text-purple-600 hover:text-purple-700 text-sm">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
        >
          <SafeIcon icon={FiUsers} className="w-4 h-4" />
          <span>Add Admin User</span>
        </motion.button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Security Configuration
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Require 2FA for admin accounts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Session Timeout</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Auto-logout after inactivity</p>
            </div>
            <select className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>2 hours</option>
              <option>Never</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">IP Whitelist</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Restrict admin access by IP</p>
            </div>
            <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              Configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'payment':
        return renderPaymentSettings();
      case 'email':
        return renderEmailSettings();
      case 'theater':
        return renderTheaterSettings();
      case 'admin':
        return renderAdminSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderPaymentSettings();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings</h2>
            <nav className="space-y-2">
              {sections.map((section) => (
                <motion.button
                  key={section.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <SafeIcon icon={section.icon} className="w-4 h-4" />
                  <span className="text-sm font-medium">{section.name}</span>
                </motion.button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            {renderActiveSection()}
            
            {/* Save Button */}
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 shadow-lg"
              >
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                <span>Save Settings</span>
              </motion.button>
              {saveMessage && (
                <p className="mt-3 text-sm text-green-600">{saveMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsTab;