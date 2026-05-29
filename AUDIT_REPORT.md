# TrackSecure Audit Report

## Executive Summary

The original workspace was a frontend-only Vite application with no backend project, no database layer, no route protection, and multiple UI surfaces hardwired to mock datasets. Forms rendered but did not submit, auth state was faked in Zustand, and dashboard/tracking/history/reporting screens displayed static content regardless of user actions.

This remediation introduced a real Spring Boot backend in [`backend`](backend), connected the React frontend to live API endpoints, replaced dummy state with authenticated session bootstrapping, and verified build/test coverage plus local API smoke flows.

## Root Causes

### 1. Missing backend application
- Root cause:
  There was no Spring Boot project, no controllers, no service layer, no repositories, and no database configuration anywhere in the workspace.
- Affected files:
  Entire original workspace.
- Fix:
  Added a full backend in [`backend`](backend) with auth, tracking, history, spam reports, dashboard stats, H2 local persistence, and PostgreSQL-ready configuration.

### 2. Fake authentication state
- Root cause:
  [`src/store/auth-store.ts`](src/store/auth-store.ts) initialized with a hardcoded user, hardcoded token, and `isAuthenticated: true`.
- Affected files:
  [`src/store/auth-store.ts`](src/store/auth-store.ts), [`src/routes/AppRouter.tsx`](src/routes/AppRouter.tsx), [`src/components/dashboard/topbar.tsx`](src/components/dashboard/topbar.tsx)
- Fix:
  Replaced demo auth state with session bootstrap, protected routes, logout handling, and real user/session storage driven by backend auth endpoints.

### 3. Non-functional login and registration
- Root cause:
  Login/register forms had validation hooks but no submit handlers, no API calls, no loading states, and no error mapping.
- Affected files:
  [`src/pages/auth/login-page.tsx`](src/pages/auth/login-page.tsx), [`src/pages/auth/register-page.tsx`](src/pages/auth/register-page.tsx), [`src/hooks/useAuthForm.ts`](src/hooks/useAuthForm.ts)
- Fix:
  Added real submit flows, backend integration, field-level validation, toasts, and navigation outcomes.

### 4. Mock-driven dashboard, tracking, history, and spam reporting
- Root cause:
  Screens imported fabricated data from `mock-data.ts` and static constants instead of loading from APIs.
- Affected files:
  [`src/pages/dashboard-page.tsx`](src/pages/dashboard-page.tsx), [`src/pages/track-number-page.tsx`](src/pages/track-number-page.tsx), [`src/pages/search-history-page.tsx`](src/pages/search-history-page.tsx), [`src/pages/spam-reports-page.tsx`](src/pages/spam-reports-page.tsx), [`src/components/charts/area-chart-card.tsx`](src/components/charts/area-chart-card.tsx), [`src/components/charts/pie-chart-card.tsx`](src/components/charts/pie-chart-card.tsx), [`src/components/tables/history-table.tsx`](src/components/tables/history-table.tsx), deleted [`src/constants/mock-data.ts`](src/constants/mock-data.ts)
- Fix:
  Replaced all business data views with live API-backed loading states, empty states, and persistence-aware rendering.

### 5. Incomplete HTTP client behavior
- Root cause:
  Axios only attached a bearer token from demo Zustand state and had no response interceptor, refresh handling, or normalized API errors.
- Affected files:
  [`src/services/http.ts`](src/services/http.ts), [`src/services/auth-service.ts`](src/services/auth-service.ts), [`src/services/tracking-service.ts`](src/services/tracking-service.ts)
- Fix:
  Added credentialed Axios clients, CSRF header injection, refresh-on-401 handling, normalized error parsing, and session refresh utilities.

### 6. No persistence for user actions
- Root cause:
  Searches and spam reports were never written to a backend or database because no backend existed.
- Affected files:
  Entire original workspace.
- Fix:
  Added `users`, `search_history`, `spam_reports`, and `refresh_tokens` persistence through JPA entities and repositories.

### 7. Missing security controls
- Root cause:
  No JWT issuance, no password hashing, no route protection, no CSRF handling, and no rate limiting were implemented.
- Affected files:
  Entire original workspace.
- Fix:
  Added JWT access cookies, refresh-token rotation, BCrypt hashing, protected routes, CSRF token endpoint/cookies, CORS config, and a rate-limit filter.

### 8. Missing environment configuration
- Root cause:
  No `.env` templates or deployable runtime configuration guidance existed.
- Affected files:
  Original root and backend config.
- Fix:
  Added [`.env.example`](.env.example) and [`backend/.env.example`](backend/.env.example), plus runtime properties in [`backend/src/main/resources/application.properties`](backend/src/main/resources/application.properties).

## Implemented API Surface

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/profile`
- `GET /api/auth/csrf-token`
- `GET /api/track-number`
- `POST /api/report-spam`
- `GET /api/search-history`
- `GET /api/dashboard/stats`

## Verification Summary

- Frontend:
  `npm.cmd run build` passes with TypeScript strict mode enabled.
- Backend:
  `.\mvnw.cmd -q -DskipTests package` passes.
  `.\mvnw.cmd test` passes.
- Runtime smoke:
  Local API verification confirmed successful registration, login, profile access, tracking, search-history persistence, dashboard stats retrieval, and successful spam-report submission in isolated smoke requests against the running backend.

## Residual Notes

- Password reset remains intentionally out of scope for the current API contract and is now presented honestly in the UI instead of as a fake working flow.
- Local development uses file-backed H2 by default for immediate persistence; production deployment should override the datasource settings with PostgreSQL values from [`backend/.env.example`](backend/.env.example).
