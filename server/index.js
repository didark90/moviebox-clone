import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readDb, writeDb, nextId } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5050;
const JWT_SECRET = process.env.JWT_SECRET || 'moviebox-dev-secret-change-me';
const distPath = path.join(__dirname, '..', 'dist');

app.use(cors());
app.use(express.json());

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function publicUser(user) {
  const { password, ...safe } = user;
  return safe;
}

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in first' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please log in again' });
  }
}

function adminRequired(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

const DEFAULT_SHOWTIMES = [
  { id: 1, time: '10:30 AM', theater: 'IMAX Screen 1', price: 18.5 },
  { id: 2, time: '1:45 PM', theater: 'Premium Screen 2', price: 15.5 },
  { id: 3, time: '4:20 PM', theater: 'Standard Screen 3', price: 12.5 },
  { id: 4, time: '7:00 PM', theater: 'IMAX Screen 1', price: 18.5 },
  { id: 5, time: '9:45 PM', theater: 'Premium Screen 2', price: 15.5 },
  { id: 6, time: '11:30 PM', theater: 'Standard Screen 3', price: 12.5 }
];

function seedMovies() {
  return [
    {
      id: 1,
      title: 'Avatar: The Way of Water',
      rating: 8.1,
      genre: 'Sci-Fi, Adventure',
      poster: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?auto=format&fit=crop&w=600&q=80',
      backdrop: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?auto=format&fit=crop&w=2070&q=80',
      duration: '3h 12m',
      releaseDate: 'December 16, 2022',
      director: 'James Cameron',
      cast: ['Sam Worthington', 'Zoe Saldaña', 'Sigourney Weaver', 'Stephen Lang'],
      description: 'Set more than a decade after the events of the first film, Avatar: The Way of Water begins to tell the story of the Sully family, the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure.',
      status: 'active',
      showtimes: DEFAULT_SHOWTIMES
    },
    {
      id: 2,
      title: 'Oppenheimer',
      rating: 8.7,
      genre: 'Biography, Drama',
      poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
      backdrop: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=2070&q=80',
      duration: '3h 0m',
      releaseDate: 'July 21, 2023',
      director: 'Christopher Nolan',
      cast: ['Cillian Murphy', 'Emily Blunt', 'Robert Downey Jr.'],
      description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
      status: 'active',
      showtimes: DEFAULT_SHOWTIMES
    },
    {
      id: 3,
      title: 'John Wick: Chapter 4',
      rating: 8.2,
      genre: 'Action, Thriller',
      poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=600&q=80',
      backdrop: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=2070&q=80',
      duration: '2h 49m',
      releaseDate: 'March 24, 2023',
      director: 'Chad Stahelski',
      cast: ['Keanu Reeves', 'Donnie Yen', 'Bill Skarsgård'],
      description: 'John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe.',
      status: 'active',
      showtimes: DEFAULT_SHOWTIMES
    },
    {
      id: 4,
      title: 'Spider-Man: No Way Home',
      rating: 8.4,
      genre: 'Action, Adventure',
      poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      backdrop: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      duration: '2h 28m',
      releaseDate: 'December 17, 2021',
      director: 'Jon Watts',
      cast: ['Tom Holland', 'Zendaya', 'Benedict Cumberbatch'],
      description: 'With Spider-Man’s identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear.',
      status: 'active',
      showtimes: DEFAULT_SHOWTIMES
    },
    {
      id: 5,
      title: 'Top Gun: Maverick',
      rating: 8.6,
      genre: 'Action, Drama',
      poster: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80',
      backdrop: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2070&q=80',
      duration: '2h 10m',
      releaseDate: 'May 27, 2022',
      director: 'Joseph Kosinski',
      cast: ['Tom Cruise', 'Miles Teller', 'Jennifer Connelly'],
      description: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, training a new generation of pilots for a dangerous mission.',
      status: 'active',
      showtimes: DEFAULT_SHOWTIMES
    },
    {
      id: 6,
      title: 'The Batman',
      rating: 8.1,
      genre: 'Action, Crime',
      poster: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=600&q=80',
      backdrop: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=2070&q=80',
      duration: '2h 56m',
      releaseDate: 'March 4, 2022',
      director: 'Matt Reeves',
      cast: ['Robert Pattinson', 'Zoë Kravitz', 'Paul Dano'],
      description: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city’s hidden corruption.',
      status: 'active',
      showtimes: DEFAULT_SHOWTIMES
    }
  ];
}

function seedTheaters() {
  return [
    {
      id: 1,
      name: 'MovieBox Downtown',
      address: '120 Cinema Boulevard, Downtown',
      city: 'New York',
      screens: ['IMAX Screen 1', 'Premium Screen 2'],
      hours: '10:00 AM – 12:00 AM',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      name: 'MovieBox Mall',
      address: '45 Galleria Plaza, Westside Mall',
      city: 'Los Angeles',
      screens: ['Premium Screen 2', 'Standard Screen 3'],
      hours: '11:00 AM – 11:30 PM',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      name: 'MovieBox IMAX Center',
      address: '8 Harbor Street, Waterfront',
      city: 'Chicago',
      screens: ['IMAX Screen 1', 'Standard Screen 3'],
      hours: '10:30 AM – 1:00 AM',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ];
}

function seedBookings() {
  return [
    {
      id: 'BK001',
      userId: 2,
      user: 'John Doe',
      email: 'john@example.com',
      movieId: 1,
      movie: 'Avatar: The Way of Water',
      seats: ['F7', 'F8'],
      showtime: '7:00 PM',
      showtimeId: 4,
      date: '2024-03-15',
      theater: 'IMAX Screen 1',
      amount: 39.5,
      paymentStatus: 'confirmed',
      paymentMethod: 'venmo',
      bookingDate: new Date().toISOString()
    }
  ];
}

async function ensureSeed() {
  const db = readDb();
  let changed = false;

  if (!db.users?.length) {
    db.users = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@moviebox.com',
        phone: '+1 (555) 000-0001',
        password: await bcrypt.hash('Admin123!', 10),
        role: 'admin',
        status: 'active',
        joinDate: '2024-01-01',
        lastActive: new Date().toISOString().slice(0, 10)
      },
      {
        id: 2,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        password: await bcrypt.hash('User123!', 10),
        role: 'user',
        status: 'active',
        joinDate: '2024-01-15',
        lastActive: new Date().toISOString().slice(0, 10)
      }
    ];
    changed = true;
  }

  if (!db.movies?.length) {
    db.movies = seedMovies();
    changed = true;
  }
  if (!db.theaters?.length) {
    db.theaters = seedTheaters();
    changed = true;
  }
  if (!db.bookings?.length) {
    db.bookings = seedBookings();
    changed = true;
  }
  if (!db.messages) db.messages = [];
  if (!db.settings) {
    db.settings = {
      venmoUsername: '@MovieBox-Cinema',
      maxSeatsPerBooking: 8,
      bookingTimeLimit: 15,
      cancellationPolicy: 24
    };
    changed = true;
  }

  if (changed) writeDb(db);
}

