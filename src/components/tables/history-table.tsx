import type { SearchHistoryItem } from '../../types/api'
import { getRiskTone } from '../../utils/format'
import { formatDateTime } from '../../utils/format'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

interface HistoryTableProps {
  rows: SearchHistoryItem[]
  isLoading?: boolean
}

export function HistoryTable({ rows, isLoading = false }: HistoryTableProps) {
  if (isLoading) {
    return (
      <Card className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div><h3 className="text-lg font-semibold text-white">Search History</h3><p className="text-sm text-slate-400">Recent tracked phone numbers</p></div>
        <div className="flex gap-2 text-xs text-slate-400"><span className="rounded-full border border-white/10 px-3 py-1">Live data</span><span className="rounded-full border border-white/10 px-3 py-1">{rows.length} rows</span></div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/4 text-slate-400"><tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Number</th><th className="px-6 py-4">Caller</th><th className="px-6 py-4">Location</th><th className="px-6 py-4">Risk</th><th className="px-6 py-4">Date</th></tr></thead>
          <tbody>
            {rows.length === 0 ? (
              <tr className="border-t border-white/6 text-slate-300">
                <td colSpan={6} className="px-6 py-8 text-center">No searches yet. Track a number to build your history.</td>
              </tr>
            ) : rows.map((row) => (
              <tr key={row.id} className="border-t border-white/6 text-slate-200">
                <td className="px-6 py-4">{row.id.slice(0, 8)}</td><td className="px-6 py-4">{row.phoneNumber}</td><td className="px-6 py-4"><div>{row.savedCallerName || row.businessCallerName || (row.savedNumber ? 'Saved to workspace' : row.operator)}</div><div className="mt-1 text-xs text-slate-400">{row.savedCallerName ? 'Saved by your team' : row.businessCallerName ? 'Verified public business name' : row.savedNumber ? 'Saved number without custom name' : 'Carrier information only'}</div></td><td className="px-6 py-4"><div>{row.region}</div><div className="mt-1 text-xs text-slate-400">{row.countryName || row.countryCode}</div></td><td className="px-6 py-4"><Badge label={`${row.spamScore}% spam`} tone={getRiskTone(row.riskLevel)} /></td><td className="px-6 py-4 text-slate-400">{formatDateTime(row.lastChecked)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
