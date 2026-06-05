import { useEffect } from 'react'
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import type { PhoneLookupResult } from '../../types/api'
import { describeLocationPrecision, formatLocationPrecision } from '../../utils/format'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

interface LookupMapCardProps {
  result: PhoneLookupResult | null
  isLoading?: boolean
}

function MapViewport({
  latitude,
  longitude,
  zoom,
  southLatitude,
  northLatitude,
  westLongitude,
  eastLongitude,
  useBounds,
}: {
  latitude: number
  longitude: number
  zoom: number
  southLatitude: number
  northLatitude: number
  westLongitude: number
  eastLongitude: number
  useBounds: boolean
}) {
  const map = useMap()

  useEffect(() => {
    map.invalidateSize()

    if (useBounds) {
      map.fitBounds(
        [
          [southLatitude, westLongitude],
          [northLatitude, eastLongitude],
        ],
        { padding: [24, 24], maxZoom: 9 },
      )
      return
    }

    map.setView([latitude, longitude], zoom)
  }, [eastLongitude, latitude, longitude, map, northLatitude, southLatitude, useBounds, westLongitude, zoom])

  return null
}

export function LookupMapCard({ result, isLoading = false }: LookupMapCardProps) {
  if (isLoading) {
    return <Card className="rounded-[32px]"><Skeleton className="h-[420px] w-full" /></Card>
  }

  const hasCoordinates = result !== null && !(result.estimatedLatitude === 0 && result.estimatedLongitude === 0)
  const centerLatitude = hasCoordinates ? result.estimatedLatitude : 20
  const centerLongitude = hasCoordinates ? result.estimatedLongitude : 0
  const mapBounds = result?.mapBounds
  const hasBounds = hasCoordinates &&
    mapBounds !== undefined &&
    mapBounds.southLatitude !== 0 &&
    mapBounds.northLatitude !== 0 &&
    mapBounds.westLongitude !== 0 &&
    mapBounds.eastLongitude !== 0
  const zoom = hasCoordinates ? 5 : 2
  const radius = result?.locationPrecision === 'AREA'
    ? 32000
    : result?.locationPrecision === 'REGION'
      ? 125000
      : result?.locationPrecision === 'COUNTRY'
        ? 420000
        : 0
  const precisionNote = result ? describeLocationPrecision(result.locationPrecision) : 'Viewport adapts after a successful lookup.'

  return (
    <Card className="rounded-[32px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-white">Interactive Map</h3>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            Estimated location rendered on OpenStreetMap using phone numbering and carrier information.
          </p>
        </div>
        {result ? <Badge label={formatLocationPrecision(result.locationPrecision)} tone="info" /> : null}
      </div>
      <div className="relative mt-6 overflow-hidden rounded-[28px] border border-white/10">
        {result && !hasCoordinates ? (
          <div className="pointer-events-none absolute inset-x-4 top-4 z-[500] rounded-2xl border border-amber-300/15 bg-slate-950/85 px-4 py-3 text-sm leading-6 text-amber-100">
            {precisionNote}
          </div>
        ) : null}
        <MapContainer center={[centerLatitude, centerLongitude]} zoom={zoom} scrollWheelZoom className="h-[320px] w-full">
          <MapViewport
            latitude={centerLatitude}
            longitude={centerLongitude}
            zoom={zoom}
            southLatitude={mapBounds?.southLatitude ?? 0}
            northLatitude={mapBounds?.northLatitude ?? 0}
            westLongitude={mapBounds?.westLongitude ?? 0}
            eastLongitude={mapBounds?.eastLongitude ?? 0}
            useBounds={hasBounds}
          />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {result && hasCoordinates && radius > 0 ? (
            <Circle
              center={[result.estimatedLatitude, result.estimatedLongitude]}
              radius={radius}
              pathOptions={{ color: '#38bdf8', fillColor: '#0ea5e9', fillOpacity: 0.12, weight: 1.5 }}
            />
          ) : null}
          {result && hasCoordinates ? (
            <CircleMarker center={[result.estimatedLatitude, result.estimatedLongitude]} pathOptions={{ color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.75 }} radius={9}>
              <Popup>
                <strong>{result.estimatedLocation}</strong>
                <div>{result.number}</div>
                <div>{formatLocationPrecision(result.locationPrecision)}</div>
                <div>{precisionNote}</div>
              </Popup>
            </CircleMarker>
          ) : null}
        </MapContainer>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-white/8 bg-slate-950/45 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Estimated Area</p>
          <p className="mt-2 text-sm font-medium text-white">
            {result ? result.estimatedLocation : 'Run a lookup to visualize the estimated service area.'}
          </p>
        </div>
        <div className="rounded-3xl border border-white/8 bg-slate-950/45 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Dynamic Viewport</p>
          <p className="mt-2 text-sm font-medium text-white">
            {result ? precisionNote : 'Viewport adapts after a successful lookup.'}
          </p>
        </div>
      </div>
      <div className="mt-5 rounded-3xl border border-blue-400/10 bg-blue-500/10 p-4 text-sm leading-7 text-blue-100">
        Location is estimated using publicly available numbering and carrier information. Exact live device location is not available.
      </div>
    </Card>
  )
}
