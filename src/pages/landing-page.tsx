import { motion } from 'framer-motion'
import { ArrowRight, Globe2, LocateFixed, MapPinned, ShieldCheck, Sparkles, Waves } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SearchBar } from '../components/common/search-bar'
import { MetricCard } from '../components/dashboard/metric-card'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { useDashboardStatsQuery } from '../hooks/use-tracksecure-queries'
import { formatNumber, formatPercent } from '../utils/format'

export function LandingPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useDashboardStatsQuery()
  const [countryCode, setCountryCode] = useState('US')
  const [phoneNumber, setPhoneNumber] = useState('')

  const handleSubmit = () => {
    navigate(`/lookup?number=${encodeURIComponent(phoneNumber)}&countryCode=${encodeURIComponent(countryCode)}`)
  }

  return (
    <div>
      <section className="hero-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_18%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_24%)]" />
        <div className="section-shell relative grid gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-cyan-200">
              Enterprise Phone Intelligence
            </div>
            <div className="space-y-6">
              <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-white md:text-6xl">
                Track <span className="text-gradient">Phone Number Intelligence</span>
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-300">
                Instantly analyze phone numbers, carrier details, estimated regions, spam risk, and phone intelligence data.
              </p>
            </div>
            <SearchBar
              countryCode={countryCode}
              phoneNumber={phoneNumber}
              onCountryCodeChange={setCountryCode}
              onPhoneNumberChange={setPhoneNumber}
              onSubmit={handleSubmit}
              submitLabel="Track Number"
              helperText="Open access by design. No login, registration, JWT, or protected routes stand between your users and the intelligence workflow."
            />
            <div className="flex flex-wrap gap-3">
              <Link to="/current-location">
                <Button variant="secondary"><LocateFixed className="mr-2 h-4 w-4" />Show My Current Location</Button>
              </Link>
              <Link to="/lookup">
                <Button variant="ghost">Open number lookup</Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-300" />Real phone metadata</div>
              <div className="flex items-center gap-2"><MapPinned className="h-4 w-4 text-cyan-300" />Estimated region mapping</div>
              <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-cyan-300" />Database-driven analytics</div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-[34px] p-6">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/80">Platform Snapshot</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Instant public intelligence workflow</h2>
                </div>
                <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
                  <Waves className="h-5 w-5" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard label="Total Searches" value={isLoading ? '...' : formatNumber(data?.totalSearches ?? 0)} supporting="All-time database lookups" icon={Globe2} isLoading={isLoading} />
                <MetricCard label="Searches Today" value={isLoading ? '...' : formatNumber(data?.searchesToday ?? 0)} supporting="New intelligence requests today" icon={Sparkles} isLoading={isLoading} />
              </div>
              <Card className="rounded-[28px] bg-slate-950/50">
                <p className="text-sm text-slate-400">What the platform shows</p>
                <div className="mt-4 grid gap-3 text-sm text-slate-200">
                  <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4">Carrier details, country flag, line type, timezone, and estimated location context.</div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4">Spam risk scoring and lookup history powered by real backend persistence.</div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4">Analytics dashboard with trend, top-country, and top-carrier charts from live data.</div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-shell py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-44 w-full rounded-[32px]" />)
          ) : (
            <>
              <MetricCard label="Spam Signals" value={formatNumber(data?.spamReports ?? 0)} supporting="High-risk lookups captured in analytics" icon={ShieldCheck} />
              <MetricCard label="Valid Lookups" value={formatNumber(data?.validLookups ?? 0)} supporting="Verified numbering-plan matches" icon={Sparkles} />
              <MetricCard label="Average Spam Score" value={formatPercent(data?.averageSpamScore ?? 0)} supporting="Current average risk intensity" icon={MapPinned} />
            </>
          )}
        </div>
      </section>

      <section className="section-shell pb-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            ['Phone Intelligence Module', 'Validate country code, number length, and number format before surfacing carrier, line type, timezone, and estimated location intelligence.'],
            ['Interactive Map', 'Render the estimated region on OpenStreetMap with a clear disclaimer that exact live device location is not available.'],
            ['Analytics Dashboard', 'Explore lookup trends, top countries, top carriers, and risk distributions with responsive chart cards.'],
          ].map(([title, description]) => (
            <Card key={title} className="rounded-[32px]">
              <h3 className="text-2xl font-semibold text-white">{title}</h3>
              <p className="mt-4 text-sm leading-8 text-slate-300">{description}</p>
            </Card>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link to="/lookup" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
            Open the tracking workflow <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300">
            Review the analytics dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
