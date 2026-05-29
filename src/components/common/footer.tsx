import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
        <p>© 2026 TrackSecure. Built for telecom intelligence teams.</p>
        <div className="flex gap-5">
          <Link to="/auth/login">Login</Link>
          <Link to="/app/dashboard">Dashboard</Link>
          <Link to="/app/settings">Settings</Link>
        </div>
      </div>
    </footer>
  )
}
