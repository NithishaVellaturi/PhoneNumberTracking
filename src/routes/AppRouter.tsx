import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { DashboardLayout } from '../layouts/dashboard-layout'
import { AuthLayout } from '../layouts/auth-layout'
import { MarketingLayout } from '../layouts/marketing-layout'
import { Skeleton } from '../components/ui/skeleton'
import { useAuthStore } from '../store/auth-store'

const LandingPage = lazy(() => import('../pages/landing-page').then((module) => ({ default: module.LandingPage })))
const LoginPage = lazy(() => import('../pages/auth/login-page').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('../pages/auth/register-page').then((module) => ({ default: module.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('../pages/auth/forgot-password-page').then((module) => ({ default: module.ForgotPasswordPage })))
const DashboardPage = lazy(() => import('../pages/dashboard-page').then((module) => ({ default: module.DashboardPage })))
const TrackNumberPage = lazy(() => import('../pages/track-number-page').then((module) => ({ default: module.TrackNumberPage })))
const SpamReportsPage = lazy(() => import('../pages/spam-reports-page').then((module) => ({ default: module.SpamReportsPage })))
const SearchHistoryPage = lazy(() => import('../pages/search-history-page').then((module) => ({ default: module.SearchHistoryPage })))
const SettingsPage = lazy(() => import('../pages/settings-page').then((module) => ({ default: module.SettingsPage })))

function RouteFallback() {
  return <div className="space-y-4 p-6"><Skeleton className="h-14 w-1/3" /><Skeleton className="h-64 w-full" /><Skeleton className="h-40 w-full" /></div>
}

function ProtectedLayout({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status)

  if (status === 'loading') {
    return <RouteFallback />
  }

  if (status !== 'authenticated') {
    return <Navigate to="/auth/login" replace />
  }

  return <>{children}</>
}

function GuestLayout({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status)

  if (status === 'loading') {
    return <RouteFallback />
  }

  if (status === 'authenticated') {
    return <Navigate to="/app/dashboard" replace />
  }

  return <>{children}</>
}

export function AppRouter() {
  const location = useLocation()
  return (
    <Suspense fallback={<RouteFallback />}>
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          <Routes location={location}>
            <Route element={<MarketingLayout />}><Route path="/" element={<LandingPage />} /></Route>
            <Route path="/auth" element={<GuestLayout><AuthLayout /></GuestLayout>}><Route path="login" element={<LoginPage />} /><Route path="register" element={<RegisterPage />} /><Route path="forgot-password" element={<ForgotPasswordPage />} /></Route>
            <Route path="/app" element={<ProtectedLayout><DashboardLayout /></ProtectedLayout>}><Route path="dashboard" element={<DashboardPage />} /><Route path="track" element={<TrackNumberPage />} /><Route path="spam-reports" element={<SpamReportsPage />} /><Route path="history" element={<SearchHistoryPage />} /><Route path="settings" element={<SettingsPage />} /></Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Suspense>
  )
}
