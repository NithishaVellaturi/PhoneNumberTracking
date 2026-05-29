import { Bell, ChevronDown, Search } from 'lucide-react'
import { useAuthStore } from '../../store/auth-store'

export function Topbar() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm text-blue-300">Security Operations Center</p>
        <h1 className="text-3xl font-semibold text-white">Welcome back, {user?.name?.split(' ')[0]}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="glass-panel hidden items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 lg:flex"><Search className="h-4 w-4" />Search analytics, alerts, reports...</div>
        <button className="glass-panel rounded-2xl p-3 text-slate-300"><Bell className="h-4 w-4" /></button>
        <div className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 font-semibold text-white">{user?.name?.charAt(0)}</div>
          <div><p className="text-sm font-medium text-white">{user?.name}</p><p className="text-xs text-slate-400">{user?.role}</p></div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </div>
  )
}
