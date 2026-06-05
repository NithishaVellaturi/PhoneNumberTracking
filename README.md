# TrackSecure

TrackSecure is a production-oriented phone number intelligence platform built with:

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Zustand
- Axios
- React Query
- Recharts
- React Leaflet
- Java Spring Boot
- PostgreSQL

The application is intentionally public-first:

- no login
- no registration
- no JWT
- no protected routes
- no mock APIs
- no demo users

## Core flow

1. Open the website.
2. Enter a phone number.
3. Run `Track Number`.
4. View carrier, numbering, region, timezone, map, spam risk, and lookup history data.
5. Review live analytics on the dashboard.

## API surface

- `GET /api/phone/lookup?number=&countryCode=`
- `GET /api/dashboard/stats`
- `GET /api/dashboard/trends`
- `GET /api/health`

## Local development

Frontend:

```bash
npm run dev:frontend
```

Backend:

```bash
npm run dev:backend
```

The Vite dev server proxies `/api` to `http://localhost:8080`.

## Verification

Frontend production build:

```bash
npm run build
```

Frontend lint:

```bash
npm run lint
```

Backend compile:

```bash
cd backend
.\mvnw.cmd -q -DskipTests compile
```

Backend tests:

```bash
cd backend
.\mvnw.cmd -q test
```

## Environment variables

Frontend:

```bash
VITE_API_BASE_URL=/api
```

For production, point `VITE_API_BASE_URL` at your deployed backend, for example:

```bash
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

Backend:

```bash
SERVER_PORT=8080
FRONTEND_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
CALLER_NAME_PROVIDER=none
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_LOOKUP_TIMEOUT_MS=3000
GEOCODING_ENABLED=true
GEOCODING_BASE_URL=https://nominatim.openstreetmap.org
GEOCODING_USER_AGENT=TrackSecure/1.0 (phone intelligence platform)
GEOCODING_CONNECT_TIMEOUT_MS=2500
GEOCODING_REQUEST_TIMEOUT_MS=4000
DB_URL=jdbc:postgresql://localhost:5432/tracksecure
DB_USERNAME=tracksecure
DB_PASSWORD=change-me
DB_DRIVER=org.postgresql.Driver
```

Notes:

- `CALLER_NAME_PROVIDER=twilio` enables optional Twilio caller-name enrichment when credentials are present.
- The backend falls back to in-memory H2 for local bootstrapping if `DB_URL` is not set, but PostgreSQL is the intended production database.
- Map coordinates are estimated from numbering/carrier metadata plus geocoding. They do not represent live device location.

## Deployment notes

- Deploy the Vite frontend separately from the Spring Boot backend.
- Set `FRONTEND_ORIGIN` on the backend to the final frontend URL so CORS stays correct.
- Set `VITE_API_BASE_URL` on the frontend to the deployed backend `/api` URL.
- Railway works well for the backend because the project already includes a `railway.json` health check and Docker-based backend build.
