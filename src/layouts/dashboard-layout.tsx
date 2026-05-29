import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/dashboard/sidebar'
import { Topbar } from '../components/dashboard/topbar'

export function DashboardLayout() {
  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[288px_1fr]">
        <Sidebar />
        <main className="space-y-6"><Topbar /><Outlet /></main>
      </div>
    </div>
  )
}
