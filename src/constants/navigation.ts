import {
  ChartColumnBig,
  House,
  LocateFixed,
  Search,
  Sparkles,
} from 'lucide-react'

export const navLinks = [
  { label: 'Home', path: '/', icon: House },
  { label: 'Lookup', path: '/lookup', icon: Search },
  { label: 'Dashboard', path: '/dashboard', icon: ChartColumnBig },
]

export const quickActions = [
  { title: 'Track number', description: 'Run a fresh phone intelligence lookup from the public landing page.', icon: Search },
  { title: 'Use current location', description: 'Show the current browser user location directly in the app after consent.', icon: LocateFixed },
  { title: 'Review dashboard', description: 'Inspect search volume, spam signals, and top carrier trends.', icon: ChartColumnBig },
  { title: 'Open lookup history', description: 'See the most recent verified search trail for the selected number.', icon: Sparkles },
]
