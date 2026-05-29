import { ShieldCheck } from 'lucide-react'

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="blue-ring flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-cyan-400">
        <ShieldCheck className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-lg font-semibold text-white">TrackSecure</p>
        <p className="text-xs text-slate-400">Phone Intelligence Suite</p>
      </div>
    </div>
  )
}
