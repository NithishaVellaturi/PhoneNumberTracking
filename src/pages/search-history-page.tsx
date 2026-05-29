import { Download } from 'lucide-react'
import { HistoryTable } from '../components/tables/history-table'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { useApiResource } from '../hooks/useApiResource'
import { trackingService } from '../services/tracking-service'

export function SearchHistoryPage() {
  const { data, error, isLoading } = useApiResource(
    async () => {
      const response = await trackingService.getSearchHistory()
      return response.data
    },
    { pollMs: 60_000 },
  )

  const exportHistory = () => {
    if (data === null || data.length === 0) {
      return
    }

    const headers = ['id', 'phoneNumber', 'countryCode', 'countryName', 'savedNumber', 'savedCallerName', 'businessCallerName', 'operator', 'region', 'lineType', 'spamScore', 'reportCount', 'riskLevel', 'lastChecked']
    const csvRows = [
      headers.join(','),
      ...data.map((row) => headers.map((header) => JSON.stringify(row[header as keyof typeof row] ?? '')).join(',')),
    ]
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'tracksecure-search-history.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h2 className="text-2xl font-semibold text-white">Search History</h2><p className="mt-2 text-sm text-slate-400">Your saved track events now come directly from the database.</p></div><div className="flex gap-3"><Button onClick={exportHistory} disabled={isLoading || (data?.length ?? 0) === 0}><Download className="mr-2 h-4 w-4" />Export CSV</Button></div></div>{error ? <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}</Card>
      <HistoryTable rows={data ?? []} isLoading={isLoading} />
    </div>
  )
}
