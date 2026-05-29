import { cn } from '../../utils/cn'

export function Badge({ label, tone = 'low' }: { label: string; tone?: 'low' | 'medium' | 'high' | 'info' }) {
  const tones = {
    low: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20',
    medium: 'bg-amber-500/15 text-amber-300 border-amber-400/20',
    high: 'bg-rose-500/15 text-rose-300 border-rose-400/20',
    info: 'bg-blue-500/15 text-blue-300 border-blue-400/20',
  }

  return <span className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-medium', tones[tone])}>{label}</span>
}
