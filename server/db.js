import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'db.json');

function emptyDb() {
  return {
    users: [],
    movies: [],
    theaters: [],
    bookings: [],
    messages: [],
    settings: {
      venmoUsername: '@MovieBox-Cinema',
      maxSeatsPerBooking: 8,
      bookingTimeLimit: 15,
      cancellationPolicy: 24
    }
  };
}

export function readDb() {
  if (!fs.existsSync(dbPath)) return emptyDb();
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

export function writeDb(db) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}
