import { Building2, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegisterForm } from '../../hooks/useAuthForm'
import { authService } from '../../services/auth-service'
import { toApiError } from '../../services/http'
import { useToastStore } from '../../store/toast-store'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'

export function RegisterPage() {
  const form = useRegisterForm()
  const navigate = useNavigate()
  const pushToast = useToastStore((state) => state.pushToast)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true)
    try {
      const response = await authService.register({
        name: values.name,
        email: values.email,
        password: values.password,
        company: values.company,
      })
      pushToast({
        tone: 'success',
        title: 'Account created',
        description: `${response.data.name}, you can sign in now.`,
      })
      navigate('/auth/login', { replace: true })
    } catch (error) {
      const apiError = toApiError(error)
      Object.entries(apiError.fieldErrors).forEach(([field, message]) => {
        form.setError(field as 'name' | 'email' | 'password' | 'confirmPassword' | 'company', { message })
      })
      pushToast({
        tone: 'error',
        title: 'Registration failed',
        description: apiError.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <Card className="w-full max-w-md rounded-[32px] p-8">
      <div className="mb-8 space-y-2"><p className="text-sm uppercase tracking-[0.35em] text-blue-300">Create workspace</p><h1 className="text-3xl font-semibold text-white">Register your team</h1><p className="text-sm text-slate-400">Create a secure account backed by the live TrackSecure API.</p></div>
      <form onSubmit={onSubmit} className="space-y-5">
        <div><div className="relative"><UserRound className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" /><Input {...form.register('name')} placeholder="Full name" className="pl-11" autoComplete="name" /></div><p className="mt-2 text-xs text-rose-300">{form.formState.errors.name?.message}</p></div>
        <div><div className="relative"><Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" /><Input {...form.register('email')} placeholder="Work email" className="pl-11" autoComplete="email" /></div><p className="mt-2 text-xs text-rose-300">{form.formState.errors.email?.message}</p></div>
        <div><div className="relative"><ShieldCheck className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" /><Input type="password" {...form.register('password')} placeholder="Create password" className="pl-11" autoComplete="new-password" /></div><p className="mt-2 text-xs text-rose-300">{form.formState.errors.password?.message}</p></div>
        <div><div className="relative"><LockKeyhole className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" /><Input type="password" {...form.register('confirmPassword')} placeholder="Confirm password" className="pl-11" autoComplete="new-password" /></div><p className="mt-2 text-xs text-rose-300">{form.formState.errors.confirmPassword?.message}</p></div>
        <div><div className="relative"><Building2 className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" /><Input {...form.register('company')} placeholder="Company name" className="pl-11" autoComplete="organization" /></div><p className="mt-2 text-xs text-rose-300">{form.formState.errors.company?.message}</p></div>
        <Button className="w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Create account'}</Button>
      </form>
      <p className="mt-6 text-sm text-slate-400">Already have access? <Link to="/auth/login" className="text-blue-300">Sign in</Link></p>
    </Card>
  )
}
