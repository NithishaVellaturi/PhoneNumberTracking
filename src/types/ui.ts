export interface StatCardItem {
  label: string
  value: string
  delta: string
}

export interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}
