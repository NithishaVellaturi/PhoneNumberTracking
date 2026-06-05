import { ExternalLink, LocateFixed, Navigation, ShieldCheck, ShieldQuestion, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

interface DeviceCoordinates {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: string
}

type DeviceLocationState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'success'; coordinates: DeviceCoordinates }
  | { status: 'error'; message: string }
  | { status: 'unsupported'; message: string }

function DeviceLocationViewport({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap()

  useEffect(() => {
    map.invalidateSize()
    map.setView([latitude, longitude], 16)
  }, [latitude, longitude, map])

  return null
}

function formatAccuracy(value: number) {
  return `${value.toFixed(0)} m`
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function buildGoogleMapsUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps?q=${latitude},${longitude}`
}

function toLocationErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) {
    return 'Location permission was denied. Allow browser access to continue.'
  }
  if (error.code === error.POSITION_UNAVAILABLE) {
    return 'Your device could not determine a position right now.'
  }
  if (error.code === error.TIMEOUT) {
    return 'The location request timed out. Try again with GPS or Wi-Fi enabled.'
  }
  return 'The browser could not retrieve your location.'
}

export function DeviceLocationCard() {
  const [state, setState] = useState<DeviceLocationState>({ status: 'idle' })

  const handleRequestLocation = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setState({
        status: 'unsupported',
        message: 'This browser does not support device geolocation.',
      })
      return
    }

    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setState({
        status: 'unsupported',
        message: 'Browser geolocation requires HTTPS or localhost.',
      })
      return
    }

    setState({ status: 'requesting' })

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: 'success',
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp).toISOString(),
          },
        })
      },
      (error) => {
        setState({
          status: 'error',
          message: toLocationErrorMessage(error),
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  const clearLocation = () => {
    setState({ status: 'idle' })
  }

  const openInGoogleMaps = () => {
    if (state.status !== 'success' || typeof window === 'undefined') {
      return
    }

    window.open(
      buildGoogleMapsUrl(state.coordinates.latitude, state.coordinates.longitude),
      '_blank',
      'noopener,noreferrer',
    )
  }

  const isBusy = state.status === 'requesting'
  const hasLocation = state.status === 'success'

  return (
    <Card className="rounded-[32px] border border-emerald-400/10 bg-[linear-gradient(180deg,rgba(2,44,34,0.9),rgba(3,20,28,0.72))]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.28em] text-emerald-200/80">Optional GPS</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Your device location</h2>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            This uses the current browser device only after explicit permission. It does not reveal the location of a searched phone number.
          </p>
        </div>
        <Badge
          label={hasLocation ? 'Live device reading' : 'Consent required'}
          tone={hasLocation ? 'low' : 'info'}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={handleRequestLocation} disabled={isBusy} className="min-w-[220px]">
          {isBusy ? 'Requesting location...' : hasLocation ? 'Refresh my location' : 'Use my current location'}
        </Button>
        {hasLocation ? (
          <Button onClick={openInGoogleMaps} variant="secondary">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Google Maps
          </Button>
        ) : null}
        {hasLocation ? (
          <Button onClick={clearLocation} variant="ghost">
            Clear location
          </Button>
        ) : null}
      </div>

      {state.status === 'idle' ? (
        <div className="mt-6 rounded-3xl border border-white/8 bg-slate-950/35 p-5 text-sm leading-7 text-slate-200">
          Grant browser permission to view your own exact coordinates and GPS accuracy radius on the map.
        </div>
      ) : null}

      {state.status === 'requesting' ? (
        <div className="mt-6 rounded-3xl border border-cyan-300/12 bg-cyan-500/10 p-5 text-sm leading-7 text-cyan-100">
          Waiting for the browser, device GPS, Wi-Fi, or mobile network to return a position.
        </div>
      ) : null}

      {state.status === 'error' ? (
        <div className="mt-6 rounded-3xl border border-rose-300/12 bg-rose-500/10 p-5 text-sm leading-7 text-rose-100">
          {state.message}
        </div>
      ) : null}

      {state.status === 'unsupported' ? (
        <div className="mt-6 rounded-3xl border border-amber-300/12 bg-amber-500/10 p-5 text-sm leading-7 text-amber-100">
          {state.message}
        </div>
      ) : null}

      {hasLocation ? (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-white/8 bg-slate-950/35 p-5">
              <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/12 p-3 text-emerald-200">
                <LocateFixed className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-400">Latitude</p>
              <p className="mt-2 text-base font-medium text-white">{state.coordinates.latitude.toFixed(6)}</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-slate-950/35 p-5">
              <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/12 p-3 text-emerald-200">
                <Navigation className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-400">Longitude</p>
              <p className="mt-2 text-base font-medium text-white">{state.coordinates.longitude.toFixed(6)}</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-slate-950/35 p-5">
              <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/12 p-3 text-emerald-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-400">Accuracy Radius</p>
              <p className="mt-2 text-base font-medium text-white">{formatAccuracy(state.coordinates.accuracy)}</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-slate-950/35 p-5">
              <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/12 p-3 text-emerald-200">
                <ShieldQuestion className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-400">Captured</p>
              <p className="mt-2 text-base font-medium text-white">{formatTimestamp(state.coordinates.timestamp)}</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10">
            <MapContainer center={[state.coordinates.latitude, state.coordinates.longitude]} zoom={16} scrollWheelZoom className="h-[320px] w-full">
              <DeviceLocationViewport latitude={state.coordinates.latitude} longitude={state.coordinates.longitude} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Circle
                center={[state.coordinates.latitude, state.coordinates.longitude]}
                radius={state.coordinates.accuracy}
                pathOptions={{ color: '#34d399', fillColor: '#10b981', fillOpacity: 0.14, weight: 1.5 }}
              />
              <CircleMarker
                center={[state.coordinates.latitude, state.coordinates.longitude]}
                pathOptions={{ color: '#6ee7b7', fillColor: '#34d399', fillOpacity: 0.85 }}
                radius={9}
              >
                <Popup>
                  <strong>Your device location</strong>
                  <div>{state.coordinates.latitude.toFixed(6)}, {state.coordinates.longitude.toFixed(6)}</div>
                  <div>Accuracy radius: {formatAccuracy(state.coordinates.accuracy)}</div>
                </Popup>
              </CircleMarker>
            </MapContainer>
          </div>

          <div className="mt-5 rounded-3xl border border-emerald-300/12 bg-emerald-500/10 p-4 text-sm leading-7 text-emerald-50">
            This reading stays in the current browser session unless you choose to build storage or sharing on top of it later. You can also open the exact coordinates in Google Maps.
          </div>
        </>
      ) : null}

      <div className="mt-5 rounded-3xl border border-white/8 bg-slate-950/35 p-4 text-sm leading-7 text-slate-300">
        <div className="flex items-start gap-3">
          <XCircle className="mt-1 h-4 w-4 shrink-0 text-amber-300" />
          <span>
            This feature is intentionally separate from phone lookup. A searched phone number cannot reveal another person&apos;s exact live location by itself.
          </span>
        </div>
      </div>
    </Card>
  )
}
