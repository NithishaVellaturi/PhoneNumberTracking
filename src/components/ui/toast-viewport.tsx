import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '../../utils/cn'
import { useToastStore } from '../../store/toast-store'

const toneStyles = {
  success: 'border-emerald-400/30 bg-emerald-500/12 text-emerald-100',
  error: 'border-rose-400/30 bg-rose-500/12 text-rose-100',
  info: 'border-cyan-400/30 bg-cyan-500/12 text-cyan-100',
} as const

const icons = {
  success: CheckCircle2,
  error: TriangleAlert,
  info: Info,
} as const

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  useEffect(() => {
    const timeouts = toasts.map((toast) =>
      window.setTimeout(() => removeToast(toast.id), 3600),
    )

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout))
    }
  }, [removeToast, toasts])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto flex max-w-3xl flex-col gap-3 px-4">
      {toasts.map((toast) => {
        const Icon = icons[toast.tone]
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-3xl border p-4 shadow-[0_18px_50px_rgba(2,6,23,0.35)] backdrop-blur-xl',
              toneStyles[toast.tone],
            )}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{toast.title}</p>
              {toast.description ? <p className="mt-1 text-sm opacity-90">{toast.description}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded-full p-1 text-current/80 transition hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
