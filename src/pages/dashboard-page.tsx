import { motion } from 'framer-motion'
import { Activity, ArrowUpRight, ShieldAlert, Users } from 'lucide-react'
import { AreaChartCard } from '../components/charts/area-chart-card'
import { PieChartCard } from '../components/charts/pie-chart-card'
import { Card } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { quickActions } from '../constants/navigation'
import { useApiResource } from '../hooks/useApiResource'
import { trackingService } from '../services/tracking-service'
import { formatDateTime, formatNumber } from '../utils/format'

export function DashboardPage() {
  const { data, error, isLoading } = useApiResource(
    async () => {
      const response = await trackingService.getDashboardStats()
      return response.data
    },
    { pollMs: 60_000 },
  )

  const metrics = data === null ? [] : [
    { key: 'totalSearches', label: 'Total Searches', value: formatNumber(data.totalSearches) },
    { key: 'spamReports', label: 'Spam Reports', value: formatNumber(data.spamReports) },
    { key: 'activeUsers', label: 'Active Users', value: formatNumber(data.activeUsers) },
    { key: 'trackedRegions', label: 'Tracked Regions', value: formatNumber(data.regionStatistics.length) },
  ]

  return (
    <div className="space-y-6">
      {error ? <Card className="rounded-3xl border border-rose-400/20 bg-rose-500/10 text-sm text-rose-100">{error}</Card> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading ? Array.from({ length: 4 }).map((_, index) => <Card key={index} className="rounded-3xl"><Skeleton className="h-28 w-full" /></Card>) : metrics.map((metric, index) => (
          <motion.div key={metric.key} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
            <Card className="rounded-3xl">
              <div className="flex items-start justify-between">
                <div><p className="text-sm text-slate-400">{metric.label}</p><h3 className="mt-3 text-3xl font-semibold text-white">{metric.value}</h3><p className="mt-2 text-sm text-cyan-300">Live backend data</p></div>
                <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-300"><ArrowUpRight className="h-5 w-5" /></div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]"><AreaChartCard data={data?.searchAnalytics ?? []} isLoading={isLoading} /><PieChartCard data={data?.regionStatistics ?? []} isLoading={isLoading} /></div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-3xl">
          <div className="mb-5"><h3 className="text-lg font-semibold text-white">Quick Actions</h3><p className="text-sm text-slate-400">Access high-priority workflows</p></div>
          <div className="grid gap-4 md:grid-cols-2">
            {quickActions.map((action, index) => {
              const Icon = [Activity, ShieldAlert, Users, ArrowUpRight][index]
              return <div key={action.title} className="rounded-3xl border border-white/8 bg-slate-950/55 p-5"><div className="mb-4 inline-flex rounded-2xl bg-white/6 p-3 text-cyan-300"><Icon className="h-5 w-5" /></div><p className="font-medium text-white">{action.title}</p><p className="mt-2 text-sm leading-7 text-slate-400">{action.description}</p></div>
            })}
          </div>
        </Card>
        <Card className="rounded-3xl">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <div className="mt-6 space-y-4">
            {isLoading ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24 w-full" />) : (data?.recentActivity.length ?? 0) === 0 ? <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4 text-sm text-slate-300">Activity will appear here after users search or submit reports.</div> : data?.recentActivity.map((item) => <div key={`${item.type}-${item.occurredAt}-${item.title}`} className="rounded-2xl border border-white/8 bg-slate-950/45 p-4"><div className="flex items-center justify-between gap-3"><p className="font-medium text-white">{item.title}</p><span className="text-xs text-slate-500">{formatDateTime(item.occurredAt)}</span></div><p className="mt-2 text-sm text-slate-400">{item.description}</p></div>)}
          </div>
        </Card>
      </div>
    </div>
  )
}
