import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Toast from '../ui/Toast.jsx'

const Layout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
      <Outlet />
    </main>
    <Toast />
  </div>
)

export default Layout
