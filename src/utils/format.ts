import type { LocationPrecision, LookupStatus, RiskLevel } from '../types/api'

export const formatPercent = (value: number) => `${value.toFixed(0)}%`

export const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value)

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export const formatRiskLabel = (riskLevel: RiskLevel) =>
  `${riskLevel.charAt(0)}${riskLevel.slice(1).toLowerCase()} risk`

export const formatLookupStatus = (status: LookupStatus) => {
  if (status === 'VALID') return 'Valid Number'
  if (status === 'UNKNOWN') return 'Unknown Status'
  return 'Invalid Number'
}

export const getRiskTone = (value: number | RiskLevel) => {
  if (typeof value === 'number') {
    if (value >= 75) return 'high'
    if (value >= 40) return 'medium'
    return 'low'
  }

  if (value === 'HIGH') return 'high'
  if (value === 'MEDIUM') return 'medium'
  return 'low'
}

export const getStatusTone = (status: LookupStatus) => {
  if (status === 'VALID') return 'low'
  if (status === 'UNKNOWN') return 'medium'
  return 'high'
}

export const formatLocationPrecision = (precision: LocationPrecision) => {
  if (precision === 'AREA') return 'Area-level estimate'
  if (precision === 'REGION') return 'Region-level estimate'
  if (precision === 'COUNTRY') return 'Country-level estimate'
  return 'Location unavailable'
}

export const describeLocationPrecision = (precision: LocationPrecision) => {
  if (precision === 'AREA') return 'Showing an approximate service-area center, not a live GPS position.'
  if (precision === 'REGION') return 'Showing an approximate regional center. Street-level or live device location is not available.'
  if (precision === 'COUNTRY') return 'Only a country-level estimate is available for this number.'
  return 'No reliable map estimate is available for this number.'
}

export const formatLocationCenterLabel = (precision: LocationPrecision) => {
  if (precision === 'AREA') return 'Estimated Area Center'
  if (precision === 'REGION') return 'Estimated Region Center'
  if (precision === 'COUNTRY') return 'Estimated Country Center'
  return 'Estimated Center'
}
