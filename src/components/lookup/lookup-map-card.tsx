import { useEffect, useState } from 'react'
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap, Polyline } from 'react-leaflet'
import type { PhoneLookupResult } from '../../types/api'
import { describeLocationPrecision, formatLocationPrecision } from '../../utils/format'
import { calculateHaversineDistance } from '../../utils/geo'
import { useToastStore } from '../../store/toast-store'
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
  const pushToast = useToastStore((state) => state.pushToast)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [distanceKm, setDistanceKm] = useState<number | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  // Reset distance when result changes
  useEffect(() => {
    if (result && userLocation) {
      const hasCoords = !(result.estimatedLatitude === 0 && result.estimatedLongitude === 0)
      if (hasCoords) {
        const dist = calculateHaversineDistance(
          userLocation.lat,
          userLocation.lng,
          result.estimatedLatitude,
          result.estimatedLongitude
        )
        setDistanceKm(dist)
      } else {
        setDistanceKm(null)
      }
    } else {
      setDistanceKm(null)
    }
  }, [result, userLocation])

  if (isLoading) {
    return <Card className="rounded-[32px]"><Skeleton className="h-[420px] w-full" /></Card>
  }

  const hasCoordinates = result !== null && !(result.estimatedLatitude === 0 && result.estimatedLongitude === 0)
  const centerLatitude = hasCoordinates ? result.estimatedLatitude : 20
  const centerLongitude = hasCoordinates ? result.estimatedLongitude : 0
  const mapBounds = result?.mapBounds
  
  let hasBounds = hasCoordinates &&
    mapBounds !== undefined &&
    mapBounds.southLatitude !== 0 &&
    mapBounds.northLatitude !== 0 &&
    mapBounds.westLongitude !== 0 &&
    mapBounds.eastLongitude !== 0

  let finalSouthLat = mapBounds?.southLatitude ?? 0
  let finalNorthLat = mapBounds?.northLatitude ?? 0
  let finalWestLng = mapBounds?.westLongitude ?? 0
  let finalEastLng = mapBounds?.eastLongitude ?? 0

  // If we have user location and target coordinates, update bounds to fit both
  if (hasCoordinates && userLocation) {
    finalSouthLat = Math.min(result.estimatedLatitude, userLocation.lat)
    finalNorthLat = Math.max(result.estimatedLatitude, userLocation.lat)
    finalWestLng = Math.min(result.estimatedLongitude, userLocation.lng)
    finalEastLng = Math.max(result.estimatedLongitude, userLocation.lng)
    hasBounds = true
  }

  const zoom = hasCoordinates ? 5 : 2
  const radius = result?.locationPrecision === 'AREA'
    ? 32000
    : result?.locationPrecision === 'REGION'
      ? 125000
      : result?.locationPrecision === 'COUNTRY'
        ? 420000
        : 0
  const precisionNote = result ? describeLocationPrecision(result.locationPrecision) : 'Viewport adapts after a successful lookup.'

  const handleCalculateDistance = () => {
    if (!navigator.geolocation) {
      pushToast({ tone: 'error', title: 'Not Supported', description: 'Geolocation is not supported by your browser.' })
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
        setIsLocating(false)
      },
      (error) => {
        pushToast({ tone: 'error', title: 'Location Denied', description: 'Please allow location access to calculate distance.' })
        setIsLocating(false)
      }
    )
  }

  return (
    <Card className="rounded-[32px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-white">Interactive Map</h3>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            Estimated location rendered on OpenStreetMap using phone numbering and carrier information.
          </p>
        </div>
        {result ? (
          <div className="flex flex-wrap gap-2">
            <Badge label={formatLocationPrecision(result.locationPrecision)} tone="info" />
            {distanceKm !== null && (
              <Badge label={`Distance: ${Math.round(distanceKm).toLocaleString()} km`} tone="success" />
            )}
          </div>
        ) : null}
      </div>
      
      <div className="mt-4 flex">
         {hasCoordinates && (
            <button
              onClick={handleCalculateDistance}
              disabled={isLocating}
              className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20 disabled:opacity-50"
            >
              {isLocating ? 'Locating...' : 'Calculate Distance to Phone'}
            </button>
         )}
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
            southLatitude={finalSouthLat}
            northLatitude={finalNorthLat}
            westLongitude={finalWestLng}
            eastLongitude={finalEastLng}
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
          {userLocation ? (
             <CircleMarker center={[userLocation.lat, userLocation.lng]} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.9 }} radius={7}>
               <Popup>
                 <strong>Your Location</strong>
               </Popup>
             </CircleMarker>
          ) : null}
          {hasCoordinates && userLocation ? (
             <Polyline 
               positions={[
                 [userLocation.lat, userLocation.lng], 
                 [result.estimatedLatitude, result.estimatedLongitude]
               ]} 
               pathOptions={{ color: '#10b981', dashArray: '5, 10', weight: 2 }} 
             />
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
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Distance from You</p>
          <p className="mt-2 text-sm font-medium text-white">
            {distanceKm !== null ? `${Math.round(distanceKm).toLocaleString()} kilometers` : 'Click "Calculate Distance" to see.'}
          </p>
        </div>
      </div>
      <div className="mt-5 rounded-3xl border border-blue-400/10 bg-blue-500/10 p-4 text-sm leading-7 text-blue-100">
        Location is estimated using publicly available numbering and carrier information. Exact live device location is not available.
      </div>
    </Card>
  )
}

