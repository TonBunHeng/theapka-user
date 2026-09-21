import React, { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, X, Heart, QrCode as QrIcon } from 'lucide-react'
import Modal from '../components/Modal'
import Button from '../components/Button'
import { toKhmerNumeral } from '../lib/format'

export function GuestQrCard({ isOpen, onClose, guest, wedding, group, lang = 'km' }) {
  const isKhmer = lang === 'km'
  const cardRef = useRef(null)

  if (!guest) return null

  // Value encoded in QR: unique guest token or check-in string
  const qrValue = JSON.stringify({
    token: guest.token,
    name: guest.name,
    seats: guest.seats,
  })

  const handleDownload = () => {
    // Generate simple download by grabbing the SVG
    const svgEl = document.getElementById('guest-qr-svg')
    if (!svgEl) return

    const svgData = new XMLSerializer().serializeToString(svgEl)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)

    const link = document.createElement('a')
    link.href = svgUrl
    link.download = `TheapKa-Pass-${guest.name}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm" showClose={false}>
      <div className="relative text-center space-y-4 font-ui p-2" ref={cardRef}>
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 -right-2 p-1.5 text-charcoal-400 hover:text-charcoal-700 rounded-full bg-cream-100"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wedding Couple Header */}
        <div className="space-y-1">
          <div className="w-8 h-8 rounded-full bg-gold-100 text-gold-600 flex items-center justify-center mx-auto">
            <Heart className="w-4 h-4 fill-current" />
          </div>
          <h4 className="font-moul text-sm text-gold-700">
            {wedding?.groom_name_kh} & {wedding?.bride_name_kh}
          </h4>
          <p className="text-[11px] text-charcoal-500 font-serif uppercase tracking-widest">
            {isKhmer ? 'កាត QR ចូលរួមមង្គលការ' : 'Guest Entrance Pass'}
          </p>
        </div>

        {/* Guest Details Box */}
        <div className="p-4 rounded-2xl bg-cream-50 border border-gold-200 text-center space-y-1">
          <p className="text-xs text-charcoal-500">
            {isKhmer ? 'សូមគោរពអញ្ជើញ' : 'Cordially Invited'}
          </p>
          <h3 className="text-base font-bold text-charcoal-900">{guest.name}</h3>

          <div className="flex items-center justify-center gap-2 pt-1 text-xs">
            {group && (
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
                style={{ backgroundColor: group.color || '#C59B27' }}
              >
                {group.name}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-white border border-cream-300 text-charcoal-700 text-[11px]">
              {isKhmer
                ? `កៅអី: ${toKhmerNumeral(guest.seats)}`
                : `Seats: ${guest.seats}`}
            </span>
          </div>
        </div>

        {/* QR Code */}
        <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-gold-300 inline-block mx-auto shadow-inner">
          <QRCodeSVG
            id="guest-qr-svg"
            value={qrValue}
            size={180}
            bgColor="#FFFFFF"
            fgColor="#242424"
            level="Q"
            includeMargin={true}
          />
        </div>

        <p className="text-xs text-charcoal-500 max-w-xs mx-auto leading-relaxed">
          {isKhmer
            ? 'សូមបង្ហាញ QR កូដនេះនៅតុទទួលភ្ញៀវដើម្បីពិនិត្យវត្តមាន និងកត់ត្រាចំណងដៃ'
            : 'Please present this QR code upon arrival at the reception desk'}
        </p>

        {/* Actions */}
        <div className="pt-2">
          <Button
            variant="gold"
            onClick={handleDownload}
            className="w-full py-2.5 text-xs font-bold"
            leftIcon={Download}
          >
            {isKhmer ? 'រក្សាទុករូបភាព QR' : 'Save QR Pass'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default GuestQrCard
