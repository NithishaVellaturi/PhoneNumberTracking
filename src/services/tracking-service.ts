import type {
  ApiResponse,
  DashboardStats,
  DashboardTrends,
  MapBounds,
  PhoneLookupResult,
} from '../types/api'
import { http } from './http'

const emptyMapBounds: MapBounds = {
  southLatitude: 0,
  northLatitude: 0,
  westLongitude: 0,
  eastLongitude: 0,
}

type RawPhoneLookupResult = Omit<PhoneLookupResult, 'mapBounds'> & {
  mapBounds?: Partial<MapBounds> | null
}

function normalizeMapBounds(mapBounds: RawPhoneLookupResult['mapBounds']): MapBounds {
  return {
    southLatitude: typeof mapBounds?.southLatitude === 'number' ? mapBounds.southLatitude : emptyMapBounds.southLatitude,
    northLatitude: typeof mapBounds?.northLatitude === 'number' ? mapBounds.northLatitude : emptyMapBounds.northLatitude,
    westLongitude: typeof mapBounds?.westLongitude === 'number' ? mapBounds.westLongitude : emptyMapBounds.westLongitude,
    eastLongitude: typeof mapBounds?.eastLongitude === 'number' ? mapBounds.eastLongitude : emptyMapBounds.eastLongitude,
  }
}

function normalizePhoneLookupResult(result: RawPhoneLookupResult): PhoneLookupResult {
  return {
    ...result,
    mapBounds: normalizeMapBounds(result.mapBounds),
  }
}

export const trackingService = {
  getDashboardStats: async () => {
    const { data } = await http.get<ApiResponse<DashboardStats>>('/dashboard/stats')
    return data
  },
  getDashboardTrends: async () => {
    const { data } = await http.get<ApiResponse<DashboardTrends>>('/dashboard/trends')
    return data
  },
  trackNumber: async (phoneNumber: string, countryCode?: string) => {
    const { data } = await http.get<ApiResponse<RawPhoneLookupResult>>('/phone/lookup', {
      params: { number: phoneNumber, countryCode },
    })

    return {
      ...data,
      data: normalizePhoneLookupResult(data.data),
    }
  },
}
