import { motion } from 'framer-motion'
import type { PropsWithChildren } from 'react'
import { cn } from '../../utils/cn'

interface ButtonProps {
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  onClick?: () => void
}

export function Button({ children, className, variant = 'primary', type = 'button', disabled, onClick }: PropsWithChildren<ButtonProps>) {
  const variants = {
    primary: 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)] hover:brightness-110',
    secondary: 'glass-panel text-slate-100 hover:border-blue-400/30 hover:bg-white/10',
    ghost: 'bg-transparent text-slate-300 hover:bg-white/6',
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn('inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60', variants[variant], className)}
    >
      {children}
    </motion.button>
  )
}
