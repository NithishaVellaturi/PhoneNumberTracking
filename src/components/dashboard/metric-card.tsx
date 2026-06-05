import type { LucideIcon } from 'lucide-react'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

interface MetricCardProps {
  label: string
  value: string
  supporting: string
  icon: LucideIcon
  isLoading?: boolean
}

export function MetricCard({ label, value, supporting, icon: Icon, isLoading = false }: MetricCardProps) {
  if (isLoading) {
    return <Card className="rounded-[32px]"><Skeleton className="h-28 w-full" /></Card>
  }

  return (
    <Card className="rounded-[32px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <h3 className="mt-3 text-3xl font-semibold text-white">{value}</h3>
          <p className="mt-2 text-sm text-cyan-300">{supporting}</p>
        </div>
        <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}
