import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navLinks } from '../../constants/navigation'
import { useAppStore } from '../../store/app-store'
import { cn } from '../../utils/cn'
import { Logo } from '../common/logo'

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore()

  const content = (
    <aside className="glass-panel flex h-full w-72 flex-col rounded-r-3xl border-l-0 p-5 md:rounded-3xl">
      <div className="flex items-center justify-between">
        <Logo />
        <button className="rounded-xl p-2 text-slate-300 md:hidden" onClick={toggleSidebar}><X className="h-5 w-5" /></button>
      </div>
      <div className="mt-8 space-y-2">
        {navLinks.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => cn('flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/6 hover:text-white', isActive && 'bg-gradient-to-r from-brand-600/25 to-cyan-400/10 text-white')}>
            <item.icon className="h-4 w-4" />{item.label}
          </NavLink>
        ))}
      </div>
    </aside>
  )

  return (
    <>
      <div className="hidden md:block">{content}</div>
      <AnimatePresence>
        {sidebarOpen ? (
          <motion.div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} className="h-full max-w-72">{content}</motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
