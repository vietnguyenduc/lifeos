import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'

const Header: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
  const { i18n } = useTranslation()
  const { user, signOut } = useAuth()

  const switchLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <header className="bg-white shadow-sm border-b px-4 sm:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 lg:hidden"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h1 className="text-xl font-bold">Life OS</h1>
      </div>
      <button
        onClick={switchLanguage}
        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
      >
        {i18n.language === 'en' ? 'Tiếng Việt' : 'English'}
      </button>
      {user && (
        <div className="ml-3 flex items-center gap-3 text-sm text-gray-700">
          <div className="hidden sm:block truncate max-w-[180px]" title={user.email || ''}>
            {user.email}
          </div>
          <button
            onClick={signOut}
            className="px-3 py-1 rounded-md border border-slate-200 text-gray-700 hover:bg-gray-100 text-sm"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </header>
  )
}

export default Header
