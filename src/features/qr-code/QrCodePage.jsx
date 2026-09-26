import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { Printer, QrCode as QrIcon, Heart, Search, Filter } from 'lucide-react'
import api from '../../lib/api'
import Card, { CardContent } from '../../components/Card'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Select from '../../components/Select'
import GuestQrCard from '../../public/GuestQrCard'
import { toKhmerNumeral } from '../../lib/format'

export function QrCodePage() {
  const { t, i18n } = useTranslation()
  const isKhmer = i18n.language === 'km'

  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [selectedQrGuest, setSelectedQrGuest] = useState(null)

  const { data: guests = [] } = useQuery({
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

  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.phone?.includes(search)
    const matchesGroup =
      selectedGroup === 'all' || String(g.group_id) === String(selectedGroup)
    return matchesSearch && matchesGroup
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 font-ui">
      {/* Header (Hidden when printing) */}
      <div className="no-print">
        <PageHeader
          title={t('qr.title', 'QR Codes & Print Sheet')}
          subtitle={t('qr.subtitle', 'Download single QR codes or print A4 guest entry sheets')}
          actions={
            <Button variant="primary" onClick={handlePrint} leftIcon={Printer}>
              {t('qr.printNow', 'Print Sheet Now')}
            </Button>
          }
        />
      </div>

      {/* Filter controls (Hidden when printing) */}
      <Card className="no-print">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder={t('common.search', 'Search guest name...')}
              leftIcon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
              <option value="all">{t('common.all', 'All Groups')}</option>
              {groups.map((grp) => (
                <option key={grp.id} value={grp.id}>
                  {grp.name}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Banner (Hidden when printing) */}
      <div className="no-print p-4 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-700 leading-relaxed">
          <QrIcon className="w-5 h-5 text-brand-emerald-700 shrink-0" />
          <span>{t('qr.instructions', 'Click print to generate beautifully formatted A4 printable cards')}</span>
        </div>
        <span className="text-xs font-bold text-brand-emerald-700 font-mono">
          {filteredGuests.length} {isKhmer ? 'កាត' : 'cards'}
        </span>
      </div>

      {/* Printable Sheet Grid */}
      {/* In print mode, styles from index.css format this cleanly across A4 pages */}
      <div className="print-page grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-3 print:gap-3">
        {filteredGuests.map((guest) => {
          const grp = groups.find((g) => g.id === guest.group_id)
          const qrData = `${window.location.origin}/i/${wedding?.slug || 'wedding'}/${guest.token}`

          return (
            <div
              key={guest.id}
              onClick={() => setSelectedQrGuest(guest)}
              className="print-card bg-white rounded border border-dashed border-slate-300 p-4 text-center space-y-3 cursor-pointer hover:shadow-card transition-all"
            >
              {/* Wedding Emblem */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-gold-700 font-moul">
                <span>{wedding?.groom_name_kh} & {wedding?.bride_name_kh}</span>
              </div>

              {/* Guest Details */}
              <div className="space-y-0.5">
                <p className="text-[10px] text-charcoal-400 uppercase tracking-wider font-serif">
                  {isKhmer ? 'សូមគោរពអញ្ជើញ' : 'Invited Guest'}
                </p>
                <h4 className="font-bold text-sm text-charcoal-900 truncate">
                  {guest.name}
                </h4>
                <div className="flex items-center justify-center gap-1.5 text-[11px] pt-0.5">
                  {grp && (
                    <span
                      className="px-1.5 py-0.2 rounded-full text-white text-[10px]"
                      style={{ backgroundColor: grp.color || '#C59B27' }}
                    >
                      {grp.name}
                    </span>
                  )}
                  <span className="text-charcoal-500">
                    {isKhmer ? `${toKhmerNumeral(guest.seats)} កៅអី` : `${guest.seats} seats`}
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="p-2 bg-white rounded inline-block mx-auto border border-cream-200">
                <QRCodeSVG
                  value={qrData}
                  size={120}
                  bgColor="#FFFFFF"
                  fgColor="#242424"
                  level="M"
                />
              </div>

              <p className="text-[10px] text-charcoal-400 font-mono truncate">
                ID: {guest.token}
              </p>
            </div>
          )
        })}
      </div>

      {/* Single QR Modal */}
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

export default QrCodePage
