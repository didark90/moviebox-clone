import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const { FiMail, FiLock, FiUser, FiEye, FiEyeOff } = FiIcons;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState(location.search.includes('signup') ? 'signup' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const redirectTo = location.state?.from || '/';

  const validate = () => {
    const next = {};
    if (mode === 'signup' && form.name.trim().length < 2) {
      next.name = 'Name must be at least 2 characters';
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      next.email = 'Enter a valid email address';
    }
    if (mode === 'login' && !form.password) {
      next.password = 'Password is required';
    }
    if (mode === 'signup' && !PASSWORD_RE.test(form.password)) {
      next.password = 'At least 8 characters, including a letter and a number';
    }
    if (mode === 'signup' && form.password !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const user = mode === 'login'
        ? await login(form.email, form.password)
        : await signup(form);
      const dest = user.role === 'admin' && redirectTo === '/' ? '/admin' : redirectTo;
      navigate(dest);
    } catch (err) {
      if (err.errors && Object.keys(err.errors).length) {
        setErrors(err.errors);
      } else {
        setServerError(err.message || 'Something went wrong');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm({ ...form, [key]: e.target.value });
      if (errors[key]) setErrors({ ...errors, [key]: '' });
    }
  });

  const inputClass = (key) =>
    `w-full pl-11 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
      errors[key] ? 'border-red-400' : 'border-white/20'
    }`;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="pt-28 pb-16 px-4">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-md mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8"
        >
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-gold-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-gray-400 mt-2">
              {mode === 'login' ? 'Log in to book tickets and manage your account' : 'Sign up to start booking movie tickets'}
            </p>
          </div>

          <div className="flex mb-6 bg-white/10 rounded-full p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrors({}); setServerError(''); }}
              className={`flex-1 py-2 rounded-full text-sm font-medium ${
                mode === 'login' ? 'bg-purple-600 text-white' : 'text-gray-300'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrors({}); setServerError(''); }}
              className={`flex-1 py-2 rounded-full text-sm font-medium ${
                mode === 'signup' ? 'bg-purple-600 text-white' : 'text-gray-300'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'signup' && (
              <div>
                <div className="relative">
                  <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Full name" className={inputClass('name')} {...field('name')} />
                </div>
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <div className="relative">
                <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" placeholder="Email address" className={inputClass('email')} {...field('email')} />
              </div>
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className={`${inputClass('password')} pr-12`}
                  {...field('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            {mode === 'signup' && (
              <div>
                <div className="relative">
                  <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    className={inputClass('confirmPassword')}
                    {...field('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {serverError && <p className="text-red-400 text-sm text-center">{serverError}</p>}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={submitting}
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-60 text-white font-medium py-3 rounded-xl"
            >
              {submitting ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400 space-y-1">
            <p>Demo user: john@example.com / User123!</p>
            <p>Demo admin: admin@moviebox.com / Admin123!</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
