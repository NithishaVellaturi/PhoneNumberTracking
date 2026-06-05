import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
        <p>© 2026 TrackSecure. Phone intelligence, carrier context, risk scoring, and estimated region mapping.</p>
        <div className="flex gap-5">
          <Link to="/lookup">Lookup</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/">Platform</Link>
        </div>
      </div>
    </footer>
  )
}
