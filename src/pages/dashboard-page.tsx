import { Activity, AlertTriangle, Globe2, RadioTower } from 'lucide-react'
import { AreaChartCard } from '../components/charts/area-chart-card'
import { BarChartCard } from '../components/charts/bar-chart-card'
import { PieChartCard } from '../components/charts/pie-chart-card'
import { MetricCard } from '../components/dashboard/metric-card'
import { Badge } from '../components/ui/badge'
import { Card } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { useDashboardStatsQuery, useDashboardTrendsQuery } from '../hooks/use-tracksecure-queries'
import { formatDateTime, formatLookupStatus, formatNumber, formatPercent, formatRiskLabel, getRiskTone, getStatusTone } from '../utils/format'

export function DashboardPage() {
  const statsQuery = useDashboardStatsQuery()
  const trendsQuery = useDashboardTrendsQuery()

  const stats = statsQuery.data
  const trends = trendsQuery.data
  const isLoading = statsQuery.isLoading || trendsQuery.isLoading
  const error = statsQuery.error ?? trendsQuery.error

  return (
    <div className="section-shell space-y-8 py-12">
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-200">
          Analytics Dashboard
        </div>
        <h1 className="text-4xl font-semibold text-white md:text-5xl">Real lookup analytics, carrier concentration, and risk trends</h1>
        <p className="text-base leading-8 text-slate-300 md:text-lg">
          Every chart and widget below is powered by live database data from TrackSecure lookup activity. No demo users, no static JSON, and no placeholder metrics.
        </p>
      </div>

      {error ? (
        <Card className="rounded-[32px] border border-rose-400/20 bg-rose-500/10 text-sm text-rose-100">
          {error instanceof Error ? error.message : 'Dashboard data could not be loaded.'}
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Searches" value={formatNumber(stats?.totalSearches ?? 0)} supporting="All-time public lookups" icon={Globe2} isLoading={isLoading} />
        <MetricCard label="Searches Today" value={formatNumber(stats?.searchesToday ?? 0)} supporting="Realtime platform activity" icon={Activity} isLoading={isLoading} />
        <MetricCard label="Spam Reports" value={formatNumber(stats?.spamReports ?? 0)} supporting="High-risk lookups logged into analytics" icon={AlertTriangle} isLoading={isLoading} />
        <MetricCard label="Valid Lookups" value={formatNumber(stats?.validLookups ?? 0)} supporting="Verified numbering-plan matches" icon={RadioTower} isLoading={isLoading} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <AreaChartCard data={trends?.lookupTrends ?? []} isLoading={isLoading} />
        <PieChartCard data={stats?.topCountries ?? []} title="Top Countries" description="Search volume by detected country." isLoading={isLoading} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <BarChartCard data={trends?.topCarriers ?? []} title="Top Carriers" description="Most frequently observed telecom operators." isLoading={isLoading} />
        <BarChartCard data={trends?.riskDistribution ?? []} title="Risk Distribution" description="Low, medium, and high-risk lookup mix." isLoading={isLoading} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[32px]">
          <div>
            <h3 className="text-2xl font-semibold text-white">Line Type Distribution</h3>
            <p className="mt-2 text-sm leading-7 text-slate-400">Live breakdown of line types observed across persisted lookups.</p>
          </div>
          <div className="mt-6 space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-18 w-full" />)
            ) : (
              (trends?.lineTypeDistribution ?? []).map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/8 bg-slate-950/45 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-sm text-slate-400">{formatNumber(item.value)} recorded lookups</p>
                    </div>
                    <Badge label={`${item.value}`} tone="info" />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="rounded-[32px]">
          <div>
            <h3 className="text-2xl font-semibold text-white">Recent Lookups</h3>
            <p className="mt-2 text-sm leading-7 text-slate-400">Most recent phone intelligence requests recorded by the backend.</p>
          </div>
          <div className="mt-6 space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-24 w-full" />)
            ) : (
              (trends?.recentLookups ?? []).map((lookup) => (
                <div key={`${lookup.phoneNumber}-${lookup.searchedAt}`} className="rounded-3xl border border-white/8 bg-slate-950/45 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{lookup.phoneNumber}</p>
                      <p className="mt-1 text-sm text-slate-400">{lookup.region}, {lookup.country}</p>
                    </div>
                    <div className="text-sm text-slate-400">{formatDateTime(lookup.searchedAt)}</div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge label={formatLookupStatus(lookup.status)} tone={getStatusTone(lookup.status)} />
                    <Badge label={formatRiskLabel(lookup.riskLevel)} tone={getRiskTone(lookup.riskLevel)} />
                    <Badge label={`Spam ${formatPercent(lookup.spamScore)}`} tone={getRiskTone(lookup.spamScore)} />
                  </div>
                  <p className="mt-4 text-sm text-slate-300">{lookup.carrier} • {lookup.lineType}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
