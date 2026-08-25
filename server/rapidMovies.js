import fs from 'fs';
import path from 'path';

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && process.env[key] == null) process.env[key] = value;
  }
}

loadEnvFile();

const HOST = process.env.RAPIDAPI_HOST || 'advanced-movie-search.p.rapidapi.com';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const IMAGE_BACKDROP = 'https://image.tmdb.org/t/p/w1280';

const GENRE_IDS = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  'sci-fi': 878,
  scifi: 878,
  thriller: 53,
  war: 10752,
  western: 37
};

const GENRE_NAMES = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
};

export function hasRapidApiKey() {
  return Boolean(process.env.RAPIDAPI_KEY);
}

const FEATURED_IDS = [550, 155, 27205, 157336, 603, 680];
const cache = {
  list: { at: 0, movies: [] },
  details: new Map()
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function rapidGet(pathname, attempt = 0) {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error('RAPIDAPI_KEY is not set');
  const url = `https://${HOST}${pathname}`;
  const res = await fetch(url, {
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
    const message = data.message || data.error || `RapidAPI ${res.status}`;
    if (res.status === 429 && attempt < 2) {
      await sleep(1200 * (attempt + 1));
      return rapidGet(pathname, attempt + 1);
    }
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function posterUrl(value) {
  if (!value) return '';
  if (String(value).startsWith('http')) return value;
  return `${IMAGE_BASE}${value}`;
}

function backdropUrl(value, fallback) {
  if (!value) return posterUrl(fallback);
  if (String(value).startsWith('http')) return value;
  return `${IMAGE_BACKDROP}${value}`;
}

function formatRuntime(minutes) {
  const n = Number(minutes);
  if (!n) return 'Now playing';
  const h = Math.floor(n / 60);
  const m = n % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

function genreLabel(movie) {
  if (Array.isArray(movie.genres) && movie.genres.length) {
    return movie.genres.map((g) => g.name || g).filter(Boolean).join(', ');
  }
  if (Array.isArray(movie.genre_ids) && movie.genre_ids.length) {
    return movie.genre_ids.map((id) => GENRE_NAMES[id] || '').filter(Boolean).join(', ');
  }
  return movie.genre || 'Movie';
}

export function mapRapidMovie(raw) {
  const movie = raw?.movie || raw?.data || raw || {};
  const poster = posterUrl(movie.poster_path || movie.poster || movie.image);
  return {
    id: movie.id,
    title: movie.title || movie.name || 'Untitled',
    rating: Number(movie.vote_average || movie.rating || 0).toFixed(1),
    genre: genreLabel(movie),
    poster,
    backdrop: backdropUrl(movie.backdrop_path || movie.backdrop, movie.poster_path || movie.poster),
    duration: formatRuntime(movie.runtime || movie.duration),
    releaseDate: movie.release_date || movie.releaseDate || '',
    director: movie.director || '',
    cast: Array.isArray(movie.cast)
      ? movie.cast.map((p) => p.name || p).filter(Boolean)
      : [],
    description: movie.overview || movie.description || movie.plot || '',
    status: 'active',
    source: 'rapidapi'
  };
}

function listFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.movies)) return data.movies;
  if (data.movie) return [data.movie];
  return [];
}

export async function fetchMovieList(query = '') {
  const q = String(query || '').trim();

  if (!q && cache.list.movies.length && Date.now() - cache.list.at < 10 * 60 * 1000) {
    return cache.list.movies;
  }

  const featured = [];
  for (const id of FEATURED_IDS) {
    try {
      featured.push(await fetchMovieDetails(id));
      await sleep(400);
    } catch (err) {
      console.error(`RapidAPI details ${id} failed:`, err.message);
    }
  }
  if (featured.length) cache.list = { at: Date.now(), movies: featured };
  if (q) {
    return featured.filter((m) =>
      `${m.title} ${m.genre} ${m.description}`.toLowerCase().includes(q.toLowerCase())
    );
  }
  return featured;
}

export async function fetchMovieDetails(id) {
  const key = String(id);
  if (cache.details.has(key)) return cache.details.get(key);
  let mapped;
  try {
    mapped = mapRapidMovie(await rapidGet(`/api/movies/getdetails?movie_id=${encodeURIComponent(id)}`));
  } catch {
    mapped = mapRapidMovie(await rapidGet(`/movie/${encodeURIComponent(id)}`));
  }
  if (mapped?.id) cache.details.set(key, mapped);
  return mapped;
}
