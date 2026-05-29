import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLoginForm } from '../../hooks/useAuthForm'
import { authService } from '../../services/auth-service'
import { toApiError } from '../../services/http'
import { useAuthStore } from '../../store/auth-store'
import { useToastStore } from '../../store/toast-store'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'

export function LoginPage() {
  const form = useLoginForm()
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const pushToast = useToastStore((state) => state.pushToast)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true)
    try {
      const response = await authService.login(values)
      setSession(response.data.user, response.data.expiresAt)
      pushToast({
        tone: 'success',
        title: 'Signed in',
        description: 'Welcome back to TrackSecure.',
      })
      navigate('/app/dashboard', { replace: true })
    } catch (error) {
      const apiError = toApiError(error)
      Object.entries(apiError.fieldErrors).forEach(([field, message]) => {
        form.setError(field as 'email' | 'password', { message })
      })
      pushToast({
        tone: 'error',
        title: 'Login failed',
        description: apiError.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <Card className="w-full max-w-md rounded-[32px] p-8">
      <div className="mb-8 space-y-2"><p className="text-sm uppercase tracking-[0.35em] text-blue-300">Welcome back</p><h1 className="text-3xl font-semibold text-white">Sign in to TrackSecure</h1><p className="text-sm text-slate-400">Access search analytics, reports, and threat intelligence.</p></div>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Email address</label>
          <div className="relative"><Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" /><Input {...form.register('email')} className="pl-11" autoComplete="email" /></div>
          <p className="mt-2 text-xs text-rose-300">{form.formState.errors.email?.message}</p>
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Password</label>
          <div className="relative"><LockKeyhole className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" /><Input type={showPassword ? 'text' : 'password'} {...form.register('password')} className="pl-11 pr-11" autoComplete="current-password" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-3 text-slate-400">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
          <p className="mt-2 text-xs text-rose-300">{form.formState.errors.password?.message}</p>
        </div>
        <Button className="w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Login securely'}</Button>
      </form>
      <div className="mt-6 flex items-center justify-between text-sm text-slate-400"><Link to="/auth/forgot-password">Forgot password?</Link><Link to="/auth/register">Create account</Link></div>
    </Card>
  )
}
