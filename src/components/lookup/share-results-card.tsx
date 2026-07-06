import { Clipboard, Mail, MessageCircle } from 'lucide-react'
import type { PhoneLookupResult } from '../../types/api'
import { formatLocationPrecision, formatLookupStatus, formatPercent, formatRiskLabel } from '../../utils/format'
import { useToastStore } from '../../store/toast-store'
import { Card } from '../ui/card'

interface ShareResultsCardProps {
  result: PhoneLookupResult
}

function buildResultText(result: PhoneLookupResult): string {
  return [
    `📞 Phone Number: ${result.number}`,
    `🌍 Country: ${result.countryFlag} ${result.country}`,
    `📍 Region: ${result.region}`,
    `📡 Carrier: ${result.carrier}`,
    `📱 Line Type: ${result.lineType}`,
    `🕐 Timezone: ${result.timezone}`,
    `📌 Estimated Location: ${result.estimatedLocation}`,
    `🔒 Status: ${formatLookupStatus(result.status)}`,
    `⚠️ Risk Level: ${formatRiskLabel(result.riskLevel)}`,
    `🛡️ Spam Score: ${formatPercent(result.spamScore)}`,
    `🗺️ Map Precision: ${formatLocationPrecision(result.locationPrecision)}`,
    '',
    '— Powered by TrackSecure',
  ].join('\n')
}

export function ShareResultsCard({ result }: ShareResultsCardProps) {
  const pushToast = useToastStore((state) => state.pushToast)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildResultText(result))
      pushToast({ tone: 'success', title: 'Copied!', description: 'Lookup results copied to clipboard.' })
    } catch {
      pushToast({ tone: 'error', title: 'Copy failed', description: 'Your browser blocked clipboard access.' })
    }
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent(buildResultText(result))
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handleEmail = () => {
    const subject = encodeURIComponent(`Phone Lookup: ${result.number}`)
    const body = encodeURIComponent(buildResultText(result))
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
  }

  return (
    <Card className="rounded-[32px]">
      <div>
        <h3 className="text-2xl font-semibold text-white">Share Results</h3>
        <p className="mt-2 text-sm leading-7 text-slate-400">
          Copy or share this lookup result with others via WhatsApp or email.
        </p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-all hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-200"
        >
          <Clipboard className="h-4 w-4" />
          Copy to Clipboard
        </button>
        <button
          onClick={handleWhatsApp}
          className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-3 text-sm font-medium text-emerald-200 transition-all hover:border-emerald-400/40 hover:bg-emerald-500/20"
        >
          <MessageCircle className="h-4 w-4" />
          Share via WhatsApp
        </button>
        <button
          onClick={handleEmail}
          className="inline-flex items-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-5 py-3 text-sm font-medium text-blue-200 transition-all hover:border-blue-400/40 hover:bg-blue-500/20"
        >
          <Mail className="h-4 w-4" />
          Share via Email
        </button>
      </div>
    </Card>
  )
}
