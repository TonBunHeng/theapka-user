import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar,
  Users,
  Gift,
  Globe2,
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Clock,
  HeartHandshake,
  XCircle,
  HelpCircle,
} from 'lucide-react'
import api from '../../lib/api'
import Card, { CardContent, CardHeader, CardTitle } from '../../components/Card'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import { SkeletonCard } from '../../components/Skeleton'
import { formatCurrency, getCountdown, toKhmerNumeral } from '../../lib/format'
import { useToast } from '../../components/Toast'

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const { success, error } = useToast()
  const isKhmer = i18n.language === 'km'

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const res = await api.get('/api/user/dashboard')
      return res.data.data
    },
  })

  const copyInvitationLink = () => {
    if (!data?.wedding?.slug) return
    const url = `${window.location.origin}/i/${data.wedding.slug}`
    navigator.clipboard.writeText(url)
    success(t('common.copied', 'Link copied to clipboard!'))
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse font-ui">
        <div className="h-24 bg-white rounded border border-cream-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-white rounded border border-red-200 font-ui space-y-4">
        <p className="text-red-600 font-semibold">{t('common.error', 'Failed to load dashboard data')}</p>
        <Button variant="outline" onClick={() => refetch()}>
          {t('common.retry', 'Retry')}
        </Button>
      </div>
    )
  }

  const { wedding, stats } = data
  const countdown = getCountdown(wedding?.wedding_date)

  // Checklist items completion status
  const checklist = [
    {
      title: t('dashboard.checkProfile', 'Complete couple details & family names'),
      completed: !!(wedding?.groom_father_kh && wedding?.bride_father_kh),
      to: '/wedding',
    },
    {
      title: t('dashboard.checkSchedule', 'Add wedding events schedule'),
      completed: true, // pre-seeded
      to: '/schedule',
    },
    {
      title: t('dashboard.checkGuests', 'Add your guest list'),
      completed: (stats?.total_guests || 0) > 0,
      to: '/guests',
    },
    {
      title: t('dashboard.checkInvitation', 'Customize and publish invitation'),
      completed: !!wedding?.is_published,
      to: '/invitation',
    },
    {
      title: t('dashboard.checkShare', 'Share digital invitation with guests'),
      completed: (stats?.invited || 0) > 0,
      to: '/share',
    },
  ]

  const completedCount = checklist.filter((c) => c.completed).length

  return (
    <div className="space-y-6 font-ui">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-emerald-800 bg-brand-emerald-50 border border-brand-emerald-200/60 px-2.5 py-0.5 rounded-full">
              TheapKa Online
            </span>
            {wedding?.is_published ? (
              <Badge variant="success" dot>
                {t('dashboard.published', 'Published')}
              </Badge>
            ) : (
              <Badge variant="neutral" dot>
                {t('dashboard.draft', 'Draft')}
              </Badge>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight pt-1 font-moul">
            {wedding?.groom_name_kh} & {wedding?.bride_name_kh}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600">
            {wedding?.venue_name} • {wedding?.wedding_date}
          </p>
        </div>

        {/* Public link quick actions */}
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={copyInvitationLink}
            leftIcon={Copy}
          >
            {t('dashboard.copyLink', 'Copy Link')}
          </Button>

          <a
            href={`/i/${wedding?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-brand-emerald-700 hover:bg-brand-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors rounded px-3.5 py-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t('dashboard.preview', 'Preview')}</span>
          </a>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: Countdown */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                {t('dashboard.daysCountdown', 'Countdown')}
              </span>
              <div className="w-8 h-8 rounded bg-gold-100 text-gold-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            {countdown.isPast ? (
              <div>
                <p className="text-sm font-semibold text-charcoal-600">
                  {t('dashboard.weddingPassed', 'Concluded')}
                </p>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-charcoal-900 font-ui">
                  {isKhmer ? toKhmerNumeral(countdown.days) : countdown.days}
                </span>
                <span className="text-sm text-charcoal-500">
                  {t('dashboard.days', 'days')} {isKhmer ? toKhmerNumeral(countdown.hours) : countdown.hours} {t('dashboard.hours', 'hrs')}
                </span>
              </div>
            )}
            <p className="text-[11px] text-charcoal-400">
              {wedding?.wedding_date}
            </p>
          </CardContent>
        </Card>

        {/* CARD 2: Total Guests & RSVP */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                {t('dashboard.totalGuests', 'Total Guests')}
              </span>
              <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-charcoal-900 font-ui">
                {isKhmer ? toKhmerNumeral(stats?.total_guests || 0) : stats?.total_guests || 0}
              </span>
              <span className="text-xs text-charcoal-500">នាក់ / Guests</span>
            </div>

            <div className="flex items-center gap-2 text-xs pt-1">
              <span className="text-green-600 font-semibold flex items-center gap-0.5">
                <HeartHandshake className="w-3 h-3" />
                {stats?.attending || 0}
              </span>
              <span className="text-charcoal-300">•</span>
              <span className="text-red-500 font-semibold flex items-center gap-0.5">
                <XCircle className="w-3 h-3" />
                {stats?.declined || 0}
              </span>
              <span className="text-charcoal-300">•</span>
              <span className="text-amber-500 font-semibold flex items-center gap-0.5">
                <HelpCircle className="w-3 h-3" />
                {stats?.pending || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* CARD 3: Gifts Total (KHR) */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                {t('gifts.totalKhr', 'Total Gifts (KHR)')}
              </span>
              <div className="w-8 h-8 rounded bg-brand-emerald-50 text-brand-emerald-700 flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-3xl font-extrabold text-burgundy-700 font-ui block truncate">
                {formatCurrency(stats?.gifts?.total_khr || 0, 'KHR', isKhmer)}
              </span>
            </div>

            <p className="text-[11px] text-charcoal-400">
              {t('gifts.neverSumWarning', 'Strictly isolated currency')}
            </p>
          </CardContent>
        </Card>

        {/* CARD 4: Gifts Total (USD) */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                {t('gifts.totalUsd', 'Total Gifts (USD)')}
              </span>
              <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-3xl font-extrabold text-emerald-700 font-ui block truncate">
                {formatCurrency(stats?.gifts?.total_usd || 0, 'USD', isKhmer)}
              </span>
            </div>

            <p className="text-[11px] text-charcoal-400">
              {stats?.gifts?.count || 0} {isKhmer ? 'កំណត់ត្រាចំណងដៃ' : 'gift entries'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Section: Next Step Checklist & Guest Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Step Checklist (2 Cols) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>{t('dashboard.checklistTitle', 'Next Steps Checklist')}</CardTitle>
                <p className="text-xs text-charcoal-500 font-ui mt-0.5">
                  {completedCount}/{checklist.length} {isKhmer ? 'ជំហានបានបញ្ចប់' : 'steps completed'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-bold text-xs">
                {Math.round((completedCount / checklist.length) * 100)}%
              </div>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-cream-100">
              {checklist.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.to}
                  className="flex items-center justify-between p-4 hover:bg-cream-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-charcoal-300 shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        item.completed ? 'text-charcoal-700 line-through opacity-75' : 'text-charcoal-900 font-medium'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-charcoal-400" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Guest RSVP Breakdown Card (1 Col) */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{t('dashboard.guestStats', 'RSVP Breakdown')}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3 font-ui text-sm">
                <div className="flex items-center justify-between p-3 rounded bg-cream-50">
                  <span className="text-charcoal-600">{t('dashboard.invited', 'Invited')}</span>
                  <span className="font-bold text-charcoal-900">
                    {isKhmer ? toKhmerNumeral(stats?.invited || 0) : stats?.invited || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-cream-50">
                  <span className="text-charcoal-600">{t('dashboard.opened', 'Opened Link')}</span>
                  <span className="font-bold text-charcoal-900">
                    {isKhmer ? toKhmerNumeral(stats?.opened || 0) : stats?.opened || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-green-50 text-green-800">
                  <span>{t('dashboard.attending', 'Attending')}</span>
                  <span className="font-bold">
                    {isKhmer ? toKhmerNumeral(stats?.attending || 0) : stats?.attending || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-red-50 text-red-800">
                  <span>{t('dashboard.declined', 'Declined')}</span>
                  <span className="font-bold">
                    {isKhmer ? toKhmerNumeral(stats?.declined || 0) : stats?.declined || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-amber-50 text-amber-800">
                  <span>{t('dashboard.pending', 'Pending')}</span>
                  <span className="font-bold">
                    {isKhmer ? toKhmerNumeral(stats?.pending || 0) : stats?.pending || 0}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/guests">
                  <Button variant="outline" className="w-full text-xs">
                    {t('guests.title', 'Manage Guest List')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