function validateSignup({ name, email, password, confirmPassword }) {
  const errors = {};
  if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!email || !EMAIL_RE.test(email)) errors.email = 'Enter a valid email address';
  if (!password || !PASSWORD_RE.test(password)) {
    errors.password = 'Password must be at least 8 characters and include a letter and a number';
  }
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

function validateLogin({ email, password }) {
  const errors = {};
  if (!email || !EMAIL_RE.test(email)) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  return errors;
}

app.post('/api/auth/signup', async (req, res) => {
  const errors = validateSignup(req.body || {});
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  const db = readDb();
  const email = req.body.email.trim().toLowerCase();
  if (db.users.some((u) => u.email === email)) {
    return res.status(400).json({ errors: { email: 'An account with this email already exists' } });
  }

  const user = {
    id: nextId(db.users),
    name: req.body.name.trim(),
    email,
    phone: req.body.phone || '',
    password: await bcrypt.hash(req.body.password, 10),
    role: 'user',
    status: 'active',
    joinDate: new Date().toISOString().slice(0, 10),
    lastActive: new Date().toISOString().slice(0, 10)
  };
  db.users.push(user);
  writeDb(db);
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const errors = validateLogin(req.body || {});
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  const db = readDb();
  const email = req.body.email.trim().toLowerCase();
  const user = db.users.find((u) => u.email === email);
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(401).json({ errors: { password: 'Invalid email or password' } });
  }
  if (user.status === 'suspended') {
    return res.status(403).json({ errors: { email: 'This account has been suspended' } });
  }

  user.lastActive = new Date().toISOString().slice(0, 10);
  writeDb(db);
  res.json({ token: signToken(user), user: publicUser(user) });
});

app.get('/api/auth/me', authRequired, (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: publicUser(user) });
});

