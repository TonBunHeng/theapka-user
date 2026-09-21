import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Heart,
  Calendar,
  Palette,
  Users,
  FolderKanban,
  QrCode,
  Gift,
  Image as ImageIcon,
  MapPin,
  Share2,
  Settings,
  LogOut,
  Menu,
  Globe,
  CloudOff,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { useAuthStore } from '../../auth/authStore'
import { Drawer } from '../../components/Drawer'
import { subscribePendingCount, syncPendingGifts } from '../../lib/offlineQueue'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'

export function DashboardLayout() {
  const { user, wedding, logout } = useAuthStore()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { success, error } = useToast()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  // Listen to offline pending gifts count
  useEffect(() => {
    const unsub = subscribePendingCount((count) => {
      setPendingCount(count)
    })
    return unsub
  }, [])

  const handleManualSync = async () => {
    if (isSyncing || pendingCount === 0) return
    setIsSyncing(true)
    try {
      const res = await syncPendingGifts(async (item) => {
        await api.post('/api/user/gifts', item)
      })
      if (res.synced > 0) {
        success(`បាន Sync ចំណងដៃ ${res.synced} ដោយជោគជ័យ`)
      }
    } catch (err) {
      error('ការ Sync មានបញ្ហា សូមព្យាយាមម្តងទៀត')
    } finally {
      setIsSyncing(false)
    }
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'km' ? 'en' : 'km'
    i18n.changeLanguage(newLang)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Primary desktop navigation items
  const navItems = [
    { to: '/', label: t('dashboard.welcome', 'Dashboard'), icon: LayoutDashboard },
    { to: '/wedding', label: t('wedding.title', 'Wedding Profile'), icon: Heart },
    { to: '/schedule', label: t('schedule.title', 'Schedule'), icon: Calendar },
    { to: '/invitation', label: t('invitation.title', 'Design & Publish'), icon: Palette },
    { to: '/guests', label: t('guests.title', 'Guest List'), icon: Users },
    { to: '/guests/groups', label: t('groups.title', 'Guest Groups'), icon: FolderKanban },
    { to: '/qr', label: t('qr.title', 'QR Codes'), icon: QrCode },
    {
      to: '/gifts',
      label: t('gifts.title', 'Gifts / ចំណងដៃ'),
      icon: Gift,
      badge: pendingCount > 0 ? `${pendingCount}` : null,
      badgeVariant: 'warning',
    },
    { to: '/gallery', label: t('gallery.title', 'Photo Gallery'), icon: ImageIcon },
    { to: '/location', label: t('location.title', 'Location & Map'), icon: MapPin },
    { to: '/share', label: t('share.title', 'Share Invitation'), icon: Share2 },
    { to: '/settings', label: t('settings.title', 'Settings'), icon: Settings },
  ]

  // Mobile bottom tab bar items (Top 4 most used screens + More drawer)
  const mobileTabs = [
    { to: '/', label: 'ផ្ទាំងដើម', icon: LayoutDashboard },
    { to: '/guests', label: 'ភ្ញៀវ', icon: Users },
    {
      to: '/gifts',
      label: 'ចំណងដៃ',
      icon: Gift,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    { to: '/invitation', label: 'ធៀបការ', icon: Palette },
  ]

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-gold-200/50 shadow-sm shrink-0 h-screen sticky top-0 z-30">
        {/* Brand Header */}
        <div className="p-6 border-b border-cream-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-gold-500 flex items-center justify-center text-white shadow-soft font-moul text-lg">
            ធ
          </div>
          <div>
            <h1 className="font-moul text-burgundy-600 text-base leading-tight">ធៀបការ</h1>
            <p className="text-xs text-charcoal-500 font-serif tracking-wider">THEAPKA ONLINE</p>
          </div>
        </div>

        {/* Wedding / Couple Quick Banner */}
        {wedding && (
          <div className="mx-4 my-3 p-3 bg-cream-50 rounded border border-gold-200/40 flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-xs font-semibold text-charcoal-800 font-ui truncate">
                {wedding.groom_name_kh} & {wedding.bride_name_kh}
              </p>
              <p className="text-[11px] text-gold-600 font-ui truncate">/{wedding.slug}</p>
            </div>
            {wedding.is_published && (
              <a
                href={`/i/${wedding.slug}`}
                target="_blank"
                rel="noreferrer"
                title="Open Public Link"
                className="p-1.5 text-charcoal-400 hover:text-burgundy-600 rounded hover:bg-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* Offline pending badge button in sidebar */}
        {pendingCount > 0 && (
          <div className="mx-4 mb-2 p-2.5 bg-amber-50 border border-amber-200 rounded flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-800 font-ui">
              <CloudOff className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pending sync ({pendingCount})</span>
            </div>
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="p-1 text-amber-700 hover:text-amber-900 rounded"
              title="Sync now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto font-ui">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-burgundy-50 text-burgundy-600 font-semibold shadow-sm border border-burgundy-200/50'
                      : 'text-charcoal-700 hover:bg-cream-100 hover:text-charcoal-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-cream-200 space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100 rounded transition-colors font-ui"
            >
              <Globe className="w-4 h-4 text-gold-600" />
              <span>{i18n.language === 'km' ? 'ភាសាខ្មែរ' : 'English'}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title={t('auth.logout', 'Log out')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-cream-100">
            <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-bold text-xs">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-charcoal-800 font-ui truncate">{user?.name}</p>
              <p className="text-[11px] text-charcoal-400 font-ui truncate">{user?.phone || user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gold-200/50 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-gold-500 flex items-center justify-center text-white font-moul text-sm shadow-soft">
            ធ
          </div>
          <div>
            <h1 className="font-moul text-burgundy-600 text-sm leading-tight">ធៀបការ</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <button
              type="button"
              onClick={handleManualSync}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-ui"
            >
              <CloudOff className="w-3.5 h-3.5 text-amber-600" />
              <span>{pendingCount}</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleLanguage}
            className="p-2 text-charcoal-600 hover:text-charcoal-900 rounded"
            title="Switch Language"
          >
            <Globe className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-charcoal-700 hover:text-charcoal-900 rounded touch-target flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gold-200/60 z-30 flex items-center justify-around py-1.5 px-2 shadow-card mobile-bottom-nav">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.to
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end
              className={`flex flex-col items-center justify-center py-1 px-2 rounded transition-colors min-w-[56px] touch-target ${
                isActive ? 'text-burgundy-600 font-semibold' : 'text-charcoal-500 hover:text-charcoal-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4px]' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-ui mt-1">{tab.label}</span>
            </NavLink>
          )
        })}

        {/* More button to open bottom drawer */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded text-charcoal-500 hover:text-charcoal-800 min-w-[56px] touch-target"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-ui mt-1">ផ្សេងៗ</span>
        </button>
      </nav>

      {/* Mobile Drawer (More Navigation) */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title={t('common.appName', 'TheapKa Online')}
        position="bottom"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.to
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 p-3 rounded border text-sm font-medium transition-all
                    ${
                      isActive
                        ? 'bg-burgundy-50 border-burgundy-300 text-burgundy-700 font-semibold'
                        : 'bg-cream-50/70 border-cream-200 text-charcoal-800 hover:bg-cream-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 text-gold-600 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              )
            })}
          </div>

          <div className="pt-4 border-t border-cream-200 flex items-center justify-between">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 bg-cream-100 rounded text-sm text-charcoal-800 font-ui"
            >
              <Globe className="w-4 h-4 text-gold-600" />
              <span>{i18n.language === 'km' ? 'ប្តូរភាសា: English' : 'Switch: ភាសាខ្មែរ'}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded text-sm font-ui"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('auth.logout', 'Log out')}</span>
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  )
}

export default DashboardLayout
