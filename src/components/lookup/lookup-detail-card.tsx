import type { LucideIcon } from 'lucide-react'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

interface LookupDetailItem {
  label: string
  value: string
  icon: LucideIcon
}

interface LookupDetailCardProps {
  title: string
  subtitle: string
  items: LookupDetailItem[]
  isLoading?: boolean
}

export function LookupDetailCard({ title, subtitle, items, isLoading = false }: LookupDetailCardProps) {
  return (
    <Card className="rounded-[32px]">
      <div>
        <h3 className="text-2xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-slate-400">{subtitle}</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 w-full" />)
          : items.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-3xl border border-white/8 bg-slate-950/45 p-5">
              <div className="mb-4 inline-flex rounded-2xl bg-sky-500/10 p-3 text-sky-300">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-2 text-base font-medium text-white">{value}</p>
            </div>
          ))}
      </div>
    </Card>
  )
}