app.get('/api/movies', (req, res) => {
  const db = readDb();
  const q = (req.query.q || '').toLowerCase();
  const location = (req.query.location || '').toLowerCase();
  let movies = db.movies.filter((m) => m.status !== 'inactive');
  if (q) {
    movies = movies.filter((m) =>
      `${m.title} ${m.genre} ${m.director}`.toLowerCase().includes(q)
    );
  }
  if (location) {
    const theaterNames = db.theaters
      .filter((t) => `${t.city} ${t.address} ${t.name}`.toLowerCase().includes(location))
      .flatMap((t) => t.screens);
    movies = movies.filter((m) =>
      (m.showtimes || []).some((s) => theaterNames.includes(s.theater))
    );
  }
  res.json(movies);
});

app.get('/api/movies/:id', (req, res) => {
  const db = readDb();
  const movie = db.movies.find((m) => String(m.id) === String(req.params.id));
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  res.json(movie);
});

app.get('/api/theaters', (req, res) => {
  const db = readDb();
  const q = (req.query.q || '').toLowerCase();
  let theaters = db.theaters;
  if (q) {
    theaters = theaters.filter((t) =>
      `${t.name} ${t.city} ${t.address}`.toLowerCase().includes(q)
    );
  }
  res.json(theaters);
});

app.get('/api/showtimes/:movieId/:showtimeId/seats', (req, res) => {
  const db = readDb();
  const movie = db.movies.find((m) => String(m.id) === String(req.params.movieId));
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  const showtime = (movie.showtimes || []).find((s) => String(s.id) === String(req.params.showtimeId));
  if (!showtime) return res.status(404).json({ error: 'Showtime not found' });

  const booked = db.bookings
    .filter((b) =>
      String(b.movieId) === String(movie.id) &&
      String(b.showtimeId) === String(showtime.id) &&
      b.paymentStatus !== 'cancelled'
    )
    .flatMap((b) => b.seats);

  const defaults = ['A5', 'A6', 'B8', 'B9', 'C3', 'C4', 'D12', 'D13', 'E7', 'E8', 'E9'];
  res.json({
    movie,
    showtime: { ...showtime, date: 'March 15, 2024' },
    bookedSeats: [...new Set([...defaults, ...booked])]
  });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  const errors = {};
  if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!email || !EMAIL_RE.test(email)) errors.email = 'Enter a valid email address';
  if (!message || message.trim().length < 10) errors.message = 'Message must be at least 10 characters';
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  const db = readDb();
  db.messages.push({
    id: nextId(db.messages),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
    createdAt: new Date().toISOString()
  });
  writeDb(db);
  res.status(201).json({ ok: true, message: 'Thanks! We will get back to you soon.' });
});

app.post('/api/bookings', authRequired, (req, res) => {
  const { movieId, showtimeId, seats, paymentMethod } = req.body || {};
  const errors = {};
  if (!movieId) errors.movieId = 'Movie is required';
  if (!showtimeId) errors.showtimeId = 'Showtime is required';
  if (!Array.isArray(seats) || seats.length === 0) errors.seats = 'Select at least one seat';
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  const db = readDb();
  const user = db.users.find((u) => u.id === req.user.id);
  const movie = db.movies.find((m) => String(m.id) === String(movieId));
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  const showtime = (movie.showtimes || []).find((s) => String(s.id) === String(showtimeId));
  if (!showtime) return res.status(404).json({ error: 'Showtime not found' });

  const taken = db.bookings
    .filter((b) =>
      String(b.movieId) === String(movieId) &&
      String(b.showtimeId) === String(showtimeId) &&
      b.paymentStatus !== 'cancelled'
    )
    .flatMap((b) => b.seats);
  const conflict = seats.find((seat) => taken.includes(seat));
  if (conflict) return res.status(409).json({ error: `Seat ${conflict} is already booked` });

  const tickets = seats.reduce((sum, seat) => {
    const isPremium = /^[A-C]/.test(seat);
    return sum + showtime.price + (isPremium ? 5 : 0);
  }, 0);
  const convenienceFee = 2.5;
  const booking = {
    id: 'BK' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    userId: user.id,
    user: user.name,
    email: user.email,
    movieId: movie.id,
    movie: movie.title,
    seats,
    showtime: showtime.time,
    showtimeId: showtime.id,
    date: '2024-03-15',
    theater: showtime.theater,
    amount: Number((tickets + convenienceFee).toFixed(2)),
    paymentStatus: 'confirmed',
    paymentMethod: paymentMethod || 'venmo',
    bookingDate: new Date().toISOString(),
    moviePoster: movie.poster,
    movieRating: movie.rating,
    movieDuration: movie.duration
  };
  db.bookings.push(booking);
  writeDb(db);
  res.status(201).json(booking);
});

