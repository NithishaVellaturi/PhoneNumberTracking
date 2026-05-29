import type { DailyAnalyticsPoint } from '../../types/api'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

interface AreaChartCardProps {
  data: DailyAnalyticsPoint[]
  isLoading?: boolean
}

export function AreaChartCard({ data, isLoading = false }: AreaChartCardProps) {
  if (isLoading) {
    return <Card className="h-[360px]"><Skeleton className="h-full w-full" /></Card>
  }

  return (
    <Card className="h-[360px]">
      <div className="mb-6"><h3 className="text-lg font-semibold text-white">Search Trends</h3><p className="text-sm text-slate-400">Phone lookups vs spam detections this week</p></div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="searches" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.65} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient>
            <linearGradient id="spam" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22D3EE" stopOpacity={0.55} /><stop offset="95%" stopColor="#22D3EE" stopOpacity={0} /></linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
          <XAxis dataKey="day" stroke="#94A3B8" />
          <YAxis stroke="#94A3B8" />
          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
          <Area type="monotone" dataKey="searches" stroke="#3B82F6" fill="url(#searches)" strokeWidth={3} />
          <Area type="monotone" dataKey="spamReports" stroke="#22D3EE" fill="url(#spam)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
