import React, { useState, useEffect } from "react"
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
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
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Globe,
  CloudOff,
  RefreshCw,
  ExternalLink,
} from "lucide-react"
import { useAuthStore } from "../../auth/authStore"
import { Drawer } from "../../components/Drawer"
import Badge from "../../components/Badge"
import { subscribePendingCount, syncPendingGifts } from "../../lib/offlineQueue"
import api from "../../lib/api"
import { useToast } from "../../components/Toast"

export function DashboardLayout() {
  const { user, wedding, logout } = useAuthStore()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { success, error } = useToast()

  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  const isGuestActive = location.pathname.startsWith("/guests")
  const [guestsExpanded, setGuestsExpanded] = useState(true)
  const [collapsedFlyoutOpen, setCollapsedFlyoutOpen] = useState(false)

  // Listen to offline pending gifts count
  useEffect(() => {
    const unsub = subscribePendingCount((count) => {
      setPendingCount(count)
    })
    return unsub
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserDropdownOpen(false)
    setCollapsedFlyoutOpen(false)
  }, [location.pathname])

  // Automatically keep guest dropdown open when on any guest route
  useEffect(() => {
    if (location.pathname.startsWith("/guests")) {
      setGuestsExpanded(true)
    }
  }, [location.pathname])

  const handleManualSync = async () => {
    if (isSyncing || pendingCount === 0) return
    setIsSyncing(true)
    try {
      const res = await syncPendingGifts(async (item) => {
        await api.post("/api/user/gifts", item)
      })
      if (res.synced > 0) {
        success(`បាន Sync ចំណងដៃ ${res.synced} ដោយជោគជ័យ`)
      }
    } catch (err) {
      error("ការ Sync មានបញ្ហា សូមព្យាយាមម្តងទៀត")
    } finally {
      setIsSyncing(false)
    }
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === "km" ? "en" : "km"
    i18n.changeLanguage(newLang)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Grouped navigation matching admin structure
  const navGroups = [
    {
      key: "overview",
      label: i18n.language === "km" ? "ទិដ្ឋភាពទូទៅ" : "Overview",
      items: [
        { to: "/", label: t("dashboard.welcome", "Dashboard"), icon: LayoutDashboard },
        { to: "/wedding", label: t("wedding.title", "Wedding Profile"), icon: Heart },
        { to: "/schedule", label: t("schedule.title", "Program Schedule"), icon: Calendar },
      ],
    },
    {
      key: "invitations",
      label: i18n.language === "km" ? "ធៀបការ & ភ្ញៀវ" : "Invitations & Guests",
      items: [
        { to: "/invitation", label: t("invitation.title", "Design & Template"), icon: Palette },
        {
          key: "guests-dropdown",
          label: i18n.language === "km" ? "ភ្ញៀវកិត្តិយស" : "Guests",
          icon: Users,
          isDropdown: true,
          subItems: [
            {
              to: "/guests",
              label: t("guests.title", "Guest List"),
              icon: Users,
              end: true,
            },
            {
              to: "/guests/groups",
              label: t("groups.title", "Guest Groups"),
              icon: FolderKanban,
              end: false,
            },
          ],
        },
        { to: "/qr", label: t("qr.title", "QR Check-in"), icon: QrCode },
        {
          to: "/gifts",
          label: t("gifts.title", "Monetary Gifts"),
          icon: Gift,
          badge: pendingCount > 0 ? `${pendingCount}` : null,
        },
      ],
    },
    {
      key: "media",
      label: i18n.language === "km" ? "កម្មវិធី & មេឌា" : "Event & Media",
      items: [
        { to: "/gallery", label: t("gallery.title", "Photo Gallery"), icon: ImageIcon },
        { to: "/location", label: t("location.title", "Venue & Map"), icon: MapPin },
        { to: "/share", label: t("share.title", "Share Invitation"), icon: Share2 },
      ],
    },
    {
      key: "system",
      label: i18n.language === "km" ? "ការកំណត់" : "Preferences",
      items: [
        { to: "/settings", label: t("settings.title", "Settings"), icon: Settings },
      ],
    },
  ]

  // Flattened items for mobile drawer
  const allNavItems = navGroups.flatMap((g) =>
    g.items.flatMap((item) => (item.isDropdown ? item.subItems : [item]))
  )

  // Mobile bottom tab bar items (Top 4 most used screens + More drawer)
  const mobileTabs = [
    { to: "/", label: "ផ្ទាំងដើម", icon: LayoutDashboard },
    { to: "/guests", label: "ភ្ញៀវ", icon: Users },
    {
      to: "/gifts",
      label: "ចំណងដៃ",
      icon: Gift,
      badge: pendingCount > 0 ? `${pendingCount}` : null,
    },
    { to: "/invitation", label: "ធៀបការ", icon: Palette },
  ]

  return (
    <div className="h-screen h-dvh bg-slate-50 flex flex-col overflow-hidden antialiased font-sans">
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-2xs lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* 1. Sleek Dark Slate Sidebar (Matching theapka-admin) */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-200 select-none lg:static lg:h-full lg:shrink-0
            ${mobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
            ${isCollapsed ? "lg:w-20" : "lg:w-64"}
          `}
        >
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
            <NavLink to="/" className="flex items-center gap-3">
              <img
                src="/TK.jpeg"
                alt="TheapKa"
                className="w-9 h-9 rounded object-cover shadow-md shrink-0 border border-brand-gold-400/50"
              />
              {(!isCollapsed || mobileMenuOpen) && (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white tracking-tight leading-tight">
                    {t("common.appName", "TheapKa Online")}
                  </span>
                  <span className="text-[10px] text-brand-gold-400 font-medium">
                    Couple Wedding Portal
                  </span>
                </div>
              )}
            </NavLink>

            {/* Desktop collapse button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Groups */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {navGroups.map((group) => (
              <div key={group.key} className="space-y-1">
                {(!isCollapsed || mobileMenuOpen) && (
                  <div className="px-3 mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {group.label}
                    </span>
                  </div>
                )}

                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    if (item.isDropdown) {
                      const Icon = item.icon
                      return (
                        <div key={item.key} className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              if (isCollapsed && !mobileMenuOpen) {
                                setCollapsedFlyoutOpen(!collapsedFlyoutOpen)
                              } else {
                                setGuestsExpanded(!guestsExpanded)
                              }
                            }}
                            title={isCollapsed && !mobileMenuOpen ? item.label : undefined}
                            className={`
                              w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-all group relative cursor-pointer
                              ${
                                isGuestActive
                                  ? "bg-slate-800/90 text-white font-semibold"
                                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
                              }
                              ${isCollapsed && !mobileMenuOpen ? "justify-center px-2" : ""}
                            `}
                          >
                            <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                            {(!isCollapsed || mobileMenuOpen) && (
                              <>
                                <span className="truncate flex-1 text-left">{item.label}</span>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ease-in-out ${
                                    guestsExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </>
                            )}
                          </button>

                          {/* Collapsed flyout popup on desktop */}
                          {isCollapsed && !mobileMenuOpen && collapsedFlyoutOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setCollapsedFlyoutOpen(false)}
                              />
                              <div className="absolute left-full top-0 ml-2 w-48 rounded bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 animate-popup-scale">
                                <div className="px-3 py-1.5 border-b border-slate-800 mb-1">
                                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                                    {item.label}
                                  </span>
                                </div>
                                {item.subItems.map((sub) => {
                                  const SubIcon = sub.icon
                                  return (
                                    <NavLink
                                      key={sub.to}
                                      to={sub.to}
                                      end={sub.end}
                                      onClick={() => setCollapsedFlyoutOpen(false)}
                                      className={({ isActive }) => `
                                        flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-all
                                        ${
                                          isActive
                                            ? "bg-brand-emerald-700 text-white font-semibold shadow-sm"
                                            : "text-slate-300 hover:text-white hover:bg-slate-800"
                                        }
                                      `}
                                    >
                                      <SubIcon className="w-3.5 h-3.5 shrink-0" />
                                      <span className="truncate">{sub.label}</span>
                                    </NavLink>
                                  )
                                })}
                              </div>
                            </>
                          )}

                          {/* Expanded sub-items accordion with smooth CSS grid transition */}
                          {(!isCollapsed || mobileMenuOpen) && (
                            <div
                              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                                guestsExpanded
                                  ? "grid-rows-[1fr] opacity-100"
                                  : "grid-rows-[0fr] opacity-0 pointer-events-none"
                              }`}
                            >
                              <div className="overflow-hidden">
                                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-slate-800 ml-5 my-0.5">
                              {item.subItems.map((sub) => {
                                const SubIcon = sub.icon
                                return (
                                  <NavLink
                                    key={sub.to}
                                    to={sub.to}
                                    end={sub.end}
                                    className={({ isActive }) => `
                                      flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium transition-all group
                                      ${
                                        isActive
                                          ? "bg-brand-emerald-700 text-white shadow-sm font-semibold"
                                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                                      }
                                    `}
                                  >
                                    <SubIcon className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
                                    <span className="truncate">{sub.label}</span>
                                  </NavLink>
                                )
                              })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    }

                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/"}
                        title={isCollapsed && !mobileMenuOpen ? item.label : undefined}
                        className={({ isActive }) => `
                          flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-all group relative
                          ${
                            isActive
                              ? "bg-brand-emerald-700 text-white shadow-sm font-semibold"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
                          }
                          ${isCollapsed && !mobileMenuOpen ? "justify-center px-2" : ""}
                        `}
                      >
                        <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                        {(!isCollapsed || mobileMenuOpen) && (
                          <span className="truncate flex-1">{item.label}</span>
                        )}
                        {(!isCollapsed || mobileMenuOpen) && item.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer User Info */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/50">
            <div className={`flex items-center gap-3 p-2 rounded transition-colors ${isCollapsed && !mobileMenuOpen ? "justify-center" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-brand-emerald-800 text-brand-gold-300 font-bold text-xs flex items-center justify-center border border-brand-gold-400/30 shrink-0">
                {user?.name?.[0] || "C"}
              </div>
              {(!isCollapsed || mobileMenuOpen) && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate leading-tight">
                    {user?.name || "Couple Account"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {wedding?.slug ? `/i/${wedding.slug}` : "theapka.com"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* 2. Main Body */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Topbar */}
          <header className="h-16 shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between z-30 shadow-2xs">
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 touch-target"
                aria-label="Open mobile menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Live Wedding Status & Invitation Link */}
              {wedding?.slug && (
                <a
                  href={`/i/${wedding.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-emerald-50 border border-brand-emerald-200/60 text-xs font-semibold text-brand-emerald-800 hover:bg-brand-emerald-100/70 transition-colors shadow-2xs"
                  title="Open live invitation website"
                >
                  <span className="w-2 h-2 rounded-full bg-brand-emerald-600 animate-pulse" />
                  <span className="truncate max-w-[150px] sm:max-w-xs">
                    {wedding.groom_name_kh} & {wedding.bride_name_kh}
                  </span>
                  <ExternalLink className="w-3 h-3 text-brand-emerald-700" />
                </a>
              )}
            </div>

            {/* Right Topbar actions */}
            <div className="flex items-center gap-3">
              {/* Offline Gifts Sync Indicator */}
              {pendingCount > 0 && (
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
                  title="Sync offline gifts"
                >
                  <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>{pendingCount}</span>
                  {isSyncing && <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />}
                </button>
              )}

              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                title="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5 text-brand-emerald-700" />
                <span>{i18n.language === "km" ? "ភាសាខ្មែរ" : "EN"}</span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-emerald-100 text-brand-emerald-800 font-bold text-xs flex items-center justify-center border border-brand-emerald-200">
                    {user?.name?.[0] || "C"}
                  </div>
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded bg-white shadow-xl border border-slate-200 p-2 z-50 animate-popup-scale origin-top-right">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {user?.name || "Couple Account"}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {user?.email || user?.phone || ""}
                        </p>
                      </div>

                      {wedding?.slug && (
                        <a
                          href={`/i/${wedding.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          <span>{i18n.language === "km" ? "មើលធៀបការ" : "View Invitation"}</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>{t("auth.logout", "Log Out")}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 md:pb-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 flex items-center justify-around py-1.5 px-2 shadow-sm mobile-bottom-nav">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.to
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === "/"}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded transition-colors min-w-[56px] ${
                isActive ? "text-brand-emerald-700 font-semibold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.4px]" : ""}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1">{tab.label}</span>
            </NavLink>
          )
        })}

        {/* More button to open bottom drawer */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded text-slate-500 hover:text-slate-800 min-w-[56px]"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1">ផ្សេងៗ</span>
        </button>
      </nav>

      {/* Mobile Drawer (More Navigation) */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title={t("common.appName", "TheapKa Online")}
        position="bottom"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            {allNavItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.to
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 p-3 rounded border text-xs font-medium transition-all
                    ${
                      isActive
                        ? "bg-brand-emerald-50 border-brand-emerald-200 text-brand-emerald-800 font-semibold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }
                  `}
                >
                  <Icon className="w-4 h-4 text-brand-emerald-700 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              )
            })}
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Globe className="w-4 h-4 text-brand-emerald-700" />
              <span>{i18n.language === "km" ? "Language: English" : "ភាសា: ភាសាខ្មែរ"}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 rounded text-xs font-medium hover:bg-rose-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("auth.logout", "Log out")}</span>
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  )
}

export default DashboardLayout
