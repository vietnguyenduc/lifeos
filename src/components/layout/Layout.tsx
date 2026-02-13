import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

type AppSettings = { darkMode: boolean; childhoodTrauma: string }

const Layout: React.FC = () => {
  const [appSettings, setAppSettings] = useState<AppSettings>({ darkMode: false, childhoodTrauma: '' })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      try {
        setAppSettings(JSON.parse(savedSettings))
      } catch (err) {
        console.error('Failed to parse app settings', err)
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'appSettings' || !event.newValue) return
      try {
        setAppSettings(JSON.parse(event.newValue))
      } catch (err) {
        console.error('Failed to parse app settings', err)
      }
    }

    const handleSettings = (event: Event) => {
      const detail = (event as CustomEvent<AppSettings>).detail
      if (!detail) return
      setAppSettings(detail)
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('app-settings-changed', handleSettings)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('app-settings-changed', handleSettings)
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className={`min-h-screen ${appSettings.darkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-black/40" />
        </div>
      )}
      <div className="flex w-full">
        <div className="hidden lg:block w-64 flex-shrink-0 sticky top-16 h-screen overflow-y-auto">
          <Sidebar />
        </div>
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
        <main className="flex-1 min-w-0 w-full overflow-x-hidden p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
