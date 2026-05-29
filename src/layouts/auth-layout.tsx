import { motion } from 'framer-motion'
import { Outlet } from 'react-router-dom'
import { Logo } from '../components/common/logo'

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <div className="hero-grid relative hidden overflow-hidden border-r border-white/10 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.25),_transparent_38%)]" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Logo />
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-blue-300">Secure Intelligence</p>
            <h1 className="max-w-xl text-5xl font-semibold leading-tight text-white">Investigate phone numbers with fraud insights built for modern teams.</h1>
            <p className="max-w-lg text-slate-300">Search carriers, regions, reputation scores, and community spam reports through one premium command center.</p>
          </div>
          <div className="glass-panel max-w-md rounded-3xl p-5 text-sm text-slate-300">TrackSecure cut our phone fraud triage time by 62% across support and security workflows.</div>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center p-6 md:p-10">
        <Outlet />
      </motion.div>
    </div>
  )
}
