import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10',
        props.className,
      )}
    />
  )
}
