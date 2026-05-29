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
