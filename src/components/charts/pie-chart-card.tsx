import type { RegionStatistic } from '../../types/api'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

const COLORS = ['#2563EB', '#3B82F6', '#22D3EE', '#38BDF8']

interface PieChartCardProps {
  data: RegionStatistic[]
  isLoading?: boolean
}

export function PieChartCard({ data, isLoading = false }: PieChartCardProps) {
  if (isLoading) {
    return <Card className="h-[360px]"><Skeleton className="h-full w-full" /></Card>
  }

  return (
    <Card className="h-[360px]">
      <div className="mb-6"><h3 className="text-lg font-semibold text-white">Region Distribution</h3><p className="text-sm text-slate-400">Search intensity by geography</p></div>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={110} dataKey="count" nameKey="region" stroke="transparent">
            {data.map((entry, index) => <Cell key={entry.region} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
