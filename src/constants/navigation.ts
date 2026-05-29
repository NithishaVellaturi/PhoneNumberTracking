import {
  ChartColumnBig,
  History,
  House,
  Search,
  Settings,
  ShieldAlert,
} from 'lucide-react'

export const navLinks = [
  { label: 'Home', path: '/', icon: House },
  { label: 'Dashboard', path: '/app/dashboard', icon: ChartColumnBig },
  { label: 'Track Number', path: '/app/track', icon: Search },
  { label: 'Spam Reports', path: '/app/spam-reports', icon: ShieldAlert },
  { label: 'Search History', path: '/app/history', icon: History },
  { label: 'Settings', path: '/app/settings', icon: Settings },
]

export const quickActions = [
  { title: 'Track new number', description: 'Run enriched operator and spam analysis.' },
  { title: 'Report fraud', description: 'Flag suspicious callers for the community.' },
  { title: 'Export history', description: 'Download investigation data as CSV.' },
  { title: 'Alerts', description: 'Manage real-time spam notifications.' },
]
