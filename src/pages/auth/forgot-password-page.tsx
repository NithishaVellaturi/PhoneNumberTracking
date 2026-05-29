import { MailCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/card'

export function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-md rounded-[32px] p-8">
      <div className="mb-8 space-y-2">
        <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Password recovery</p>
        <h1 className="text-3xl font-semibold text-white">Reset support</h1>
        <p className="text-sm text-slate-400">Password reset is outside the current API contract for this build. Sign-in support is available through your workspace administrator.</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-5 text-sm leading-7 text-slate-300">
        <MailCheck className="mb-4 h-5 w-5 text-cyan-300" />
        Reach out to your workspace administrator to rotate credentials, then return here to sign in again.
      </div>
      <p className="mt-6 text-sm text-slate-400"><Link to="/auth/login" className="text-blue-300">Back to login</Link></p>
    </Card>
  )
}
