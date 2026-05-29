import type {
  ApiResponse,
  DashboardStats,
  NumberTrackingResult,
  SaveCallerLabelPayload,
  SearchHistoryItem,
  SpamReportPayload,
} from '../types/api'
import { http, primeCsrfToken } from './http'

export const trackingService = {
  getDashboardStats: async () => {
    const { data } = await http.get<ApiResponse<DashboardStats>>('/dashboard/stats')
    return data
  },
  trackNumber: async (phoneNumber: string, countryCode: string) => {
    const { data } = await http.get<ApiResponse<NumberTrackingResult>>('/track-number', {
      params: { phoneNumber, countryCode },
    })
    return data
  },
  reportSpam: async (payload: SpamReportPayload) => {
    await primeCsrfToken()
    const { data } = await http.post<ApiResponse<NumberTrackingResult>>('/report-spam', payload)
    return data
  },
  getSearchHistory: async () => {
    const { data } = await http.get<ApiResponse<SearchHistoryItem[]>>('/search-history')
    return data
  },
  saveCallerLabel: async (payload: SaveCallerLabelPayload) => {
    await primeCsrfToken()
    const { data } = await http.post<ApiResponse<NumberTrackingResult>>('/caller-labels', payload)
    return data
  },
  removeCallerLabel: async (phoneNumber: string, countryCode?: string) => {
    await primeCsrfToken()
    const { data } = await http.delete<ApiResponse<NumberTrackingResult>>('/caller-labels', {
      params: { phoneNumber, countryCode },
    })
    return data
  },
}
