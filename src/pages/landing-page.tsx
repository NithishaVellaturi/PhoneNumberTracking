import { motion } from 'framer-motion'
import { ArrowRight, ChartNoAxesCombined, Shield, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SearchBar } from '../components/common/search-bar'
import { Card } from '../components/ui/card'
import { SectionHeading } from '../components/ui/section-heading'
import { useAuthStore } from '../store/auth-store'

export function LandingPage() {
  const navigate = useNavigate()
  const authStatus = useAuthStore((state) => state.status)
  const [countryCode, setCountryCode] = useState('US')
  const [phoneNumber, setPhoneNumber] = useState('')

  const handleSearch = () => {
    if (authStatus === 'authenticated') {
      navigate(`/app/track?country=${countryCode}&phone=${encodeURIComponent(phoneNumber)}`)
      return
    }

    navigate('/auth/login', { replace: false })
  }

  return (
    <div>
      <section className="hero-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.18),_transparent_20%),radial-gradient(circle_at_top_left,_rgba(37,99,235,0.2),_transparent_26%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-20 md:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">Real-time phone intelligence for modern risk teams</div>
            <div className="space-y-6">
              <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-white md:text-6xl">Track numbers, uncover <span className="text-gradient">fraud signals</span>, and act faster.</h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">TrackSecure now routes its dashboard, search history, spam reporting, and lookup flows through a live backend instead of placeholder data.</p>
            </div>
            <SearchBar countryCode={countryCode} phoneNumber={phoneNumber} onCountryCodeChange={setCountryCode} onPhoneNumberChange={setPhoneNumber} onSubmit={handleSearch} submitLabel={authStatus === 'authenticated' ? 'Open tracking' : 'Sign in to track'} />
            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-cyan-300" />JWT-backed sessions</div>
              <div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-cyan-300" />Live number lookups</div>
              <div className="flex items-center gap-2"><ChartNoAxesCombined className="h-4 w-4 text-cyan-300" />Database-driven analytics</div>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel relative rounded-[32px] p-6">
            <div className="absolute -right-8 top-10 h-28 w-28 rounded-full bg-cyan-400/25 blur-3xl" />
            <div className="absolute -left-8 bottom-10 h-32 w-32 rounded-full bg-blue-500/25 blur-3xl" />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between"><p className="text-sm text-slate-300">Operational Snapshot</p><span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-300">Live backend ready</span></div>
              <Card className="rounded-3xl bg-slate-950/55">
                <p className="text-sm text-slate-400">What changed</p>
                <div className="mt-4 grid gap-4 text-sm">
                  <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4 text-slate-200">Authentication uses real API endpoints with secure cookie sessions and automatic refresh handling.</div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4 text-slate-200">Tracking requests persist search history and power live dashboard widgets from the database.</div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4 text-slate-200">Spam reports are stored server-side and immediately influence risk scoring and analytics.</div>
                </div>
              </Card>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ['Secure sessions', 'JWT + refresh cookies'],
                  ['Live persistence', 'Users, searches, reports'],
                  ['Dashboard data', 'Charts from API responses'],
                ].map(([title, value]) => <Card key={title} className="rounded-3xl bg-slate-950/55 p-5"><p className="text-sm text-slate-400">{title}</p><p className="mt-3 text-lg font-semibold text-white">{value}</p></Card>)}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl space-y-10 px-4 py-20 md:px-6 lg:px-8">
        <SectionHeading eyebrow="Capabilities" title="Built for secure phone intelligence operations" description="TrackSecure combines fast number verification, fraud analysis, and dashboard-ready analytics with a real backend and persistent storage." />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['Carrier Lookup', 'Validated phone parsing, region mapping, and carrier resolution through the backend lookup engine.'],
            ['Spam Analytics', 'Community reports directly update risk scoring and dashboard metrics.'],
            ['Search History', 'Authenticated searches are persisted and exportable as CSV from the UI.'],
            ['Role-ready Dashboard', 'Operational metrics, trends, and region distribution load from live API data.'],
          ].map(([title, description]) => <Card key={title} className="rounded-3xl"><h3 className="text-lg font-semibold text-white">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-300">{description}</p></Card>)}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ['Audit completed', 'Legacy placeholder authentication and static dashboard values were removed across the application.'],
            ['Persistence restored', 'User registration, search history, and spam report flows now write to the backend database layer.'],
            ['Production-minded security', 'Cookie-based JWT sessions, CSRF protection, CORS, rate limiting, and BCrypt are wired into the stack.'],
          ].map(([title, description]) => (
            <Card key={title} className="rounded-3xl">
              <p className="text-lg font-semibold text-white">{title}</p>
              <p className="mt-4 text-sm leading-7 text-slate-300">{description}</p>
            </Card>
          ))}
        </div>
        <div className="mt-10 flex justify-center"><Link to="/app/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300">Explore the dashboard <ArrowRight className="h-4 w-4" /></Link></div>
      </section>
    </div>
  )
}
