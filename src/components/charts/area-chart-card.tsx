import type { DailyAnalyticsPoint } from '../../types/api'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

interface AreaChartCardProps {
  data: DailyAnalyticsPoint[]
  isLoading?: boolean
}

export function AreaChartCard({ data, isLoading = false }: AreaChartCardProps) {
  if (isLoading) {
    return <Card className="h-[360px] rounded-[32px]"><Skeleton className="h-full w-full" /></Card>
  }

  return (
    <Card className="min-h-[360px] rounded-[32px]">
      <div className="mb-6"><h3 className="text-lg font-semibold text-white">Lookup Trends</h3><p className="text-sm text-slate-400">Real searches and flagged spam signals over the last two weeks.</p></div>
      <div className="h-[250px] min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="date" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
            <Line type="monotone" dataKey="totalSearches" stroke="#38BDF8" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="spamReports" stroke="#F97316" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
