import { AlertTriangle, Building2, Globe, LoaderCircle, MapPin, RadioTower, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchBar } from '../components/common/search-bar'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Skeleton } from '../components/ui/skeleton'
import { trackingService } from '../services/tracking-service'
import { toApiError } from '../services/http'
import { useAppStore } from '../store/app-store'
import { useToastStore } from '../store/toast-store'
import { formatDateTime, formatPercent, formatRiskLabel, getRiskTone } from '../utils/format'

const phonePattern = /^[+\d\s()-]{6,20}$/

export function TrackNumberPage() {
  const [searchParams] = useSearchParams()
  const [countryCode, setCountryCode] = useState(searchParams.get('country') ?? 'US')
  const [phoneNumber, setPhoneNumber] = useState(searchParams.get('phone') ?? '')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const result = useAppStore((state) => state.recentResult)
  const setRecentResult = useAppStore((state) => state.setRecentResult)
  const pushToast = useToastStore((state) => state.pushToast)
  const [callerNameInput, setCallerNameInput] = useState(result?.savedCallerName ?? '')
  const [isSavingCallerName, setIsSavingCallerName] = useState(false)
  const resolvedCountryName = result?.countryName?.trim() || result?.countryCode || ''
  const isSavedNumber = result?.savedNumber ?? false
  const savedCallerName = result?.savedCallerName?.trim() || ''
  const businessCallerName = result?.businessCallerName?.trim() || ''
  const trimmedCallerName = callerNameInput.trim()
  const displayCallerName = savedCallerName || businessCallerName || (isSavedNumber ? 'Saved to workspace' : 'No caller name available yet')
  const locationLabel = result === null || result.region === resolvedCountryName
    ? resolvedCountryName
    : `${result.region}, ${resolvedCountryName}`

  const handleSearch = async () => {
    if (!phonePattern.test(phoneNumber.trim())) {
      setErrorMessage('Enter a valid phone number before searching.')
      return
    }

    setErrorMessage(null)
    setIsLoading(true)
    try {
      const response = await trackingService.trackNumber(phoneNumber.trim(), countryCode)
      setRecentResult(response.data)
      setCallerNameInput(response.data.savedCallerName ?? '')
      pushToast({
        tone: 'success',
        title: 'Number tracked',
        description: `${response.data.phoneNumber} checked successfully.`,
      })
    } catch (error) {
      const apiError = toApiError(error)
      setErrorMessage(apiError.message)
      pushToast({
        tone: 'error',
        title: 'Tracking failed',
        description: apiError.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCallerName = async () => {
    if (result === null) {
      return
    }

    if (trimmedCallerName.length === 1) {
      pushToast({
        tone: 'error',
        title: 'Invalid caller name',
        description: 'Enter at least 2 characters before saving.',
      })
      return
    }

    setIsSavingCallerName(true)
    try {
      const response = await trackingService.saveCallerLabel({
        phoneNumber: result.phoneNumber,
        countryCode: result.countryCode,
        callerName: trimmedCallerName,
      })
      setRecentResult(response.data)
      setCallerNameInput(response.data.savedCallerName ?? '')
      pushToast({
        tone: 'success',
        title: trimmedCallerName ? (savedCallerName ? 'Caller name updated' : 'Caller name saved') : (isSavedNumber ? 'Saved number updated' : 'Number saved'),
        description: trimmedCallerName
          ? `${response.data.phoneNumber} will now show ${response.data.savedCallerName ?? trimmedCallerName}.`
          : `${response.data.phoneNumber} has been saved to your workspace.`,
      })
    } catch (error) {
      const apiError = toApiError(error)
      pushToast({
        tone: 'error',
        title: 'Save failed',
        description: apiError.message,
      })
    } finally {
      setIsSavingCallerName(false)
    }
  }

  const handleRemoveCallerName = async () => {
    if (result === null) {
      return
    }

    setIsSavingCallerName(true)
    try {
      const response = await trackingService.removeCallerLabel(result.phoneNumber, result.countryCode)
      setRecentResult(response.data)
      setCallerNameInput('')
      pushToast({
        tone: 'info',
        title: 'Saved number removed',
        description: `${response.data.phoneNumber} has been removed from your saved numbers.`,
      })
    } catch (error) {
      const apiError = toApiError(error)
      pushToast({
        tone: 'error',
        title: 'Remove failed',
        description: apiError.message,
      })
    } finally {
      setIsSavingCallerName(false)
    }
  }

  const resultCards = result === null ? [] : [
    { label: 'Phone Number', value: result.phoneNumber, Icon: Smartphone },
    { label: 'Caller Name', value: displayCallerName, Icon: Building2 },
    { label: 'Public Business Name', value: businessCallerName || 'No verified public business name found', Icon: Globe },
    { label: 'Country', value: `${resolvedCountryName} (${result.countryCode})`, Icon: Globe },
    { label: 'Approximate Area', value: result.region, Icon: MapPin },
    { label: 'Operator', value: result.operator, Icon: RadioTower },
    { label: 'Line Type', value: result.lineType, Icon: AlertTriangle },
  ]

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl"><div className="mb-5"><h2 className="text-2xl font-semibold text-white">Track Phone Number</h2><p className="mt-2 text-sm text-slate-400">Run live carrier, public business caller name, country, approximate area, and fraud analysis against the backend API.</p></div><SearchBar compact countryCode={countryCode} phoneNumber={phoneNumber} onCountryCodeChange={setCountryCode} onPhoneNumberChange={setPhoneNumber} onSubmit={() => { void handleSearch() }} loading={isLoading} submitLabel="Track Now" />{errorMessage ? <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{errorMessage}</div> : null}</Card>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-3xl">
          <div className="mb-6 flex items-center justify-between"><div><h3 className="text-lg font-semibold text-white">Latest Result</h3><p className="text-sm text-slate-400">Validated via the live TrackSecure service</p></div>{isLoading ? <LoaderCircle className="h-5 w-5 animate-spin text-cyan-300" /> : null}</div>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
            </div>
          ) : result === null ? (
            <div className="rounded-3xl border border-white/8 bg-slate-950/45 p-6 text-sm leading-7 text-slate-300">
              Search for a number to see operator details, risk scoring, report volume, and the latest timestamp from the backend lookup.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {resultCards.map(({ label, value, Icon }) => <div key={label} className="rounded-3xl border border-white/8 bg-slate-950/50 p-5"><div className="mb-4 inline-flex rounded-2xl bg-blue-500/10 p-3 text-blue-300"><Icon className="h-5 w-5" /></div><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-lg font-medium text-white">{value}</p></div>)}
            </div>
          )}
          {result !== null && !isLoading ? (
            <>
              <div className="mt-4 rounded-3xl border border-white/8 bg-slate-950/50 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-white">Save Number Or Caller Name</h4>
                    <p className="mt-2 text-sm text-slate-400">Save this number to your workspace even without a name, or add your own caller name so future track searches and history entries show it first.</p>
                    <div className="mt-4">
                      <Input value={callerNameInput} onChange={(event) => setCallerNameInput(event.target.value)} maxLength={120} placeholder="Optional caller name" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button onClick={() => { void handleSaveCallerName() }} disabled={isSavingCallerName || trimmedCallerName.length === 1}>
                      {isSavingCallerName ? 'Saving...' : trimmedCallerName ? (savedCallerName ? 'Update name' : 'Save name') : (isSavedNumber ? 'Save number only' : 'Save number')}
                    </Button>
                    {isSavedNumber ? <Button variant="ghost" onClick={() => { void handleRemoveCallerName() }} disabled={isSavingCallerName}>Remove saved number</Button> : null}
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-cyan-400/10 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">Saved numbers and caller names are private to your workspace. Public business caller names only appear when the configured provider returns a verified listing. Location details remain approximate and do not represent live device tracking.</div>
            </>
          ) : null}
        </Card>
        <Card className="rounded-3xl">
          <h3 className="text-lg font-semibold text-white">Threat Assessment</h3>
          {isLoading ? (
            <div className="mt-6 space-y-4"><Skeleton className="h-8 w-full" /><Skeleton className="h-14 w-full" /><Skeleton className="h-24 w-full" /></div>
          ) : result === null ? (
            <div className="mt-6 rounded-3xl border border-white/8 bg-slate-950/45 p-5 text-sm leading-7 text-slate-300">The risk card will populate once a valid number has been searched.</div>
          ) : (
            <div className="mt-6 space-y-5">
              <div><div className="mb-2 flex items-center justify-between text-sm text-slate-300"><span>Spam score</span><span>{formatPercent(result.spamScore)}</span></div><div className="h-3 rounded-full bg-white/8"><div className="h-3 rounded-full bg-gradient-to-r from-rose-500 to-amber-400" style={{ width: `${result.spamScore}%` }} /></div></div>
              <div className="flex flex-wrap gap-2"><Badge label={formatRiskLabel(result.riskLevel)} tone={getRiskTone(result.riskLevel)} /><Badge label={`${result.reportCount} reports`} tone={result.reportCount > 0 ? 'medium' : 'info'} /><Badge label={`Checked ${formatDateTime(result.lastChecked)}`} tone="info" /></div>
              <div className="rounded-3xl border border-rose-400/10 bg-rose-500/10 p-5 text-sm leading-7 text-rose-100">{result.reportCount > 0 ? `Community reporting has flagged this number ${result.reportCount} time${result.reportCount === 1 ? '' : 's'}.` : 'No community spam reports have been recorded for this number yet.'}</div>
              <div className="rounded-3xl border border-white/8 bg-slate-950/45 p-5 text-sm leading-7 text-slate-300">Location summary: {locationLabel}</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
