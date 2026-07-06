import { AlertTriangle, Clock3, Globe2, MapPinned, Phone, RadioTower, ShieldCheck, ShieldQuestion, ShieldX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SearchBar } from '../components/common/search-bar'
import { LookupDetailCard } from '../components/lookup/lookup-detail-card'
import { LookupHistoryCard } from '../components/lookup/lookup-history-card'
import { LookupMapCard } from '../components/lookup/lookup-map-card'
import { ShareResultsCard } from '../components/lookup/share-results-card'
import { SpamAlertCard } from '../components/lookup/spam-alert-card'
import { LookupStatusCard } from '../components/lookup/lookup-status-card'
import { Badge } from '../components/ui/badge'
import { Card } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { usePhoneLookupQuery } from '../hooks/use-tracksecure-queries'
import { toApiError } from '../services/http'
import { useAppStore } from '../store/app-store'
import { useToastStore } from '../store/toast-store'
import {
  describeLocationPrecision,
  formatDateTime,
  formatLocationCenterLabel,
  formatLocationPrecision,
  formatLookupStatus,
  formatPercent,
  formatRiskLabel,
  getRiskTone,
  getStatusTone,
} from '../utils/format'

const phonePattern = /^[+\d\s()-]{6,24}$/

export function LookupPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const preferredCountryCode = useAppStore((state) => state.preferredCountryCode)
  const draftPhoneNumber = useAppStore((state) => state.draftPhoneNumber)
  const latestLookup = useAppStore((state) => state.latestLookup)
  const setPreferredCountryCode = useAppStore((state) => state.setPreferredCountryCode)
  const setDraftPhoneNumber = useAppStore((state) => state.setDraftPhoneNumber)
  const setLatestLookup = useAppStore((state) => state.setLatestLookup)
  const pushToast = useToastStore((state) => state.pushToast)
  const queryNumber = searchParams.get('number')?.trim() ?? ''
  const queryCountryCode = searchParams.get('countryCode') ?? preferredCountryCode
  const lastErrorKeyRef = useRef<string | null>(null)
  const [manualValidationError, setManualValidationError] = useState<string | null>(null)
  const lookupQuery = usePhoneLookupQuery(queryNumber, queryCountryCode, Boolean(queryNumber))

  useEffect(() => {
    if (!queryNumber) {
      return
    }

    setDraftPhoneNumber(queryNumber)
    setPreferredCountryCode(queryCountryCode)
  }, [queryCountryCode, queryNumber, setDraftPhoneNumber, setPreferredCountryCode])

  useEffect(() => {
    if (!lookupQuery.data) {
      return
    }

    setLatestLookup(lookupQuery.data)
  }, [lookupQuery.data, setLatestLookup])

  useEffect(() => {
    if (!lookupQuery.error) {
      return
    }

    const apiError = toApiError(lookupQuery.error)
    const errorKey = `${lookupQuery.errorUpdatedAt}:${apiError.message}`

    if (lastErrorKeyRef.current === errorKey) {
      return
    }

    lastErrorKeyRef.current = errorKey
    pushToast({
      tone: 'error',
      title: 'Lookup failed',
      description: apiError.message,
    })
  }, [lookupQuery.error, lookupQuery.errorUpdatedAt, pushToast])

  const handleSubmit = () => {
    const normalizedPhoneNumber = draftPhoneNumber.trim()

    if (!phonePattern.test(normalizedPhoneNumber)) {
      const message = 'Enter a valid phone number with digits, spaces, or an international + prefix.'
      setManualValidationError(message)
      pushToast({
        tone: 'error',
        title: 'Phone number not valid',
        description: message,
      })
      return
    }

    setManualValidationError(null)
    setDraftPhoneNumber(normalizedPhoneNumber)

    if (queryNumber === normalizedPhoneNumber && queryCountryCode === preferredCountryCode) {
      void lookupQuery.refetch()
      return
    }

    setSearchParams({
      number: normalizedPhoneNumber,
      countryCode: preferredCountryCode,
    })
  }

  const result = queryNumber ? (lookupQuery.data ?? null) : latestLookup
  const isLoading = lookupQuery.isFetching
  const validationError = manualValidationError ?? (lookupQuery.error ? toApiError(lookupQuery.error).message : null)
  const hasEstimatedCoordinates = result !== null && !(result.estimatedLatitude === 0 && result.estimatedLongitude === 0)

  return (
    <div className="section-shell space-y-8 py-12">
      <div className="max-w-4xl space-y-4">
        <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-200">
          Phone Intelligence
        </div>
        <h1 className="text-4xl font-semibold text-white md:text-5xl">Track Phone Number Intelligence</h1>
        <p className="max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
          Instantly analyze phone numbers, carrier details, estimated regions, spam risk, and phone intelligence data.
        </p>
      </div>

      <Card className="rounded-[32px] p-5">
        <SearchBar
          compact
          countryCode={preferredCountryCode}
          phoneNumber={draftPhoneNumber}
          onCountryCodeChange={setPreferredCountryCode}
          onPhoneNumberChange={setDraftPhoneNumber}
          onSubmit={handleSubmit}
          loading={isLoading}
          submitLabel="Track Number"
          helperText="Location is estimated using publicly available numbering and carrier information. Exact live device location is not available."
        />
        {validationError ? (
          <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {validationError}
          </div>
        ) : null}
      </Card>

      {result ? <SpamAlertCard result={result} /> : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <LookupStatusCard result={result} isLoading={isLoading} />
        <Card className="rounded-[32px]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-sky-200/80">Current Assessment</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Risk summary and verification state</h2>
            </div>
            {result ? (
              <div className="flex flex-wrap gap-2">
                <Badge label={formatLookupStatus(result.status)} tone={getStatusTone(result.status)} />
                <Badge label={formatRiskLabel(result.riskLevel)} tone={getRiskTone(result.riskLevel)} />
                <Badge label={`Spam ${formatPercent(result.spamScore)}`} tone={getRiskTone(result.spamScore)} />
              </div>
            ) : null}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-28 w-full" />)
            ) : result ? (
              [
                {
                  title: 'Validity',
                  value: result.valid ? 'Format verified successfully' : 'Unable to verify a fully valid number format',
                  Icon: result.status === 'VALID' ? ShieldCheck : result.status === 'UNKNOWN' ? ShieldQuestion : ShieldX,
                },
                {
                  title: 'Risk Level',
                  value: formatRiskLabel(result.riskLevel),
                  Icon: AlertTriangle,
                },
                {
                  title: 'Last Lookup',
                  value: formatDateTime(result.lastLookupDate),
                  Icon: Clock3,
                },
              ].map(({ title, value, Icon }) => (
                <div key={title} className="rounded-3xl border border-white/8 bg-slate-950/45 p-5">
                  <div className="mb-4 inline-flex rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-slate-400">{title}</p>
                  <p className="mt-2 text-base font-medium text-white">{value}</p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-white/8 bg-slate-950/45 p-6 text-sm leading-7 text-slate-300 md:col-span-3">
                Enter a phone number to populate the number information, carrier context, location estimate, risk assessment, and lookup history panels.
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <LookupDetailCard
          title="Number Information"
          subtitle="Validation, numbering plan, and regional identity"
          isLoading={isLoading}
          items={result ? [
            { label: 'Phone Number', value: result.number, icon: Phone },
            { label: 'Country', value: `${result.countryFlag} ${result.country}`, icon: Globe2 },
            { label: 'Country Code', value: result.countryCode, icon: Phone },
            { label: 'Number Validity', value: result.valid ? 'Verified' : 'Not fully verified', icon: ShieldCheck },
          ] : []}
        />
        <LookupDetailCard
          title="Carrier Information"
          subtitle="Telecom and line-type intelligence"
          isLoading={isLoading}
          items={result ? [
            { label: 'Carrier', value: result.carrier, icon: RadioTower },
            { label: 'Line Type', value: result.lineType, icon: Phone },
            { label: 'Timezone', value: result.timezone, icon: Clock3 },
            { label: 'Status', value: formatLookupStatus(result.status), icon: AlertTriangle },
          ] : []}
        />
        <LookupDetailCard
          title="Location Information"
          subtitle="Estimated region derived from numbering and carrier metadata"
          isLoading={isLoading}
          items={result ? [
            { label: 'Region / State', value: result.region, icon: MapPinned },
            { label: 'Estimated Location', value: result.estimatedLocation, icon: Globe2 },
            { label: 'Map Precision', value: formatLocationPrecision(result.locationPrecision), icon: Globe2 },
            {
              label: formatLocationCenterLabel(result.locationPrecision),
              value: hasEstimatedCoordinates
                ? `${result.estimatedLatitude.toFixed(4)}, ${result.estimatedLongitude.toFixed(4)}`
                : 'Unavailable',
              icon: MapPinned,
            },
          ] : []}
        />
        <Card className="rounded-[32px]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-white">Spam Analysis</h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">Risk is derived from phone metadata, carrier confidence, numbering patterns, and historical lookup frequency.</p>
            </div>
            {result ? <Badge label={formatPercent(result.spamScore)} tone={getRiskTone(result.spamScore)} /> : null}
          </div>
          {isLoading ? (
            <div className="mt-6 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : result ? (
            <div className="mt-6 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>Spam Risk Score</span>
                  <span>{formatPercent(result.spamScore)}</span>
                </div>
                <div className="h-3 rounded-full bg-white/8">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-rose-400"
                    style={{ width: `${Math.max(result.spamScore, 4)}%` }}
                  />
                </div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-slate-950/45 p-5 text-sm leading-7 text-slate-300">
                Numbers classified as <strong>{result.riskLevel.toLowerCase()}</strong> risk often reflect VoIP routing, premium-rate numbering, unresolved carrier data, or repeated investigative lookups.
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-white/8 bg-slate-950/45 p-5 text-sm leading-7 text-slate-300">
              A completed lookup will surface the current spam risk score and the contributing intelligence factors.
            </div>
          )}
        </Card>
      </div>

      {result ? (
        <Card className="rounded-[32px] border border-cyan-400/10 bg-cyan-500/8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/80">Location Estimate</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">How to read the map result</h2>
            </div>
            <Badge label={formatLocationPrecision(result.locationPrecision)} tone="info" />
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-200">
            {describeLocationPrecision(result.locationPrecision)} Exact live device location cannot be derived from a phone number lookup alone.
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Need your own current device location instead? <Link to="/current-location" className="font-semibold text-cyan-300 hover:text-cyan-200">Open the Current Location page</Link>.
          </p>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <LookupMapCard result={result} isLoading={isLoading} />
        <LookupHistoryCard history={result?.lookupHistory ?? []} isLoading={isLoading} />
      </div>

      {result ? <ShareResultsCard result={result} /> : null}
    </div>
  )
}
