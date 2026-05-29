# TrackSecure

TrackSecure is a phone intelligence web app built with:

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Spring Boot
- JWT authentication

## Local development

Frontend:

```bash
npm run dev:frontend
```

Backend:

```bash
npm run dev:backend
```

## Production build

Frontend:

```bash
npm run build
```

Backend compile check:

```bash
cd backend
.\mvnw.cmd -q test-compile
```

## Netlify deployment

Netlify should host only the Vite frontend. The Spring Boot backend must be deployed separately to a server platform such as Render, Railway, Fly.io, or your own VPS.

This repo includes [netlify.toml](./netlify.toml) so client-side routes like `/auth/login` and `/app/dashboard` resolve correctly after deployment.

### Netlify build settings

- Build command: `npm run build`
- Publish directory: `dist`

### Netlify environment variable

Set this in the Netlify dashboard:

```bash
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

Do not leave it as `/api` in production unless you are proxying `/api` to your backend yourself.

### Backend production setting

Your backend must allow the Netlify frontend origin through CORS. Set the backend `FRONTEND_ORIGIN` environment variable to your Netlify site URL, for example:

```bash
FRONTEND_ORIGIN=https://your-site-name.netlify.app
```

If you use a custom domain, use that domain instead.

### Cross-site auth cookies

If your frontend is on Netlify and your backend is on another domain, configure the backend cookies for cross-site use:

```bash
COOKIE_SECURE=true
COOKIE_SAME_SITE=None
```

This requires the backend to be served over HTTPS.

## Fastest backend host: Railway

If you do not have a backend host yet, Railway is the fastest option for this Spring Boot backend.

Railway has official guides for:

- deploying Spring Boot apps
- deploying monorepos with a service root directory

For this repo:

1. Create a Railway project.
2. Connect this GitHub repo: `vellaturinithisha/Phone-Number-Tracking-`
3. For the backend service, set the Root Directory to:

```bash
/backend
```

4. Deploy the service and generate a public domain.
5. Add these backend environment variables in Railway:

```bash
FRONTEND_ORIGIN=https://6a197b92c5051e1dac470a8e--monumental-cocada-2d12f0.netlify.app
COOKIE_SECURE=true
COOKIE_SAME_SITE=None
JWT_SECRET=replace-with-a-long-random-secret
DB_URL=jdbc:postgresql://YOUR_RAILWAY_POSTGRES_HOST:YOUR_PORT/YOUR_DB
DB_USERNAME=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
DB_DRIVER=org.postgresql.Driver
```

6. In Netlify, set:

```bash
VITE_API_BASE_URL=https://YOUR-RAILWAY-BACKEND.up.railway.app/api
```

7. Redeploy Netlify.

Important:

- Do not use the default H2 file database in production unless you also configure persistent storage.
- For Railway production, use PostgreSQL.
