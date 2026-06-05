# Digimos

A mosque (masjid) information display system built with SvelteKit and SQLite.

Digimos shows prayer times, adzan/iqamah countdowns, running text announcements, and
supports multiple visual themes — designed to run fullscreen on a TV or set-top box.

## Features

- Multi-mosque support from a single server
- Six visual display themes
- Prayer time integration via [MyQuran API](https://api.myquran.com) and [AlAdhan API](https://aladhan.com/prayer-times-api)
- Automatic adzan overlay and iqamah countdown
- Configurable running text announcements
- Wallpaper upload and gallery management
- YouTube streaming mode as display background
- Admin panel with session-based authentication
- User management (superadmin and per-mosque admin roles)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit 2 (adapter-node) |
| Runtime | Node.js 20+ |
| Database | SQLite via better-sqlite3 |
| ORM | Drizzle ORM |
| Auth | Cookie sessions + bcryptjs |
| Styling | Plain CSS |

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-github-org/digimos.git
cd digimos

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set your values (especially SEED_PASSWORD)
```

### Database Setup

```bash
# Push schema to create the SQLite database
npm run db:push

# Seed initial data (creates superadmin user and a sample mosque)
# Requires SEED_PASSWORD to be set in .env
npm run db:seed
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

Log in with username `admin` and the password you set in `SEED_PASSWORD`.

### Production Build

```bash
npm run build

# Start the production server
node build/index.js
```

The server listens on port `3000` by default. Configure a reverse proxy (nginx, Caddy)
in front of it for HTTPS and domain routing.

## Display URL

Each mosque has a dedicated fullscreen display page:

```
http://your-server/display/{masjidId}
```

Open this URL on the TV or set-top box browser. No login is required for the display page.

## Environment Variables

See `.env.example` for all supported variables.

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Set to `production` in production |
| `DATABASE_PATH` | `./database.db` | Path to the SQLite database file |
| `SEED_PASSWORD` | — | Password for the initial superadmin user (seeding only) |

## Project Structure

```
src/
  routes/
    (app)/          # Admin panel (login required)
      dashboard/
      admin/[masjidId]/
      masjid/
      settings/[masjidId]/
      jadwal/[masjidId]/
      iqamah/[masjidId]/
      users/
    (auth)/
      login/
    display/[masjidId]/  # Fullscreen TV display (public)
    api/
      auth/
      jadwal/
      jadwal/sync/
  lib/
    server/
      db.ts          # Drizzle + SQLite connection
      schema.ts      # Database schema
      auth.ts        # Session management
      prayer-api.ts  # Prayer time API integration
      seed.ts        # Database seeder
    components/
      themes/        # Display theme components (Theme1-Theme6)
static/
  uploads/           # User-uploaded wallpapers (gitignored at runtime)
```

## Prayer Time APIs

Two providers are supported per mosque:

- **MyQuran** (default) — uses Indonesian Kemenag calculation via `cityApiId`
- **AlAdhan** — uses city name + country; supports multiple calculation methods

The app fetches and caches a full month of schedules in the local database on first
access, then serves from cache.

## License

MIT
