import React from 'react'
import { useTranslation } from 'react-i18next'

const Header: React.FC = () => {
  const { i18n } = useTranslation()

  const switchLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold">Life OS</h1>
      <button
        onClick={switchLanguage}
        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
      >
        {i18n.language === 'en' ? 'Tiếng Việt' : 'English'}
      </button>
    </header>
  )
}

export default Header
