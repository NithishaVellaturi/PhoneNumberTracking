import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { MarketingLayout } from '../layouts/marketing-layout'
import { Skeleton } from '../components/ui/skeleton'

const LandingPage = lazy(() => import('../pages/landing-page').then((module) => ({ default: module.LandingPage })))
const LookupPage = lazy(() => import('../pages/lookup-page').then((module) => ({ default: module.LookupPage })))
const DashboardPage = lazy(() => import('../pages/dashboard-page').then((module) => ({ default: module.DashboardPage })))
const CurrentLocationPage = lazy(() => import('../pages/current-location-page').then((module) => ({ default: module.CurrentLocationPage })))

function RouteFallback() {
  return <div className="mx-auto max-w-7xl space-y-4 px-4 py-12 md:px-6 lg:px-8"><Skeleton className="h-14 w-1/3" /><Skeleton className="h-72 w-full" /><Skeleton className="h-52 w-full" /></div>
}

export function AppRouter() {
  const location = useLocation()
  return (
    <Suspense fallback={<RouteFallback />}>
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          <Routes location={location}>
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/lookup" element={<LookupPage />} />
              <Route path="/current-location" element={<CurrentLocationPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Suspense>
  )
}
