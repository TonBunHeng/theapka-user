import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Search,
  Upload,
  Download,
  Copy,
  QrCode as QrIcon,
  CheckCircle,
  XCircle,
  Clock,
  HelpCircle,
  Edit2,
  Trash2,
  Send,
  Filter,
  Users,
  Eye,
} from 'lucide-react'
import api from '../../lib/api'
import Card, { CardContent } from '../../components/Card'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import Select from '../../components/Select'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'
import { SkeletonTable } from '../../components/Skeleton'
import GuestQrCard from '../../public/GuestQrCard'
import { formatPhone, toKhmerNumeral } from '../../lib/format'
import { useToast } from '../../components/Toast'

export function GuestsPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  const isKhmer = i18n.language === 'km'

  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [selectedSide, setSelectedSide] = useState('all')
  const [selectedRsvp, setSelectedRsvp] = useState('all')

  // Modals
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false)
  const [editingGuest, setEditingGuest] = useState(null)
  const [guestFormData, setGuestFormData] = useState({
    name: '',
    phone: '',
    group_id: 1,
    side: 'groom',
    seats: 2,
  })

  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [csvPreviewRows, setCsvPreviewRows] = useState([])
  const [csvRawText, setCsvRawText] = useState('')

  const [selectedQrGuest, setSelectedQrGuest] = useState(null)

  // Fetch guests, groups, wedding
  const { data: guests = [], isLoading: isLoadingGuests } = useQuery({
    queryKey: ['guests-list'],
    queryFn: async () => {
      const res = await api.get('/api/user/guests')
      return res.data.data
    },
  })

  const { data: groups = [] } = useQuery({
    queryKey: ['guest-groups'],
    queryFn: async () => {
      const res = await api.get('/api/user/guest-groups')
      return res.data.data
    },
  })

  const { data: wedding } = useQuery({
    queryKey: ['wedding-profile'],
    queryFn: async () => {
      const res = await api.get('/api/user/wedding')
      return res.data.data
    },
  })

  // Filtered guests
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchesSearch =
        !search ||
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.phone?.includes(search)

      const matchesGroup =
        selectedGroup === 'all' || String(g.group_id) === String(selectedGroup)

      const matchesSide = selectedSide === 'all' || g.side === selectedSide

      const matchesRsvp =
        selectedRsvp === 'all' ||
        (selectedRsvp === 'pending' && (!g.rsvp_status || g.rsvp_status === 'pending')) ||
        g.rsvp_status === selectedRsvp

      return matchesSearch && matchesGroup && matchesSide && matchesRsvp
    })
  }, [guests, search, selectedGroup, selectedSide, selectedRsvp])

  // Save guest mutation
  const saveGuestMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingGuest) {
        const res = await api.put(`/api/user/guests/${editingGuest.id}`, payload)
        return res.data.data
      } else {
        const res = await api.post('/api/user/guests', payload)
        return res.data.data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests-list'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      setIsGuestModalOpen(false)
      setEditingGuest(null)
      success(t('common.success', 'Guest saved successfully!'))
    },
    onError: () => error('Failed to save guest'),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/user/guests/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests-list'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      success(t('common.success', 'Guest removed'))
    },
  })

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (validGuests) => {
      const res = await api.post('/api/user/guests/import', { guests: validGuests })
      return res.data.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['guests-list'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      setIsImportModalOpen(false)
      setCsvPreviewRows([])
      setCsvRawText('')
      success(`បាននាំចូលភ្ញៀវ ${data.count || 0} នាក់ដោយជោគជ័យ`)
    },
  })

  const openAddGuest = () => {
    setEditingGuest(null)
    setGuestFormData({
      name: '',
      phone: '',
      group_id: groups[0]?.id || 1,
      side: 'groom',
      seats: 2,
    })
    setIsGuestModalOpen(true)
  }

  const openEditGuest = (g) => {
    setEditingGuest(g)
    setGuestFormData({
      name: g.name,
      phone: g.phone || '',
      group_id: g.group_id,
      side: g.side,
      seats: g.seats,
    })
    setIsGuestModalOpen(true)
  }

  const copyPersonalLink = (token) => {
    const slug = wedding?.slug || 'wedding'
    const url = `${window.location.origin}/i/${slug}/${token}`
    navigator.clipboard.writeText(url)
    success(t('common.copied', 'Personal invitation link copied!'))
  }

  const toggleSentStatus = async (guest) => {
    const nextSentAt = guest.sent_at ? null : new Date().toISOString()
    await api.put(`/api/user/guests/${guest.id}`, { sent_at: nextSentAt })
    queryClient.invalidateQueries({ queryKey: ['guests-list'] })
  }

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Name', 'Phone', 'Group', 'Side', 'Seats', 'RSVP Status', 'Token', 'Invitation Link']
    const rows = filteredGuests.map((g) => {
      const groupName = groups.find((gr) => gr.id === g.group_id)?.name || ''
      const link = `${window.location.origin}/i/${wedding?.slug || 'wedding'}/${g.token}`
      return [
        g.id,
        `"${g.name}"`,
        `"${g.phone || ''}"`,
        `"${groupName}"`,
        g.side,
        g.seats,
        g.rsvp_status || 'pending',
        g.token,
        `"${link}"`,
      ].join(',')
    })

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `TheapKa-Guests-${wedding?.slug || 'list'}.csv`
    link.click()
  }

  // Handle CSV file drop / text input
  const handleCsvFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === 'string') {
        parseCsv(text)
      }
    }
    reader.readAsText(file)
  }

  const parseCsv = (text) => {
    setCsvRawText(text)
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
    if (lines.length <= 1) {
      setCsvPreviewRows([])
      return
    }

    // Assume header row on line 0
    const dataLines = lines.slice(1)
    const parsed = dataLines.map((line, idx) => {
      const cols = line.split(',').map((c) => c.replace(/^["']|["']$/g, '').trim())
      const name = cols[0] || ''
      const phone = cols[1] || ''
      const side = cols[3]?.toLowerCase() === 'bride' ? 'bride' : 'groom'
      const seats = parseInt(cols[4], 10) || 2

      const isValid = !!name && name.length >= 2
      return {
        rowIdx: idx + 1,
        name,
        phone,
        group_id: groups[0]?.id || 1,
        side,
        seats,
        isValid,
        error: !isValid ? 'Name is required (min 2 chars)' : null,
      }
    })

    setCsvPreviewRows(parsed)
  }

  const rsvpBadge = (status) => {
    switch (status) {
      case 'attending':
        return <Badge variant="success" dot>{isKhmer ? 'ចូលរួម' : 'Attending'}</Badge>
      case 'declined':
        return <Badge variant="danger" dot>{isKhmer ? 'មិនចូលរួម' : 'Declined'}</Badge>
      case 'maybe':
        return <Badge variant="warning" dot>{isKhmer ? 'មិនច្បាស់' : 'Maybe'}</Badge>
      default:
        return <Badge variant="neutral" dot>{isKhmer ? 'រង់ចាំ' : 'Pending'}</Badge>
    }
  }

  return (
    <div className="space-y-6 font-ui">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
            {t('guests.title', 'Guest List')}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500">
            {t('guests.totalCount', { count: guests.length })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleExportCsv} leftIcon={Download}>
            {t('guests.exportCsv', 'Export CSV')}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            leftIcon={Upload}
          >
            {t('guests.importCsv', 'Import CSV')}
          </Button>

          <Button variant="primary" size="sm" onClick={openAddGuest} leftIcon={Plus}>
            {t('guests.addGuest', 'Add Guest')}
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <Input
              placeholder={t('common.search', 'Search name or phone...')}
              leftIcon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Group Filter */}
            <Select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
              <option value="all">{t('common.all', 'All Groups')}</option>
              {groups.map((grp) => (
                <option key={grp.id} value={grp.id}>
                  {grp.name}
                </option>
              ))}
            </Select>

            {/* Side Filter */}
            <Select value={selectedSide} onChange={(e) => setSelectedSide(e.target.value)}>
              <option value="all">{t('common.all', 'All Sides')}</option>
              <option value="groom">{t('guests.sideGroom', "Groom's Side")}</option>
              <option value="bride">{t('guests.sideBride', "Bride's Side")}</option>
            </Select>

            {/* RSVP Filter */}
            <Select value={selectedRsvp} onChange={(e) => setSelectedRsvp(e.target.value)}>
              <option value="all">{t('common.all', 'All RSVPs')}</option>
              <option value="attending">{t('dashboard.attending', 'Attending')}</option>
              <option value="declined">{t('dashboard.declined', 'Declined')}</option>
              <option value="maybe">{t('public.maybe', 'Maybe')}</option>
              <option value="pending">{t('dashboard.pending', 'Pending')}</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Table / Mobile Cards */}
      {isLoadingGuests ? (
        <SkeletonTable rows={8} cols={6} />
      ) : filteredGuests.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('guests.empty', 'No guests found')}
          description="សាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬបន្ថែមភ្ញៀវថ្មី"
          actionLabel={t('guests.addGuest', 'Add Guest')}
          onAction={openAddGuest}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl border border-gold-200/50 shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('guests.guestName', 'Name')}</TableHead>
                  <TableHead>{t('guests.group', 'Group')}</TableHead>
                  <TableHead>{t('guests.side', 'Side')}</TableHead>
                  <TableHead className="text-center">{t('guests.seats', 'Seats')}</TableHead>
                  <TableHead>{t('guests.rsvpStatus', 'RSVP')}</TableHead>
                  <TableHead>{t('guests.sentStatus', 'Sent')}</TableHead>
                  <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.map((guest) => {
                  const grp = groups.find((g) => g.id === guest.group_id)
                  return (
                    <TableRow key={guest.id}>
                      <TableCell>
                        <div className="font-bold text-charcoal-900 font-ui">{guest.name}</div>
                        {guest.phone && (
                          <div className="text-xs text-charcoal-500 font-mono">
                            {formatPhone(guest.phone)}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        {grp && (
                          <span
                            className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: grp.color || '#C59B27' }}
                          >
                            {grp.name}
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="text-xs font-medium text-charcoal-700">
                          {guest.side === 'groom'
                            ? t('guests.sideGroom', 'Groom')
                            : t('guests.sideBride', 'Bride')}
                        </span>
                      </TableCell>

                      <TableCell className="text-center font-bold">
                        {isKhmer ? toKhmerNumeral(guest.seats) : guest.seats}
                      </TableCell>

                      <TableCell>{rsvpBadge(guest.rsvp_status)}</TableCell>

                      <TableCell>
                        <button
                          type="button"
                          onClick={() => toggleSentStatus(guest)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                            guest.sent_at
                              ? 'bg-green-100 text-green-800'
                              : 'bg-cream-100 text-charcoal-500 hover:bg-cream-200'
                          }`}
                        >
                          {guest.sent_at ? t('guests.sent', 'Sent') : t('guests.notSent', 'Not Sent')}
                        </button>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => copyPersonalLink(guest.token)}
                            className="p-1.5 text-charcoal-500 hover:text-burgundy-600 rounded-lg hover:bg-cream-100"
                            title={t('guests.copyPersonalLink', 'Copy Personal Link')}
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedQrGuest(guest)}
                            className="p-1.5 text-charcoal-500 hover:text-gold-600 rounded-lg hover:bg-cream-100"
                            title={t('guests.viewQr', 'View Guest QR')}
                          >
                            <QrIcon className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditGuest(guest)}
                            className="p-1.5 text-charcoal-500 hover:text-charcoal-900 rounded-lg hover:bg-cream-100"
                            title={t('common.edit', 'Edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(t('common.confirmDelete', 'Delete guest?'))) {
                                deleteMutation.mutate(guest.id)
                              }
                            }}
                            className="p-1.5 text-charcoal-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            title={t('common.delete', 'Delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View */}
          <div className="block md:hidden space-y-3">
            {filteredGuests.map((guest) => {
              const grp = groups.find((g) => g.id === guest.group_id)
              return (
                <Card key={guest.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-base text-charcoal-900 font-ui">
                          {guest.name}
                        </h4>
                        {guest.phone && (
                          <p className="text-xs text-charcoal-500 font-mono">
                            {formatPhone(guest.phone)}
                          </p>
                        )}
                      </div>

                      <div>{rsvpBadge(guest.rsvp_status)}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      {grp && (
                        <span
                          className="px-2.5 py-0.5 rounded-full font-semibold text-white text-[11px]"
                          style={{ backgroundColor: grp.color || '#C59B27' }}
                        >
                          {grp.name}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-cream-100 text-charcoal-700">
                        {guest.side === 'groom' ? 'ខាងប្រុស' : 'ខាងស្រី'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-cream-100 text-charcoal-700">
                        {isKhmer ? `${toKhmerNumeral(guest.seats)} កៅអី` : `${guest.seats} Seats`}
                      </span>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-cream-100">
                      <button
                        type="button"
                        onClick={() => toggleSentStatus(guest)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                          guest.sent_at ? 'text-green-700 bg-green-50' : 'text-charcoal-500 bg-cream-100'
                        }`}
                      >
                        {guest.sent_at ? '✓ បានផ្ញើ' : 'មិនទាន់ផ្ញើ'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => copyPersonalLink(guest.token)}
                          className="p-2 text-charcoal-500 hover:text-burgundy-600 rounded-lg touch-target"
                          title="Copy Link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedQrGuest(guest)}
                          className="p-2 text-charcoal-500 hover:text-gold-600 rounded-lg touch-target"
                          title="View QR"
                        >
                          <QrIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditGuest(guest)}
                          className="p-2 text-charcoal-500 hover:text-charcoal-900 rounded-lg touch-target"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Delete guest?')) {
                              deleteMutation.mutate(guest.id)
                            }
                          }}
                          className="p-2 text-charcoal-400 hover:text-red-600 rounded-lg touch-target"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* Add / Edit Guest Modal */}
      <Modal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        title={editingGuest ? t('guests.editGuest', 'Edit Guest') : t('guests.addGuest', 'Add Guest')}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            saveGuestMutation.mutate(guestFormData)
          }}
          className="space-y-4 font-ui"
        >
          <Input
            label={t('guests.guestName', 'Guest Name')}
            required
            placeholder="ឈ្មោះភ្ញៀវកិត្តិយស"
            value={guestFormData.name}
            onChange={(e) => setGuestFormData({ ...guestFormData, name: e.target.value })}
          />

          <Input
            label={t('guests.phone', 'Phone Number')}
            type="tel"
            placeholder="012 345 678"
            value={guestFormData.phone}
            onChange={(e) => setGuestFormData({ ...guestFormData, phone: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('guests.group', 'Group')}
              value={guestFormData.group_id}
              onChange={(e) =>
                setGuestFormData({ ...guestFormData, group_id: Number(e.target.value) })
              }
            >
              {groups.map((grp) => (
                <option key={grp.id} value={grp.id}>
                  {grp.name}
                </option>
              ))}
            </Select>

            <Select
              label={t('guests.side', 'Side')}
              value={guestFormData.side}
              onChange={(e) => setGuestFormData({ ...guestFormData, side: e.target.value })}
            >
              <option value="groom">{t('guests.sideGroom', "Groom's Side")}</option>
              <option value="bride">{t('guests.sideBride', "Bride's Side")}</option>
            </Select>
          </div>

          <Input
            label={t('guests.seats', 'Seats Reserved')}
            type="number"
            min="1"
            max="10"
            required
            value={guestFormData.seats}
            onChange={(e) =>
              setGuestFormData({ ...guestFormData, seats: parseInt(e.target.value, 10) || 1 })
            }
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
            <Button variant="ghost" onClick={() => setIsGuestModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={saveGuestMutation.isPending}>
              {t('common.save', 'Save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CSV Bulk Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false)
          setCsvPreviewRows([])
          setCsvRawText('')
        }}
        maxWidth="max-w-2xl"
        title={t('guests.importCsv', 'Import Guests from CSV')}
      >
        <div className="space-y-4 font-ui">
          <p className="text-xs text-charcoal-600 leading-relaxed">
            {t(
              'guests.csvUploadHint',
              'Upload a CSV file with columns: Name, Phone, Group, Side, Seats'
            )}
          </p>

          <div className="p-4 border-2 border-dashed border-gold-300 rounded-2xl bg-cream-50/60 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvFileChange}
              className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gold-500 file:text-white hover:file:bg-gold-600 cursor-pointer"
            />
          </div>

          {/* CSV Preview Table */}
          {csvPreviewRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-charcoal-800">
                  {t('guests.csvPreviewTitle', 'CSV Preview')} ({csvPreviewRows.length} rows)
                </span>
                <div className="flex gap-3">
                  <span className="text-green-600 font-semibold">
                    {csvPreviewRows.filter((r) => r.isValid).length} Valid
                  </span>
                  <span className="text-red-500 font-semibold">
                    {csvPreviewRows.filter((r) => !r.isValid).length} Invalid
                  </span>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-xl border border-cream-200 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-cream-100 font-semibold text-charcoal-700">
                    <tr>
                      <th className="p-2">Row</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Phone</th>
                      <th className="p-2">Side</th>
                      <th className="p-2">Seats</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {csvPreviewRows.slice(0, 15).map((row) => (
                      <tr key={row.rowIdx} className={row.isValid ? 'bg-white' : 'bg-red-50'}>
                        <td className="p-2 font-mono">{row.rowIdx}</td>
                        <td className="p-2 font-bold">{row.name || '-'}</td>
                        <td className="p-2 font-mono">{row.phone || '-'}</td>
                        <td className="p-2">{row.side}</td>
                        <td className="p-2">{row.seats}</td>
                        <td className="p-2">
                          {row.isValid ? (
                            <span className="text-green-600 font-semibold">Valid</span>
                          ) : (
                            <span className="text-red-600">{row.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
            <Button variant="ghost" onClick={() => setIsImportModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              variant="primary"
              disabled={csvPreviewRows.filter((r) => r.isValid).length === 0}
              isLoading={importMutation.isPending}
              onClick={() => {
                const validOnly = csvPreviewRows.filter((r) => r.isValid)
                importMutation.mutate(validOnly)
              }}
            >
              {t('common.confirm', 'Import Valid Guests')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Single Guest QR Code Modal */}
      {selectedQrGuest && (
        <GuestQrCard
          isOpen={!!selectedQrGuest}
          onClose={() => setSelectedQrGuest(null)}
          guest={selectedQrGuest}
          wedding={wedding}
          group={groups.find((gr) => gr.id === selectedQrGuest.group_id)}
          lang={i18n.language}
        />
      )}
    </div>
  )
}

export default GuestsPage
