import type { PropsWithChildren } from 'react'
import { cn } from '../../utils/cn'

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('glass-panel rounded-3xl p-6', className)}>{children}</div>
}
