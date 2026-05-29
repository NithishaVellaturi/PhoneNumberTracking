import { AlertOctagon, Flag, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { countryOptions, spamReasonOptions } from '../constants/tracking'
import { useApiResource } from '../hooks/useApiResource'
import { trackingService } from '../services/tracking-service'
import { toApiError } from '../services/http'
import { useAppStore } from '../store/app-store'
import { useToastStore } from '../store/toast-store'
import { formatDateTime, formatNumber, formatPercent, getRiskTone } from '../utils/format'

export function SpamReportsPage() {
  const { data, error, isLoading, reload } = useApiResource(
    async () => {
      const response = await trackingService.getDashboardStats()
      return response.data
    },
    { pollMs: 60_000 },
  )

  const pushToast = useToastStore((state) => state.pushToast)
  const setRecentResult = useAppStore((state) => state.setRecentResult)
  const [countryCode, setCountryCode] = useState('US')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [reason, setReason] = useState(spamReasonOptions[0] ?? 'Robocall')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (phoneNumber.trim().length < 6) {
      pushToast({
        tone: 'error',
        title: 'Invalid number',
        description: 'Enter a valid phone number before submitting a report.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await trackingService.reportSpam({
        phoneNumber: phoneNumber.trim(),
        countryCode,
        reason,
        notes,
      })
      setRecentResult(response.data)
      setPhoneNumber('')
      setNotes('')
      await reload()
      pushToast({
        tone: 'success',
        title: 'Spam report saved',
        description: `${response.data.phoneNumber} has been added to the report database.`,
      })
    } catch (error) {
      const apiError = toApiError(error)
      pushToast({
        tone: 'error',
        title: 'Report failed',
        description: apiError.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const analyticsCards = data === null ? [] : [
    { label: 'Spam reports', value: formatNumber(data.spamReports), Icon: AlertOctagon },
    { label: 'Active users', value: formatNumber(data.activeUsers), Icon: ShieldAlert },
    { label: 'Tracked searches', value: formatNumber(data.totalSearches), Icon: Flag },
  ]

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Card className="rounded-3xl">
        <div className="mb-6 flex items-center justify-between"><div><h2 className="text-2xl font-semibold text-white">Community Spam Reports</h2><p className="mt-2 text-sm text-slate-400">Submit suspicious callers and review the latest report activity.</p></div><Button disabled>{isSubmitting ? 'Saving...' : 'Live reporting'}</Button></div>
        <div className="grid gap-3 md:grid-cols-[180px_1fr]">
          <select value={countryCode} onChange={(event) => setCountryCode(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none">
            {countryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <Input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="Phone number" />
          <select value={reason} onChange={(event) => setReason(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none md:col-span-2">
            {spamReasonOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder="Investigation notes (optional)" className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10 md:col-span-2" />
          <Button className="md:col-span-2" onClick={() => { void handleSubmit() }} disabled={isSubmitting}>{isSubmitting ? 'Submitting report...' : 'Submit spam report'}</Button>
        </div>
        {error ? <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}
        <div className="mt-8 space-y-4">
          {isLoading ? <div className="rounded-3xl border border-white/8 bg-slate-950/50 p-5 text-sm text-slate-300">Loading recent reports...</div> : (data?.recentReports.length ?? 0) === 0 ? <div className="rounded-3xl border border-white/8 bg-slate-950/50 p-5 text-sm text-slate-300">No spam reports have been filed yet.</div> : data?.recentReports.map((report) => <div key={`${report.phoneNumber}-${report.lastReportedAt}`} className="rounded-3xl border border-white/8 bg-slate-950/50 p-5"><div className="flex items-center justify-between gap-4"><div><p className="text-lg font-medium text-white">{report.phoneNumber}</p><p className="mt-2 text-sm text-slate-400">{report.mostRecentReason}</p><p className="mt-2 text-xs text-slate-500">{formatDateTime(report.lastReportedAt)}</p></div><div className="flex flex-col items-end gap-2"><Badge label={formatPercent(report.spamScore)} tone={getRiskTone(report.riskLevel)} /><span className="rounded-2xl bg-rose-500/10 px-4 py-2 text-sm text-rose-200">{report.reportCount} reports</span></div></div></div>)}
        </div>
      </Card>
      <Card className="rounded-3xl">
        <h3 className="text-lg font-semibold text-white">Fraud Analytics</h3>
        <div className="mt-6 grid gap-4">
          {isLoading ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="rounded-3xl border border-white/8 bg-slate-950/50 p-5 text-sm text-slate-300">Loading analytics...</div>) : analyticsCards.map(({ label, value, Icon }) => <div key={label} className="rounded-3xl border border-white/8 bg-slate-950/50 p-5"><div className="mb-3 inline-flex rounded-2xl bg-white/6 p-3 text-cyan-300"><Icon className="h-5 w-5" /></div><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-3xl font-semibold text-white">{value}</p></div>)}
        </div>
      </Card>
    </div>
  )
}
