import { ShieldCheck, ShieldQuestion, ShieldX } from 'lucide-react'
import type { PhoneLookupResult } from '../../types/api'
import { formatLookupStatus, getStatusTone } from '../../utils/format'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

interface LookupStatusCardProps {
  result: PhoneLookupResult | null
  isLoading?: boolean
}

export function LookupStatusCard({ result, isLoading = false }: LookupStatusCardProps) {
  if (isLoading) {
    return <Card className="rounded-[32px]"><Skeleton className="h-56 w-full" /></Card>
  }

  const icon = result?.status === 'VALID'
    ? ShieldCheck
    : result?.status === 'UNKNOWN'
      ? ShieldQuestion
      : ShieldX
  const Icon = icon

  return (
    <Card className="rounded-[32px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/80">Phone Status Card</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            {result ? formatLookupStatus(result.status) : 'Awaiting search'}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
            {result
              ? result.status === 'VALID'
                ? 'Number format verified successfully.'
                : result.status === 'UNKNOWN'
                  ? 'Unable to verify the number with full confidence from available metadata.'
                  : 'Invalid number format or country-code combination.'
              : 'Run a lookup to validate the number, inspect the numbering plan, and review risk intelligence.'}
          </p>
        </div>
        <div className="blue-ring inline-flex rounded-3xl bg-cyan-500/10 p-4 text-cyan-200">
          <Icon className="h-8 w-8" />
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Badge label={result ? formatLookupStatus(result.status) : 'Waiting for search'} tone={result ? getStatusTone(result.status) : 'info'} />
        {result ? <Badge label={result.valid ? 'Number validity confirmed' : 'Verification incomplete'} tone={result.valid ? 'low' : 'medium'} /> : null}
      </div>
      <div className="mt-6 rounded-3xl border border-cyan-400/10 bg-cyan-500/10 p-5 text-sm leading-7 text-cyan-100">
        TrackSecure does not claim live device status, WhatsApp status, exact GPS coordinates, last-seen information, or device activity. Location is estimated from legitimate numbering and carrier intelligence only.
      </div>
    </Card>
  )
}
