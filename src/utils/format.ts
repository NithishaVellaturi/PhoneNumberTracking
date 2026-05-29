import type { RiskLevel } from '../types/api'

export const formatPercent = (value: number) => `${value.toFixed(0)}%`

export const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value)

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export const formatRiskLabel = (riskLevel: RiskLevel) =>
  `${riskLevel.charAt(0)}${riskLevel.slice(1).toLowerCase()} risk`

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
