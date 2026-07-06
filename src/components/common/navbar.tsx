import { AnimatePresence, motion } from 'framer-motion'
import { LocateFixed, Menu, PhoneCall, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { navLinks } from '../../constants/navigation'
import { Button } from '../ui/button'
import { Logo } from './logo'
import { ThemeToggle } from './theme-toggle'

export function Navbar() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6 lg:px-8">
        <Link to="/"><Logo /></Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm transition hover:text-white ${location.pathname === item.path ? 'text-white' : 'text-slate-300'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link to="/current-location"><Button variant="secondary"><LocateFixed className="mr-2 h-4 w-4" />Current Location</Button></Link>
          <Link to="/dashboard"><Button variant="ghost">Analytics</Button></Link>
          <Link to="/lookup"><Button><PhoneCall className="mr-2 h-4 w-4" />Track Number</Button></Link>
        </div>
        <button className="rounded-xl border border-white/10 p-2 text-slate-100 md:hidden" onClick={() => setIsOpen((open) => !open)}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/8 md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4">
              {navLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200"
                >
                  {item.label}
                </Link>
              ))}
              <Link to="/current-location" onClick={() => setIsOpen(false)}>
                <Button variant="secondary" className="w-full"><LocateFixed className="mr-2 h-4 w-4" />Current Location</Button>
              </Link>
              <Link to="/lookup" onClick={() => setIsOpen(false)}>
                <Button className="w-full"><PhoneCall className="mr-2 h-4 w-4" />Track Number</Button>
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
