import type { LookupHistoryItem } from '../../types/api'
import { formatDateTime, formatPercent, formatRiskLabel, formatLookupStatus, getRiskTone, getStatusTone } from '../../utils/format'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

interface LookupHistoryCardProps {
  history: LookupHistoryItem[]
  isLoading?: boolean
}

export function LookupHistoryCard({ history, isLoading = false }: LookupHistoryCardProps) {
  return (
    <Card className="rounded-[32px]">
      <div>
        <h3 className="text-2xl font-semibold text-white">Lookup History</h3>
        <p className="mt-2 text-sm leading-7 text-slate-400">Recent database-backed lookups for this number.</p>
      </div>
      <div className="mt-6 space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-24 w-full" />)
        ) : history.length === 0 ? (
          <div className="rounded-3xl border border-white/8 bg-slate-950/45 p-5 text-sm leading-7 text-slate-300">
            The first successful lookup for this number will create a persistent history trail here.
          </div>
        ) : history.map((item) => (
          <div key={`${item.phoneNumber}-${item.searchedAt}`} className="rounded-3xl border border-white/8 bg-slate-950/45 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{item.phoneNumber}</p>
                <p className="mt-1 text-sm text-slate-400">{item.region}, {item.country}</p>
              </div>
              <div className="text-sm text-slate-400">{formatDateTime(item.searchedAt)}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge label={formatLookupStatus(item.status)} tone={getStatusTone(item.status)} />
              <Badge label={formatRiskLabel(item.riskLevel)} tone={getRiskTone(item.riskLevel)} />
              <Badge label={`Spam ${formatPercent(item.spamScore)}`} tone={getRiskTone(item.spamScore)} />
            </div>
            <p className="mt-4 text-sm text-slate-300">{item.carrier} • {item.lineType}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
