export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ErrorDetails {
  code: string
  fieldErrors: Record<string, string>
}

export interface DailyAnalyticsPoint {
  date: string
  totalSearches: number
  spamReports: number
}

export interface NamedMetric {
  label: string
  value: number
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type LookupStatus = 'VALID' | 'UNKNOWN' | 'INVALID'
export type LocationPrecision = 'AREA' | 'REGION' | 'COUNTRY' | 'UNAVAILABLE'

export interface MapBounds {
  southLatitude: number
  northLatitude: number
  westLongitude: number
  eastLongitude: number
}

export interface LookupHistoryItem {
  phoneNumber: string
  country: string
  region: string
  carrier: string
  lineType: string
  spamScore: number
  riskLevel: RiskLevel
  status: LookupStatus
  searchedAt: string
}

export interface DashboardStats {
  totalSearches: number
  searchesToday: number
  spamReports: number
  validLookups: number
  invalidLookups: number
  averageSpamScore: number
  topCountries: NamedMetric[]
  topCarriers: NamedMetric[]
}

export interface DashboardTrends {
  lookupTrends: DailyAnalyticsPoint[]
  topCountries: NamedMetric[]
  topCarriers: NamedMetric[]
  riskDistribution: NamedMetric[]
  lineTypeDistribution: NamedMetric[]
  recentLookups: LookupHistoryItem[]
}

export interface PhoneLookupResult {
  number: string
  country: string
  countryFlag: string
  countryCode: string
  region: string
  lineType: string
  carrier: string
  timezone: string
  estimatedLocation: string
  spamScore: number
  riskLevel: RiskLevel
  status: LookupStatus
  valid: boolean
  estimatedLatitude: number
  estimatedLongitude: number
  locationPrecision: LocationPrecision
  mapBounds: MapBounds
  lastLookupDate: string
  lookupHistory: LookupHistoryItem[]
}
