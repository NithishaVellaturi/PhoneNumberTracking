import { CalendarClock, KeyRound, LogOut, ShieldCheck, UserCog } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { authService } from '../services/auth-service'
import { useAuthStore } from '../store/auth-store'
import { useToastStore } from '../store/toast-store'
import { formatDateTime } from '../utils/format'

export function SettingsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const expiresAt = useAuthStore((state) => state.expiresAt)
  const clearSession = useAuthStore((state) => state.clearSession)
  const pushToast = useToastStore((state) => state.pushToast)

  const handleLogout = async () => {
    await authService.logout()
    clearSession()
    pushToast({
      tone: 'info',
      title: 'Signed out',
      description: 'Your session has been closed securely.',
    })
    navigate('/auth/login', { replace: true })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="rounded-3xl"><div className="mb-6 flex items-center gap-3"><UserCog className="h-5 w-5 text-blue-300" /><h2 className="text-xl font-semibold text-white">Profile</h2></div><div className="space-y-4 text-sm text-slate-300"><div className="rounded-2xl border border-white/8 bg-slate-950/50 px-4 py-4"><span className="block text-slate-500">Name</span><span className="mt-2 block text-white">{user?.name ?? 'Unavailable'}</span></div><div className="rounded-2xl border border-white/8 bg-slate-950/50 px-4 py-4"><span className="block text-slate-500">Email</span><span className="mt-2 block text-white">{user?.email ?? 'Unavailable'}</span></div><div className="rounded-2xl border border-white/8 bg-slate-950/50 px-4 py-4"><span className="block text-slate-500">Company</span><span className="mt-2 block text-white">{user?.company || 'Not provided'}</span></div></div></Card>
      <Card className="rounded-3xl"><div className="mb-6 flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-emerald-300" /><h2 className="text-xl font-semibold text-white">Session Security</h2></div><div className="space-y-4 text-sm text-slate-300"><div className="rounded-2xl border border-white/8 bg-slate-950/50 px-4 py-4"><span className="block text-slate-500">Role</span><span className="mt-2 block text-white">{user?.role ?? 'USER'}</span></div><div className="rounded-2xl border border-white/8 bg-slate-950/50 px-4 py-4"><div className="mb-2 flex items-center gap-2 text-slate-400"><CalendarClock className="h-4 w-4" />Last login</div><span className="block text-white">{user?.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'First session pending'}</span></div><div className="rounded-2xl border border-white/8 bg-slate-950/50 px-4 py-4"><div className="mb-2 flex items-center gap-2 text-slate-400"><KeyRound className="h-4 w-4" />Session refresh</div><span className="block text-white">{expiresAt ? `Access token refresh scheduled before ${formatDateTime(expiresAt)}` : 'No active session'}</span></div><Button onClick={() => { void handleLogout() }}><LogOut className="mr-2 h-4 w-4" />Sign out</Button></div></Card>
    </div>
  )
}
