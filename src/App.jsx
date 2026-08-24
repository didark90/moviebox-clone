import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/PageLoader';
import './App.css';

const Homepage = lazy(() => import('./components/Homepage'));
const AuthPage = lazy(() => import('./components/AuthPage'));
const MovieDetails = lazy(() => import('./components/MovieDetails'));
const SeatSelection = lazy(() => import('./components/SeatSelection'));
const PaymentPage = lazy(() => import('./components/PaymentPage'));
const BookingConfirmation = lazy(() => import('./components/BookingConfirmation'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/movie/:id/seats/:showtimeId" element={<SeatSelection />} />
              <Route
                path="/payment/:id/:showtimeId"
                element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking-confirmation"
                element={
                  <ProtectedRoute>
                    <BookingConfirmation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
