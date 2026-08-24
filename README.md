# MovieBox

A React cinema booking app with login, signup, seat booking, and an admin dashboard.

## Run locally (development)

```bash
npm install
npm run server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The API runs on port 5050.

Or start both together:

```bash
npm run dev:all
```

## Production build

```bash
npm install
npm run build
npm start
```

Then open [http://localhost:5050](http://localhost:5050). The server serves the built frontend and the API together.

## Demo accounts

- User: `john@example.com` / `User123!`
- Admin: `admin@moviebox.com` / `Admin123!`

## Features

- Homepage with movie search and now-playing cards
- Movie details and showtimes
- Seat selection
- Venmo payment checkout
- Booking confirmation
- Admin dashboard (bookings, movies, users, settings)