app.get('/api/bookings/mine', authRequired, (req, res) => {
  const db = readDb();
  res.json(db.bookings.filter((b) => b.userId === req.user.id));
});

app.get('/api/admin/stats', authRequired, adminRequired, (req, res) => {
  const db = readDb();
  const confirmed = db.bookings.filter((b) => b.paymentStatus === 'confirmed');
  const pending = db.bookings.filter((b) => b.paymentStatus === 'pending');
  const revenue = confirmed.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  res.json({
    totalBookings: db.bookings.length,
    confirmedToday: confirmed.length,
    pending: pending.length,
    revenue: revenue.toFixed(2),
    activeMovies: db.movies.filter((m) => m.status === 'active').length,
    users: db.users.filter((u) => u.role !== 'admin').length,
    messages: db.messages.length
  });
});

app.get('/api/admin/bookings', authRequired, adminRequired, (req, res) => {
  res.json(readDb().bookings);
});

app.patch('/api/admin/bookings/:id', authRequired, adminRequired, (req, res) => {
  const db = readDb();
  const booking = db.bookings.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (req.body.paymentStatus) booking.paymentStatus = req.body.paymentStatus;
  writeDb(db);
  res.json(booking);
});

app.get('/api/admin/users', authRequired, adminRequired, (req, res) => {
  const db = readDb();
  res.json(db.users.map(publicUser).map((u) => {
    const userBookings = db.bookings.filter((b) => b.userId === u.id);
    return {
      ...u,
      totalBookings: userBookings.length,
      totalSpent: userBookings.reduce((sum, b) => sum + Number(b.amount || 0), 0)
    };
  }));
});

app.patch('/api/admin/users/:id', authRequired, adminRequired, (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => String(u.id) === String(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (req.body.status) user.status = req.body.status;
  writeDb(db);
  res.json(publicUser(user));
});

app.post('/api/admin/movies', authRequired, adminRequired, (req, res) => {
  const { title, genre } = req.body || {};
  if (!title || !genre) return res.status(400).json({ error: 'Title and genre are required' });
  const db = readDb();
  const movie = {
    id: nextId(db.movies),
    title,
    genre,
    duration: req.body.duration || '2h 00m',
    rating: Number(req.body.rating) || 0,
    director: req.body.director || '',
    cast: Array.isArray(req.body.cast)
      ? req.body.cast
      : String(req.body.cast || '').split(',').map((s) => s.trim()).filter(Boolean),
    description: req.body.description || '',
    poster: req.body.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    backdrop: req.body.backdrop || req.body.poster || '',
    releaseDate: req.body.releaseDate || new Date().toISOString().slice(0, 10),
    status: 'active',
    showtimes: req.body.showtimes?.length ? req.body.showtimes : DEFAULT_SHOWTIMES
  };
  db.movies.push(movie);
  writeDb(db);
  res.status(201).json(movie);
});

app.put('/api/admin/movies/:id', authRequired, adminRequired, (req, res) => {
  const db = readDb();
  const movie = db.movies.find((m) => String(m.id) === String(req.params.id));
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  Object.assign(movie, req.body, {
    id: movie.id,
    cast: Array.isArray(req.body.cast)
      ? req.body.cast
      : typeof req.body.cast === 'string'
        ? req.body.cast.split(',').map((s) => s.trim()).filter(Boolean)
        : movie.cast
  });
  writeDb(db);
  res.json(movie);
});

app.delete('/api/admin/movies/:id', authRequired, adminRequired, (req, res) => {
  const db = readDb();
  db.movies = db.movies.filter((m) => String(m.id) !== String(req.params.id));
  writeDb(db);
  res.json({ ok: true });
});

app.get('/api/admin/messages', authRequired, adminRequired, (req, res) => {
  res.json(readDb().messages);
});

app.get('/api/admin/settings', authRequired, adminRequired, (req, res) => {
  res.json(readDb().settings);
});

app.put('/api/admin/settings', authRequired, adminRequired, (req, res) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);
  res.json(db.settings);
});

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

ensureSeed().then(() => {
  const server = app.listen(PORT, (err) => {
    if (err) {
      console.error('MovieBox API failed to start:', err.message || err);
      process.exit(1);
      return;
    }
    console.log(`MovieBox running on http://localhost:${PORT}`);
  });
  server.on('error', (err) => {
    console.error('MovieBox API failed to start:', err.message);
    process.exit(1);
  });
});
