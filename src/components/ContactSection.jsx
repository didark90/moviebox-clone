import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { api } from '../api';

const { FiMail, FiPhone, FiMapPin, FiSend } = FiIcons;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactSection = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Name must be at least 2 characters';
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email address';
    if (form.message.trim().length < 10) next.message = 'Message must be at least 10 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSent('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data = await api('/contact', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setSent(data.message);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      else setErrors({ message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="scroll-mt-20 py-20 min-h-screen bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Get in <span className="bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent">Touch</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Questions about bookings, theaters, or your tickets? We are here to help
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              { icon: FiMail, label: 'Email', value: 'support@moviebox.com' },
              { icon: FiPhone, label: 'Phone', value: '+1 (555) 234-8900' },
              { icon: FiMapPin, label: 'Head Office', value: '120 Cinema Boulevard, Downtown' }
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center space-x-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-gold-500 flex items-center justify-center flex-shrink-0">
                  <SafeIcon icon={item.icon} className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">{item.label}</p>
                  <p className="text-white font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.form
            initial={{ x: 40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            noValidate
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 space-y-5"
          >
            <div>
              <label className="block text-sm text-gray-400 mb-2">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.name ? 'border-red-400' : 'border-white/20'}`}
                placeholder="Your name"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.email ? 'border-red-400' : 'border-white/20'}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Message</label>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${errors.message ? 'border-red-400' : 'border-white/20'}`}
                placeholder="How can we help?"
              />
              {errors.message && <p className="text-red-400 text-sm mt-1">{errors.message}</p>}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-60 text-white font-medium py-3 rounded-xl flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiSend} className="w-4 h-4" />
              <span>{submitting ? 'Sending...' : 'Send Message'}</span>
            </motion.button>
            {sent && <p className="text-green-400 text-sm text-center">{sent}</p>}
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
