export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ErrorDetails {
  code: string
  fieldErrors: Record<string, string>
}

export interface User {
  id: string
  name: string
  email: string
  company: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  lastLoginAt: string | null
}

export interface AuthPayload {
  email: string
  password: string
}

export interface RegisterPayload extends AuthPayload {
  name: string
  company?: string
}

export interface AuthSession {
  user: User
  expiresAt: string
}

export interface DailyAnalyticsPoint {
  day: string
  searches: number
  spamReports: number
}

export interface RegionStatistic {
  region: string
  count: number
}

export interface RecentActivity {
  title: string
  description: string
  type: string
  occurredAt: string
}

export interface SpamReportSummary {
  phoneNumber: string
  reportCount: number
  mostRecentReason: string
  spamScore: number
  riskLevel: RiskLevel
  lastReportedAt: string
}

export interface DashboardStats {
  totalSearches: number
  spamReports: number
  activeUsers: number
  searchAnalytics: DailyAnalyticsPoint[]
  regionStatistics: RegionStatistic[]
  recentActivity: RecentActivity[]
  recentReports: SpamReportSummary[]
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface NumberTrackingResult {
  phoneNumber: string
  countryCode: string
  countryName: string
  savedNumber: boolean
  savedCallerName: string | null
  businessCallerName: string | null
  operator: string
  region: string
  lineType: string
  spamScore: number
  riskLevel: RiskLevel
  reportCount: number
  lastChecked: string
}

export interface SearchHistoryItem extends NumberTrackingResult {
  id: string
}

export interface SpamReportPayload {
  phoneNumber: string
  countryCode: string
  reason: string
  notes?: string
}

export interface SaveCallerLabelPayload {
  phoneNumber: string
  countryCode?: string
  callerName?: string
}
