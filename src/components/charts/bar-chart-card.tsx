import type { NamedMetric } from '../../types/api'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

interface BarChartCardProps {
  data: NamedMetric[]
  title: string
  description: string
  isLoading?: boolean
}

export function BarChartCard({ data, title, description, isLoading = false }: BarChartCardProps) {
  if (isLoading) {
    return <Card className="h-[360px] rounded-[32px]"><Skeleton className="h-full w-full" /></Card>
  }

  return (
    <Card className="min-h-[360px] rounded-[32px]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <div className="h-[250px] min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="label" stroke="#94A3B8" interval={0} angle={-12} textAnchor="end" height={70} />
            <YAxis stroke="#94A3B8" />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
            <Bar dataKey="value" fill="#0EA5E9" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
