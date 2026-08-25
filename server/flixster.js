import { hasRapidApiKey, fetchMovieList } from './rapidMovies.js';

const KEY = () => process.env.RAPIDAPI_KEY;
const HOST = process.env.RAPIDAPI_FLIXSTER_HOST || 'flixster.p.rapidapi.com';
const DEFAULT_ZIP = '10001';
const DEFAULT_CITY = 'New York';
const LIST_LIMIT = 9;

export const THEATER_CITIES = [
  { city: 'New York', zip: '10001' },
  { city: 'Los Angeles', zip: '90012' },
  { city: 'Chicago', zip: '60601' }
];

const IMAGES = [
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'
];

const listCache = new Map();
const detailCache = new Map();

function theaterImage(id) {
  let hash = 0;
  for (const ch of String(id)) hash = (hash + ch.charCodeAt(0)) % IMAGES.length;
  return IMAGES[hash];
}

function titleCase(value) {
  const text = String(value || '').replace(/[_-]+/g, ' ').toLowerCase();
  return text.replace(/\b\w/g, (c) => c.toUpperCase()) || 'Standard';
}

function formatClock(providerTime) {
  const parts = String(providerTime || '').split(':');
  const hour = Number(parts[0]);
  const minute = Number(parts[1] || 0);
  if (Number.isNaN(hour)) return String(providerTime || '');
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h12 = ((hour + 11) % 12) + 1;
  return `${h12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function formatRuntime(minutes) {
  const n = Number(minutes);
  if (!n) return '';
  const h = Math.floor(n / 60);
  const m = n % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

function normTitle(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function resolvePlace(query) {
  const q = String(query || '').trim();
  if (/^\d{5}$/.test(q)) {
    const known = THEATER_CITIES.find((c) => c.zip === q);
    return { zip: q, city: known?.city || q, nameFilter: '' };
  }
  if (q) {
    const known = THEATER_CITIES.find((c) => {
      const city = c.city.toLowerCase();
      const needle = q.toLowerCase();
      return city === needle || city.includes(needle) || needle.includes(city);
    });
    if (known) return { zip: known.zip, city: known.city, nameFilter: '' };
    return { zip: DEFAULT_ZIP, city: DEFAULT_CITY, nameFilter: q };
  }
  return { zip: DEFAULT_ZIP, city: DEFAULT_CITY, nameFilter: '' };
}

async function flixsterGet(pathname) {
  const key = KEY();
  if (!key) throw new Error('RAPIDAPI_KEY is not set');
  const res = await fetch(`https://${HOST}${pathname}`, {
    headers: {
      'x-rapidapi-key': key,
      'x-rapidapi-host': HOST,
      'Content-Type': 'application/json'
    }
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(data.message || `Flixster ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

function mapTheater(raw, place) {
  const distance = Number(raw.distance);
  const screens = [];
  if (raw.hasReservedSeating) screens.push('Reserved seating');
  if (raw.isTicketing) screens.push('Online tickets');
  if (raw.hasShowtimes === true || raw.hasShowtimes === 'true') screens.push('Showtimes today');
  return {
    id: raw.id,
    tid: raw.tid,
    name: raw.name,
    city: place.city,
    address: Number.isFinite(distance)
      ? `${distance.toFixed(1)} miles from ${place.zip}`
      : `Near ${place.city}`,
    zip: place.zip,
    hours: 'See today’s showtimes',
    rating: '',
    screens: screens.length ? screens : ['Showtimes today'],
    image: theaterImage(raw.id),
    latitude: raw.latitude,
    longitude: raw.longitude,
    source: 'flixster'
  };
}

function collectTimes(movie) {
  const times = [];
  for (const variant of movie.movieVariants || []) {
    const format = titleCase(variant.formatName || 'Standard');
    for (const group of variant.amenityGroups || []) {
      for (const show of group.showtimes || []) {
        if (show.isActive === false) continue;
        times.push({
          id: show.id,
          time: formatClock(show.providerTime),
          date: show.providerDate || '',
          format,
          theater: format
        });
      }
    }
  }
  times.sort((a, b) => String(a.date + a.time).localeCompare(String(b.date + b.time)));
  return times;
}

function matchCatalog(title, catalog) {
  const n = normTitle(title);
  if (!n) return null;
  return catalog.find((movie) => normTitle(movie.title) === n)
    || catalog.find((movie) => {
      const other = normTitle(movie.title);
      return other.includes(n) || n.includes(other);
    })
    || null;
}

export async function fetchFlixsterTheaters(query = '') {
  if (!hasRapidApiKey()) return [];
  const place = resolvePlace(query);
  const cacheKey = `${place.zip}:${place.nameFilter}`.toLowerCase();
  const cached = listCache.get(cacheKey);
  if (cached && Date.now() - cached.at < 10 * 60 * 1000) return cached.theaters;

  const data = await flixsterGet(
    `/theaters/list?zipCode=${encodeURIComponent(place.zip)}&radius=20`
  );
  let theaters = (data?.data?.theaters || []).map((row) => mapTheater(row, place));
  if (place.nameFilter) {
    const needle = place.nameFilter.toLowerCase();
    theaters = theaters.filter((theater) => theater.name.toLowerCase().includes(needle));
  }
  theaters = theaters.slice(0, LIST_LIMIT);
  listCache.set(cacheKey, { at: Date.now(), theaters });
  return theaters;
}

export async function fetchFlixsterShowtimes(theaterId) {
  if (!hasRapidApiKey()) return { movies: [], displayDate: '' };
  const cached = detailCache.get(String(theaterId));
  if (cached && Date.now() - cached.at < 5 * 60 * 1000) return cached.payload;

  const data = await flixsterGet(`/theaters/detail?id=${encodeURIComponent(theaterId)}`);
  const grouping = data?.data?.theaterShowtimeGroupings || {};
  let catalog = [];
  try {
    catalog = await fetchMovieList('');
  } catch {
    catalog = [];
  }

  const movies = (grouping.movies || []).map((movie) => {
    const catalogMovie = matchCatalog(movie.name, catalog);
    const times = collectTimes(movie).map((show) => ({
      ...show,
      price: null,
      bookShowId: catalogMovie ? 1 : null
    }));
    return {
      id: movie.emsId || movie.fandangoId || movie.name,
      title: movie.name,
      poster: movie.posterImage?.url || '',
      duration: formatRuntime(movie.durationMinutes),
      catalogId: catalogMovie?.id || null,
      times
    };
  }).filter((row) => row.times.length);

  const payload = {
    displayDate: grouping.displayDate || '',
    movies
  };
  detailCache.set(String(theaterId), { at: Date.now(), payload });
  return payload;
}
