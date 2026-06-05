import { useMutation, useQuery } from '@tanstack/react-query'
import { trackingService } from '../services/tracking-service'

export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await trackingService.getDashboardStats()
      return response.data
    },
  })
}

export function useDashboardTrendsQuery() {
  return useQuery({
    queryKey: ['dashboard', 'trends'],
    queryFn: async () => {
      const response = await trackingService.getDashboardTrends()
      return response.data
    },
  })
}

export function usePhoneLookupQuery(phoneNumber: string, countryCode?: string, enabled = true) {
  const normalizedPhoneNumber = phoneNumber.trim()

  return useQuery({
    queryKey: ['phone', 'lookup', countryCode ?? 'AUTO', normalizedPhoneNumber],
    queryFn: async () => {
      const response = await trackingService.trackNumber(normalizedPhoneNumber, countryCode)
      return response.data
    },
    enabled: enabled && normalizedPhoneNumber.length > 0,
  })
}

export function usePhoneLookupMutation() {
  return useMutation({
    mutationFn: async ({ phoneNumber, countryCode }: { phoneNumber: string; countryCode?: string }) => {
      const response = await trackingService.trackNumber(phoneNumber, countryCode)
      return response.data
    },
  })
}
