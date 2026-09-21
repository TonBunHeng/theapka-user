import React from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

export function AuthLayout() {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'km' ? 'en' : 'km'
    i18n.changeLanguage(newLang)
  }

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between relative overflow-hidden selection:bg-gold-200">
      {/* Subtle decorative background glow */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-gold-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-burgundy-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-6xl mx-auto w-full z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-gold-500 flex items-center justify-center text-white shadow-soft font-moul text-lg">
            ធ
          </div>
          <div>
            <h1 className="font-moul text-burgundy-600 text-lg leading-tight">ធៀបការ</h1>
            <p className="text-[11px] text-charcoal-500 font-serif tracking-widest uppercase">TheapKa Online</p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/80 border border-gold-200/60 shadow-sm text-xs font-medium text-charcoal-700 hover:text-charcoal-900 transition-colors font-ui"
        >
          <Globe className="w-3.5 h-3.5 text-gold-600" />
          <span>{i18n.language === 'km' ? 'English' : 'ភាសាខ្មែរ'}</span>
        </button>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center text-xs text-charcoal-500 font-ui z-10">
        <p>© {new Date().getFullYear()} TheapKa Online. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default AuthLayout
