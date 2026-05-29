import { Outlet } from 'react-router-dom'
import { Footer } from '../components/common/footer'
import { Navbar } from '../components/common/navbar'

export function MarketingLayout() {
  return <div className="min-h-screen bg-transparent"><Navbar /><Outlet /><Footer /></div>
}
