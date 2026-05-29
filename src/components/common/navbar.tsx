import { Menu, PhoneCall } from 'lucide-react'
import { Link } from 'react-router-dom'
import { navLinks } from '../../constants/navigation'
import { useAppStore } from '../../store/app-store'
import { Button } from '../ui/button'
import { Logo } from './logo'

export function Navbar() {
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.slice(0, 3).map((item) => (
            <Link key={item.path} to={item.path} className="text-sm text-slate-300 transition hover:text-white">{item.label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/auth/login"><Button variant="ghost">Login</Button></Link>
          <Link to="/app/track"><Button><PhoneCall className="mr-2 h-4 w-4" />Start Tracking</Button></Link>
        </div>
        <button className="rounded-xl border border-white/10 p-2 text-slate-100 md:hidden" onClick={toggleSidebar}><Menu className="h-5 w-5" /></button>
      </div>
    </header>
  )
}
