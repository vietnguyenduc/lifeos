import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type SidebarProps = { onClose?: () => void }
const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as { darkMode?: boolean }
        setDarkMode(Boolean(parsed.darkMode))
      } catch (err) {
        console.error('Failed to parse app settings', err)
      }
    }

    const handleSettings = (event: Event) => {
      const detail = (event as CustomEvent<{ darkMode?: boolean }>).detail
      if (!detail) return
      setDarkMode(Boolean(detail.darkMode))
    }

    window.addEventListener('app-settings-changed', handleSettings)
    return () => window.removeEventListener('app-settings-changed', handleSettings)
  }, [])

  const linkBase = darkMode
    ? 'text-slate-200 hover:bg-slate-800'
    : 'text-slate-700 hover:bg-gray-200'
  const panelBase = darkMode
    ? 'bg-slate-950 border-slate-800'
    : 'bg-gray-100 border-gray-200'

  return (
    <aside className={`w-64 border-r ${panelBase} min-h-screen`}>
      {onClose && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <nav className="p-4">
        <ul className="space-y-2">
          <li><Link to="/" className={`block p-2 rounded ${linkBase}`}>Dashboard</Link></li>
          <li><Link to="/finance" className={`block p-2 rounded ${linkBase}`}>Finance</Link></li>
          <li><Link to="/career" className={`block p-2 rounded ${linkBase}`}>Career</Link></li>
          <li>
            <Link to="/people" className={`flex items-center justify-between p-2 rounded ${linkBase}`}>
              <span>People</span>
              <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[12px] font-semibold shadow-sm transition-colors ${darkMode ? 'border-blue-400/60 bg-slate-900 text-blue-200 hover:border-blue-300 hover:bg-slate-800' : 'border-blue-200 bg-white text-blue-600 hover:border-blue-300 hover:bg-blue-50'}`}>
                +
              </span>
            </Link>
          </li>
          <li><Link to="/decisions" className={`block p-2 rounded ${linkBase}`}>Decisions</Link></li>
          <li><Link to="/time-energy" className={`block p-2 rounded ${linkBase}`}>Time & Energy</Link></li>
          <li><Link to="/skills" className={`block p-2 rounded ${linkBase}`}>Skills</Link></li>
          <li><Link to="/moments" className={`block p-2 rounded ${linkBase}`}>Moments</Link></li>
          <li><Link to="/vocabulary" className={`block p-2 rounded ${linkBase}`}>Vocabulary</Link></li>
          <li><Link to="/settings" className={`block p-2 rounded ${linkBase}`}>Settings</Link></li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
