import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Share2, Download, Send, Globe, Heart } from 'lucide-react'
import api from '../../lib/api'
import Card, { CardContent, CardHeader, CardTitle } from '../../components/Card'
import Button from '../../components/Button'
import { useToast } from '../../components/Toast'

export function SharePage() {
  const { t, i18n } = useTranslation()
  const { success, error } = useToast()
  const isKhmer = i18n.language === 'km'

  const { data: wedding } = useQuery({
    queryKey: ['wedding-profile'],
    queryFn: async () => {
      const res = await api.get('/api/user/wedding')
      return res.data.data
    },
  })

  const slug = wedding?.slug || 'wedding'
  const publicUrl = `${window.location.origin}/i/${slug}`

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    success(t('common.copied', 'Invitation link copied to clipboard!'))
  }

  const shareTelegram = () => {
    const text = encodeURIComponent(
      `សូមគោរពអញ្ជើញចូលរួមពិធីអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ (${wedding?.groom_name_kh} & ${wedding?.bride_name_kh}):\n${publicUrl}`
    )
    window.open(`https://t.me/share/url?url=${encodeURIComponent(publicUrl)}&text=${text}`, '_blank')
  }

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`,
      '_blank'
    )
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `មង្គលការ ${wedding?.groom_name_kh} & ${wedding?.bride_name_kh}`,
          text: 'សូមគោរពអញ្ជើញចូលរួមពិធីមង្គលការរបស់យើងខ្ញុំ',
          url: publicUrl,
        })
      } catch (err) {
        console.log('Share canceled:', err)
      }
    } else {
      copyLink()
    }
  }

  const downloadQr = () => {
    const svgEl = document.getElementById('wedding-main-qr')
    if (!svgEl) return
    const svgData = new XMLSerializer().serializeToString(svgEl)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)

    const link = document.createElement('a')
    link.href = svgUrl
    link.download = `TheapKa-${slug}-QR.svg`
    link.click()
  }

  return (
    <div className="space-y-6 font-ui">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
          {t('share.title', 'Share Invitation')}
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-500">
          {t('share.subtitle', 'Send digital invitations to your loved ones and friends')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Share Links Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Share2 className="w-4 h-4 text-gold-600" />
              <span>{t('share.publicLink', 'Public Invitation Link')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Link Copy Box */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
                URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 px-3.5 py-2.5 rounded border border-cream-300 bg-cream-50 text-xs sm:text-sm font-mono text-charcoal-800 outline-none"
                />
                <Button variant="secondary" size="md" onClick={copyLink} leftIcon={Copy}>
                  {t('common.copy', 'Copy')}
                </Button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="space-y-2.5 pt-2 border-t border-cream-100">
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
                Direct Share
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={shareTelegram}
                  className="flex items-center justify-center gap-2 p-3 rounded bg-[#229ED9] text-white font-bold text-xs shadow-sm hover:opacity-90 active:scale-98 transition-all touch-target"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('share.shareTelegram', 'Telegram')}</span>
                </button>

                <button
                  type="button"
                  onClick={shareFacebook}
                  className="flex items-center justify-center gap-2 p-3 rounded bg-[#1877F2] text-white font-bold text-xs shadow-sm hover:opacity-90 active:scale-98 transition-all touch-target"
                >
                  <Globe className="w-4 h-4" />
                  <span>{t('share.shareFacebook', 'Facebook')}</span>
                </button>
              </div>

              <Button
                variant="outline"
                className="w-full text-xs font-bold mt-2"
                onClick={shareNative}
                leftIcon={Share2}
              >
                {t('share.nativeShare', 'Share via phone options')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Downloadable QR Card */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-base">
              {t('share.downloadQrCard', 'Download QR Invitation Card')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 sm:p-8">
            <div className="p-6 bg-white rounded border-2 border-dashed border-gold-300 inline-block mx-auto shadow-card space-y-3">
              <div className="w-8 h-8 rounded-full bg-gold-100 text-gold-600 flex items-center justify-center mx-auto">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <h4 className="font-moul text-sm text-gold-700">
                {wedding?.groom_name_kh} & {wedding?.bride_name_kh}
              </h4>
              <QRCodeSVG
                id="wedding-main-qr"
                value={publicUrl}
                size={180}
                bgColor="#FFFFFF"
                fgColor="#242424"
                level="Q"
                includeMargin={true}
              />
              <p className="text-[11px] text-charcoal-500 font-mono">/{slug}</p>
            </div>

            <div className="pt-2">
              <Button
                variant="gold"
                onClick={downloadQr}
                className="w-full max-w-xs mx-auto text-xs font-bold"
                leftIcon={Download}
              >
                {t('common.download', 'Download QR (SVG)')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SharePage
