import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hasRapidApiKey, fetchMovieList } from './rapidMovies.js';

const KEY = () => process.env.RAPIDAPI_KEY;
const HOST = process.env.RAPIDAPI_FRENCH_CINEMA_HOST || 'french-cinema-showtimes-api.p.rapidapi.com';
const LIST_LIMIT = 12;
const LIST_TTL = 6 * 60 * 60 * 1000;
const SHOW_TTL = 30 * 60 * 1000;
const DATE_SPAN = 7;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = path.join(__dirname, 'data', 'french-cinema-cache.json');

export const THEATER_CITIES = [
  { city: 'Paris', zip: '75002' },
  { city: 'Lyon', zip: '69001' },
  { city: 'Marseille', zip: '13001' },
  { city: 'Bordeaux', zip: '33000' },
  { city: 'Toulouse', zip: '31000' },
  { city: 'Nice', zip: '06000' }
];

const IMAGES = [
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'
];

function theaterImage(id) {
  let hash = 0;
  for (const ch of String(id)) hash = (hash + ch.charCodeAt(0)) % IMAGES.length;
  return IMAGES[hash];
}

export function localDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function upcomingDates(span = DATE_SPAN) {
  return Array.from({ length: span }, (_, i) => localDate(i));
}

function readDiskCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  } catch {
    return { theaters: {}, showtimes: {} };
  }
}

function writeDiskCache(cache) {
  try {
    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache));
  } catch {
    /* ignore disk cache errors */
  }
}

function cacheGet(bucket, key, ttl) {
  const cache = readDiskCache();
  const row = cache[bucket]?.[key];
  if (!row) return null;
  if (Date.now() - row.at > ttl) return null;
  return row.value;
}

function cacheSet(bucket, key, value) {
  const cache = readDiskCache();
  if (!cache[bucket]) cache[bucket] = {};
  cache[bucket][key] = { at: Date.now(), value };
  writeDiskCache(cache);
}

function decodeCinemaId(encoded) {
  const raw = String(encoded || '').trim();
  if (/^[A-Za-z]\d{4}$/.test(raw)) return raw;
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8').trim();
    if (/^[A-Za-z]\d{4}$/.test(decoded)) return decoded;
    return decoded || raw;
  } catch {
    return raw;
  }
}

function encodeCinemaId(id) {
  return Buffer.from(String(id), 'utf8').toString('base64');
}

function cityFromAddress(address, fallback) {
  const text = String(address || '');
  const match = text.match(/\d{5}\s+(.+)$/);
  return (match ? match[1] : fallback || '').trim();
}

function formatClock(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso || '');
  const hour = date.getHours();
  const minute = date.getMinutes();
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h12 = ((hour + 11) % 12) + 1;
  return `${h12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function normTitle(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
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

export function resolvePlace(query) {
  const q = String(query || '').trim();
  if (/^\d{5}$/.test(q)) {
    const known = THEATER_CITIES.find((c) => c.zip === q);
    return { zip: q, city: known?.city || q };
  }
  if (q) {
    const known = THEATER_CITIES.find((c) => {
      const city = c.city.toLowerCase();
      const needle = q.toLowerCase();
      return city === needle || city.includes(needle) || needle.includes(city);
    });
    if (known) return { zip: known.zip, city: known.city };
  }
  return { zip: THEATER_CITIES[0].zip, city: THEATER_CITIES[0].city };
}

async function frenchGet(pathname) {
  const key = KEY();
  if (!key) throw new Error('RAPIDAPI_KEY is not set');
  const res = await fetch(`https://${HOST}${pathname}`, {
    headers: {
      'x-rapidapi-key': key,
      'x-rapidapi-host': HOST,
      Accept: 'application/json'
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
    const err = new Error(data.message || data.detail || `French cinema ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

function mapTheater(encodedId, raw, place) {
  const id = decodeCinemaId(encodedId);
  const address = String(raw?.adresse || raw?.address || '').trim();
  return {
    id,
    name: String(raw?.name || id).trim(),
    city: cityFromAddress(address, place.city),
    address: address || `Postal code ${place.zip}`,
    zip: place.zip,
    hours: 'Select a date for showtimes',
    rating: '',
    screens: ['VO', 'VF'],
    image: theaterImage(id),
    source: 'french-cinema'
  };
}

function collectTimes(movie) {
  const times = [];
  const groups = [
    { rows: movie.showtimesVO || [], format: 'VO' },
    { rows: movie.showtimesLocal || movie.showtimesVF || [], format: 'VF' }
  ];
  for (const group of groups) {
    for (const show of group.rows) {
      const startsAt = show.startsAt || show.start || show.time;
      if (!startsAt) continue;
      times.push({
        id: `${group.format}-${startsAt}`,
        time: formatClock(startsAt),
        date: String(startsAt).slice(0, 10),
        format: group.format,
        theater: group.format,
        price: null
      });
    }
  }
  times.sort((a, b) => String(a.date + a.time).localeCompare(String(b.date + b.time)));
  return times;
}

export async function fetchFrenchTheaters(query = '') {
  if (!hasRapidApiKey()) return [];
  const place = resolvePlace(query);
  const cacheKey = String(place.zip);
  const cached = cacheGet('theaters', cacheKey, LIST_TTL);
  if (cached) return cached;

  try {
    const data = await frenchGet(`/theaters/${encodeURIComponent(place.zip)}`);
    const theaters = Object.entries(data || {})
      .map(([encodedId, raw]) => mapTheater(encodedId, raw, place))
      .filter((row) => row.name)
      .slice(0, LIST_LIMIT);
    cacheSet('theaters', cacheKey, theaters);
    return theaters;
  } catch (err) {
    const stale = readDiskCache().theaters?.[cacheKey]?.value;
    if (Array.isArray(stale) && stale.length) return stale;
    throw err;
  }
}

export async function fetchFrenchShowtimes(theaterId, date) {
  if (!hasRapidApiKey()) return { movies: [], displayDate: '', dates: upcomingDates() };
  const day = /^\d{4}-\d{2}-\d{2}$/.test(String(date || '')) ? String(date) : localDate();
  const id = decodeCinemaId(theaterId);
  const encoded = encodeCinemaId(id);
  const cacheKey = `${id}:${day}`;
  const cached = cacheGet('showtimes', cacheKey, SHOW_TTL);
  if (cached) return cached;

  try {
    const data = await frenchGet(`/movies/${encoded}/${day}`);
    let catalog = [];
    try {
      catalog = await fetchMovieList('');
    } catch {
      catalog = [];
    }

    const rows = Array.isArray(data) ? data : Object.values(data || {});
    const movies = rows.map((movie, index) => {
      const catalogMovie = matchCatalog(movie.title, catalog);
      const times = collectTimes(movie).map((show) => ({
        ...show,
        bookShowId: catalogMovie ? 1 : null
      }));
      return {
        id: movie.id || movie.title || String(index),
        title: movie.title,
        poster: movie.poster || '',
        duration: movie.duree || movie.duration || '',
        catalogId: catalogMovie?.id || null,
        times
      };
    }).filter((row) => row.times.length);

    const payload = {
      displayDate: day,
      dates: upcomingDates(),
      movies
    };
    cacheSet('showtimes', cacheKey, payload);
    return payload;
  } catch (err) {
    const stale = readDiskCache().showtimes?.[cacheKey]?.value;
    if (stale) return stale;
    throw err;
  }
}
