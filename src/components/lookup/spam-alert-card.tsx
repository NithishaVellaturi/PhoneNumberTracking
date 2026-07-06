import { AlertTriangle, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { PhoneLookupResult } from '../../types/api'
import { formatPercent } from '../../utils/format'
import { useToastStore } from '../../store/toast-store'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'

interface SpamAlertCardProps {
  result: PhoneLookupResult
}

function getReportKey(phoneNumber: string): string {
  return `spam_report_${phoneNumber.replace(/\s+/g, '')}`
}

function getReportCount(phoneNumber: string): number {
  try {
    return Number(localStorage.getItem(getReportKey(phoneNumber)) ?? '0')
  } catch {
    return 0
  }
}

function incrementReportCount(phoneNumber: string): number {
  const newCount = getReportCount(phoneNumber) + 1
  try {
    localStorage.setItem(getReportKey(phoneNumber), String(newCount))
  } catch {
    // localStorage may be full or disabled
  }
  return newCount
}

export function SpamAlertCard({ result }: SpamAlertCardProps) {
  const pushToast = useToastStore((state) => state.pushToast)
  const [reportCount, setReportCount] = useState(0)
  const [hasReported, setHasReported] = useState(false)

  useEffect(() => {
    setReportCount(getReportCount(result.number))
    setHasReported(false)
  }, [result.number])

  // Only show when spam score >= 60
  if (result.spamScore < 60) {
    return null
  }

  const handleReport = () => {
    if (hasReported) return
    const newCount = incrementReportCount(result.number)
    setReportCount(newCount)
    setHasReported(true)
    pushToast({
      tone: 'success',
      title: 'Spam Reported',
      description: `Thank you! This number now has ${newCount} community report${newCount > 1 ? 's' : ''}.`,
    })
  }

  return (
    <Card className="rounded-[32px] border-rose-400/20 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-rose-500/15 p-3 text-rose-300">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-rose-100">⚠️ High Spam Risk Detected</h3>
            <p className="mt-2 text-sm leading-7 text-rose-200/80">
              This number has a spam score of <strong>{formatPercent(result.spamScore)}</strong>,
              which is significantly above the safety threshold. Exercise caution before answering or returning calls from this number.
            </p>
          </div>
        </div>
        <Badge label={`Spam ${formatPercent(result.spamScore)}`} tone="high" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          onClick={handleReport}
          disabled={hasReported}
          className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/15 px-5 py-3 text-sm font-medium text-rose-200 transition-all hover:border-rose-400/40 hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <AlertTriangle className="h-4 w-4" />
          {hasReported ? 'Reported ✓' : 'Report as Spam'}
        </button>
        {reportCount > 0 && (
          <span className="text-sm text-rose-200/70">
            {reportCount} community report{reportCount > 1 ? 's' : ''} for this number
          </span>
        )}
      </div>

      <div className="mt-6 rounded-3xl border border-rose-400/10 bg-rose-500/8 p-4 text-sm leading-7 text-rose-100/80">
        <strong>Safety tips:</strong> Do not share personal information. Do not call back unknown numbers with high spam risk.
        If you have been scammed, report to your local telecommunications authority.
      </div>
    </Card>
  )
}
