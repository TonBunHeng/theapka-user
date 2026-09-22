import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Gift,
  Search,
  Plus,
  CloudOff,
  RefreshCw,
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Wallet,
  QrCode,
  UserCheck,
  Building,
  User,
} from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../auth/authStore'
import Card, { CardContent, CardHeader, CardTitle } from '../../components/Card'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import Select from '../../components/Select'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'
import { SkeletonCard, SkeletonTable } from '../../components/Skeleton'
import {
  formatCurrency,
  formatDate,
  toKhmerNumeral,
} from '../../lib/format'
import {
  generateClientUuid,
  enqueueGift,
  syncPendingGifts,
  subscribePendingCount,
} from '../../lib/offlineQueue'
import { useToast } from '../../components/Toast'

const QUICK_AMOUNTS_KHR = [50000, 100000, 200000, 400000, 1000000]
const QUICK_AMOUNTS_USD = [20, 50, 100, 200, 500]

export function GiftsPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const { success, error, addToast } = useToast()
  const isKhmer = i18n.language === 'km'

  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [search, setSearch] = useState('')

  // Quick Entry Form State
  const [currency, setCurrency] = useState('KHR') // 'KHR' | 'USD'
  const [guestSearchQuery, setGuestSearchQuery] = useState('')
  const [selectedGuest, setSelectedGuest] = useState(null)
  const [walkInName, setWalkInName] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('cash') // 'cash' | 'khqr' | 'transfer'
  const [recordedBy, setRecordedBy] = useState(user?.name || 'អ្នកទទួលភ្ញៀវ ១')
  const [note, setNote] = useState('')

  // Correction Modal State
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false)
  const [targetCorrectionGift, setTargetCorrectionGift] = useState(null)
  const [correctionReason, setCorrectionReason] = useState('')

  // Subscribe to offline queue pending count
  useEffect(() => {
    const unsub = subscribePendingCount((count) => setPendingCount(count))
    return unsub
  }, [])

  // Fetch guests for quick autocomplete
  const { data: guests = [] } = useQuery({
    queryKey: ['guests-list'],
    queryFn: async () => {
      const res = await api.get('/api/user/guests')
      return res.data.data
    },
  })

  // Fetch gifts list
  const { data: gifts = [], isLoading: isLoadingGifts } = useQuery({
    queryKey: ['gifts-list'],
    queryFn: async () => {
      const res = await api.get('/api/user/gifts')
      return res.data.data
    },
  })

  // Fetch gifts summary
  const { data: summary } = useQuery({
    queryKey: ['gifts-summary'],
    queryFn: async () => {
      const res = await api.get('/api/user/gifts/summary')
      return res.data.data
    },
  })

  // Guest search suggestions
  const guestSuggestions = useMemo(() => {
    if (!guestSearchQuery || guestSearchQuery.length < 1) return []
    return guests
      .filter((g) => g.name.toLowerCase().includes(guestSearchQuery.toLowerCase()))
      .slice(0, 5)
  }, [guests, guestSearchQuery])

  // Trigger sync
  const handleSync = async () => {
    if (isSyncing || pendingCount === 0) return
    setIsSyncing(true)
    try {
      const res = await syncPendingGifts(async (item) => {
        await api.post('/api/user/gifts', item)
      })
      if (res.synced > 0) {
        success(`បាន Sync ${res.synced} កំណត់ត្រាជោគជ័យ`)
        queryClient.invalidateQueries({ queryKey: ['gifts-list'] })
        queryClient.invalidateQueries({ queryKey: ['gifts-summary'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      }
    } catch (err) {
      error('ការ Sync មានបញ្ហា')
    } finally {
      setIsSyncing(false)
    }
  }

  // Handle Quick Gift Submission
  const handleRecordGift = async (e) => {
    e.preventDefault()

    const giverName = selectedGuest?.name || walkInName.trim()
    const numericAmount = parseFloat(amount)

    if (!giverName) {
      error(t('common.required', 'Please enter or select a guest name'))
      return
    }

    if (!numericAmount || numericAmount <= 0) {
      error(t('common.required', 'Please enter a valid gift amount'))
      return
    }

    const clientUuid = generateClientUuid()
    const newEntry = {
      client_uuid: clientUuid,
      guest_id: selectedGuest?.id || null,
      giver_name: giverName,
      amount: numericAmount,
      currency,
      method,
      entry_type: 'gift',
      corrects_id: null,
      note,
      recorded_by: recordedBy,
      recorded_at: new Date().toISOString(),
    }

    try {
      // 1. Save to offline IndexedDB first
      await enqueueGift(newEntry)

      // 2. Clear inputs immediately for rapid entry
      setAmount('')
      setWalkInName('')
      setSelectedGuest(null)
      setGuestSearchQuery('')
      setNote('')

      // 3. Trigger immediate sync if online
      if (navigator.onLine) {
        api
          .post('/api/user/gifts', newEntry)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['gifts-list'] })
            queryClient.invalidateQueries({ queryKey: ['gifts-summary'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
          })
          .catch((e) => console.log('Offline queue will sync later:', e))
      }

      // 4. Undo Toast for immediate correction (Section 5.9)
      addToast({
        type: 'success',
        title: t('common.success', 'Gift recorded!'),
        message: `${giverName}: ${formatCurrency(numericAmount, currency, isKhmer)}`,
        duration: 8000,
        action: {
          label: t('gifts.undo', 'Undo (បង្កើតកំណត់ត្រាកែតម្រូវ)'),
          onClick: () => {
            // Automatically record an offsetting correction entry
            handleAutomaticCorrection(newEntry)
          },
        },
      })
    } catch (err) {
      error('Failed to save gift entry')
    }
  }

  // Handle Automatic Undo Correction
  const handleAutomaticCorrection = async (originalEntry) => {
    const correctionUuid = generateClientUuid()
    const correctionEntry = {
      client_uuid: correctionUuid,
      guest_id: originalEntry.guest_id,
      giver_name: originalEntry.giver_name,
      amount: -Math.abs(originalEntry.amount), // negative amount cancels original
      currency: originalEntry.currency,
      method: originalEntry.method,
      entry_type: 'correction',
      corrects_id: originalEntry.id || originalEntry.client_uuid,
      note: 'មិនធ្វើវិញ (Undo កត់ត្រាខុស)',
      recorded_by: recordedBy,
      recorded_at: new Date().toISOString(),
    }

    await enqueueGift(correctionEntry)
    if (navigator.onLine) {
      await api.post('/api/user/gifts', correctionEntry)
      queryClient.invalidateQueries({ queryKey: ['gifts-list'] })
      queryClient.invalidateQueries({ queryKey: ['gifts-summary'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
    }
    success(t('gifts.undoSuccess', 'Correction entry recorded'))
  }

  // Handle Manual Correction Modal Submission
  const handleManualCorrectionSubmit = async (e) => {
    e.preventDefault()
    if (!targetCorrectionGift) return

    const correctionUuid = generateClientUuid()
    const correctionEntry = {
      client_uuid: correctionUuid,
      guest_id: targetCorrectionGift.guest_id,
      giver_name: targetCorrectionGift.giver_name,
      amount: -Math.abs(targetCorrectionGift.amount),
      currency: targetCorrectionGift.currency,
      method: targetCorrectionGift.method,
      entry_type: 'correction',
      corrects_id: targetCorrectionGift.id,
      note: correctionReason || 'កែតម្រូវទិន្នន័យ',
      recorded_by: recordedBy,
      recorded_at: new Date().toISOString(),
    }

    await enqueueGift(correctionEntry)
    if (navigator.onLine) {
      await api.post('/api/user/gifts', correctionEntry)
      queryClient.invalidateQueries({ queryKey: ['gifts-list'] })
      queryClient.invalidateQueries({ queryKey: ['gifts-summary'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
    }

    setIsCorrectionModalOpen(false)
    setTargetCorrectionGift(null)
    setCorrectionReason('')
    success(t('gifts.undoSuccess', 'Correction entry recorded'))
  }

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Client UUID',
      'Giver Name',
      'Amount',
      'Currency',
      'Method',
      'Entry Type',
      'Corrects ID',
      'Recorded By',
      'Recorded At',
    ]

    const rows = gifts.map((g) => [
      g.id,
      g.client_uuid,
      `"${g.giver_name}"`,
      g.amount,
      g.currency,
      g.method,
      g.entry_type,
      g.corrects_id || '',
      `"${g.recorded_by}"`,
      g.recorded_at,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.join('\n')].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `TheapKa-Gifts-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
  }

  // Filtered gifts
  const filteredGifts = useMemo(() => {
    if (!search) return gifts
    return gifts.filter((g) =>
      g.giver_name.toLowerCase().includes(search.toLowerCase()) ||
      g.recorded_by?.toLowerCase().includes(search.toLowerCase())
    )
  }, [gifts, search])

  return (
    <div className="space-y-6 font-ui">
      {/* Header & Status Bar */}
      <PageHeader
        title={t('gifts.title', 'Gifts / ចំណងដៃ')}
        subtitle={t('gifts.subtitle', 'Fast reception gift recording with offline-first support')}
        badge={
          pendingCount > 0 ? (
            <Badge variant="warning" dot>
              Pending sync ({pendingCount})
            </Badge>
          ) : (
            <Badge variant="success" dot>
              Synced
            </Badge>
          )
        }
        actions={
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                isLoading={isSyncing}
                onClick={handleSync}
                leftIcon={RefreshCw}
              >
                Sync Now ({pendingCount})
              </Button>
            )}

            <Button variant="secondary" size="sm" onClick={handleExportCsv} leftIcon={Download}>
              {t('common.download', 'Export CSV')}
            </Button>
          </div>
        }
      />

      {/* Totals Summary Cards (Strictly Separate KHR and USD!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* KHR Total */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('gifts.totalKhr', 'Total Gifts (KHR)')}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 truncate">
                {formatCurrency(summary?.total_khr || 0, 'KHR', isKhmer)}
              </div>
              <p className="text-[11px] text-slate-500">
                {t('gifts.neverSumWarning', 'Strictly isolated currency')}
              </p>
            </div>
            <div className="w-12 h-12 rounded bg-brand-emerald-50 text-brand-emerald-700 border border-brand-emerald-200/60 flex items-center justify-center text-xl font-bold font-moul shrink-0">
              ៛
            </div>
          </CardContent>
        </Card>

        {/* USD Total */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                {t('gifts.totalUsd', 'Total Gifts (USD)')}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 truncate">
                {formatCurrency(summary?.total_usd || 0, 'USD', isKhmer)}
              </div>
              <p className="text-[11px] text-slate-500">
                {gifts.length} {isKhmer ? 'កំណត់ត្រាសរុប' : 'total entries'}
              </p>
            </div>
            <div className="w-12 h-12 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold font-serif shrink-0">
              $
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QUICK ENTRY FORM (The Primary Reception Tool) */}
      <Card className="border border-slate-200 shadow-sm bg-white">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-brand-emerald-700 text-white flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </div>
              <CardTitle className="text-base sm:text-lg text-slate-900">
                {t('gifts.quickEntry', 'Quick Gift Entry')}
              </CardTitle>
            </div>

            {/* Currency Toggle Buttons */}
            <div className="flex items-center p-1 bg-slate-100 rounded">
              <button
                type="button"
                onClick={() => setCurrency('KHR')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all touch-target ${
                  currency === 'KHR'
                    ? 'bg-brand-emerald-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ៛ KHR
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all touch-target ${
                  currency === 'USD'
                    ? 'bg-brand-emerald-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                $ USD
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          <form onSubmit={handleRecordGift} className="space-y-5 font-ui">
            {/* Guest Selection Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Search Guest Autocomplete */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('gifts.searchOrScan', 'Search Guest or Scan')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="វាយឈ្មោះភ្ញៀវក្នុងបញ្ជី..."
                    value={selectedGuest ? selectedGuest.name : guestSearchQuery}
                    onChange={(e) => {
                      setSelectedGuest(null)
                      setGuestSearchQuery(e.target.value)
                    }}
                    className="w-full px-3.5 py-2.5 rounded border border-slate-300 focus:border-brand-emerald-600 focus:ring-2 focus:ring-brand-emerald-100 text-sm font-ui outline-none"
                  />
                  {selectedGuest && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGuest(null)
                        setGuestSearchQuery('')
                      }}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {guestSuggestions.length > 0 && !selectedGuest && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded shadow-elevated border border-slate-200 z-30 divide-y divide-slate-100 overflow-hidden">
                    {guestSuggestions.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => {
                          setSelectedGuest(g)
                          setWalkInName('')
                          setGuestSearchQuery('')
                        }}
                        className="p-2.5 hover:bg-slate-100 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-900">{g.name}</span>
                        <span className="text-slate-500">{g.phone || `Token: ${g.token}`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Option B: Walk-in Giver Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('gifts.walkInGiver', 'Walk-in Name (ភ្ញៀវក្រៅបញ្ជី)')}
                </label>
                <input
                  type="text"
                  placeholder="ឈ្មោះអ្នកចងដៃក្រៅបញ្ជី..."
                  disabled={!!selectedGuest}
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded border border-slate-300 focus:border-brand-emerald-600 focus:ring-2 focus:ring-brand-emerald-100 text-sm font-ui outline-none disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Quick Amount Preset Chips */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {currency === 'KHR'
                  ? t('gifts.quickAmountsKhr', 'Quick Amounts (៛)')
                  : t('gifts.quickAmountsUsd', 'Quick Amounts ($)')}
              </label>
              <div className="flex flex-wrap gap-2">
                {(currency === 'KHR' ? QUICK_AMOUNTS_KHR : QUICK_AMOUNTS_USD).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(String(val))}
                    className={`px-3 py-2 rounded text-xs font-bold border transition-all touch-target ${
                      amount === String(val)
                        ? 'bg-brand-emerald-700 border-brand-emerald-800 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {formatCurrency(val, currency, isKhmer)}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input (Large Tap Target & Keypad) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('gifts.amount', 'Gift Amount')} ({currency}) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={currency === 'USD' ? '0.01' : '1000'}
                    required
                    placeholder={currency === 'KHR' ? '100000' : '50'}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-14 px-4 text-2xl sm:text-3xl font-bold font-mono rounded border border-slate-300 focus:border-brand-emerald-600 focus:ring-2 focus:ring-brand-emerald-100 outline-none"
                  />
                  <div className="absolute right-4 top-4 font-bold text-slate-400">
                    {currency === 'KHR' ? '៛' : '$'}
                  </div>
                </div>
              </div>

              {/* Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('gifts.method', 'Payment Method')}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'cash', label: 'សាច់ប្រាក់' },
                    { id: 'khqr', label: 'KHQR' },
                    { id: 'transfer', label: 'ផ្ទេរ' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`h-14 rounded border text-xs font-bold flex items-center justify-center transition-all touch-target ${
                        method === m.id
                          ? 'bg-brand-emerald-700 border-brand-emerald-800 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recorder & Note Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('gifts.recorder', 'Recorded By')}
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
              />
              <Input
                label={t('common.note', 'Note (optional)')}
                placeholder="ចំណាំបន្ថែម..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full h-14 text-base font-bold shadow-card active:scale-[0.99] touch-target"
            >
              {t('gifts.recordButton', 'Record Gift Now')} ({currency})
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Append-only Policy Notice */}
      <div className="p-4 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-3 font-ui">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-0.5">ច្បាប់កត់ត្រាចំណងដៃ (Append-only Policy):</p>
          <p>{t('gifts.appendOnlyNotice', 'Gift entries cannot be edited or deleted. To correct mistakes, please use Add Correction.')}</p>
        </div>
      </div>

      {/* RECENT ENTRIES LIST */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle>{t('gifts.recentEntries', 'Recent Entries')}</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredGifts.length} {isKhmer ? 'កំណត់ត្រា' : 'records found'}
            </p>
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder={t('common.search', 'Search giver name...')}
              leftIcon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoadingGifts ? (
            <SkeletonTable rows={6} cols={6} />
          ) : filteredGifts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              {t('gifts.empty', 'No gift entries recorded yet')}
            </div>
          ) : (
            <div className="divide-y divide-cream-100 overflow-x-auto">
              {filteredGifts.map((gift) => {
                const isCorrection = gift.entry_type === 'correction' || gift.amount < 0
                return (
                  <div
                    key={gift.id || gift.client_uuid}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isCorrection ? 'bg-red-50/60' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Left Details */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCorrection
                            ? 'bg-red-100 text-red-700'
                            : gift.currency === 'USD'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-brand-emerald-50 text-brand-emerald-700'
                        }`}
                      >
                        {isCorrection ? <RotateCcw className="w-4 h-4" /> : gift.currency === 'USD' ? '$' : '៛'}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 font-ui">
                            {gift.giver_name}
                          </h4>
                          {isCorrection && (
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-red-200 text-red-800">
                              កែតម្រូវ
                            </span>
                          )}
                          <span className="text-[11px] font-semibold text-slate-500 uppercase px-1.5 py-0.2 bg-slate-100 rounded">
                            {gift.method}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{gift.recorded_by}</span>
                          <span>•</span>
                          <span>{formatDate(gift.recorded_at, 'DD/MM HH:mm', i18n.language)}</span>
                          {gift.note && <span className="text-slate-700 italic">({gift.note})</span>}
                        </div>
                      </div>
                    </div>

                    {/* Right Amount & Correction Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                      <div
                        className={`text-base sm:text-lg font-bold font-mono ${
                          isCorrection
                            ? 'text-red-600'
                            : gift.currency === 'USD'
                            ? 'text-emerald-700'
                            : 'text-brand-emerald-700'
                        }`}
                      >
                        {formatCurrency(gift.amount, gift.currency, isKhmer)}
                      </div>

                      {!isCorrection && (
                        <button
                          type="button"
                          onClick={() => {
                            setTargetCorrectionGift(gift)
                            setCorrectionReason('')
                            setIsCorrectionModalOpen(true)
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded border border-red-200 text-red-700 hover:bg-red-50 transition-colors touch-target"
                          title="Add Correction"
                        >
                          {t('gifts.correctEntry', 'កែតម្រូវ')}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MANUAL CORRECTION MODAL */}
      <Modal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        title={t('gifts.correctionTitle', 'កត់ត្រាកែតម្រូវចំណងដៃ')}
      >
        {targetCorrectionGift && (
          <form onSubmit={handleManualCorrectionSubmit} className="space-y-4 font-ui">
            <div className="p-3 bg-red-50 border border-red-200 rounded space-y-1 text-xs">
              <p className="font-bold text-red-900">
                កំណត់ត្រាដើម: {targetCorrectionGift.giver_name}
              </p>
              <p className="text-red-700">
                ចំនួនទឹកប្រាក់: {formatCurrency(targetCorrectionGift.amount, targetCorrectionGift.currency, isKhmer)}
              </p>
              <p className="text-red-600 text-[11px]">
                ការកែតម្រូវនឹងបង្កើតកំណត់ត្រាស្មើនឹង (-{targetCorrectionGift.amount}) ដើម្បីកាត់កងតាមច្បាប់ Append-only។
              </p>
            </div>

            <Input
              label={t('gifts.correctionReason', 'Reason for Correction')}
              required
              placeholder="ឧទាហរណ៍: កត់ត្រាចំនួនទឹកប្រាក់ស្ទួន..."
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setIsCorrectionModalOpen(false)}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" variant="danger">
                {t('common.confirm', 'Confirm Correction')}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default GiftsPage
