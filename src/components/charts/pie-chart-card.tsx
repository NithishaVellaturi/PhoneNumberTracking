import type { NamedMetric } from '../../types/api'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

const COLORS = ['#2563EB', '#3B82F6', '#22D3EE', '#38BDF8']

interface PieChartCardProps {
  data: NamedMetric[]
  title?: string
  description?: string
  isLoading?: boolean
}

export function PieChartCard({
  data,
  title = 'Top Countries',
  description = 'Distribution of searches by country.',
  isLoading = false,
}: PieChartCardProps) {
  if (isLoading) {
    return <Card className="h-[360px] rounded-[32px]"><Skeleton className="h-full w-full" /></Card>
  }

  return (
    <Card className="min-h-[360px] rounded-[32px]">
      <div className="mb-6"><h3 className="text-lg font-semibold text-white">{title}</h3><p className="text-sm text-slate-400">{description}</p></div>
      <div className="h-[250px] min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={110} dataKey="value" nameKey="label" stroke="transparent">
              {data.map((entry, index) => <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
