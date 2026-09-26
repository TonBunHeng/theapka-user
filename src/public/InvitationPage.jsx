import React, { useState, useEffect } from 'react'
import { useParams, useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import TemplateRenderer from '../templates/TemplateRenderer'
import GuestQrCard from './GuestQrCard'
import { Skeleton } from '../components/Skeleton'
import { useToast } from '../components/Toast'

export function PublicInvitationPage() {
  const { slug, token } = useParams()
  const { i18n } = useTranslation()
  const outletCtx = useOutletContext() || {}
  const [activeLang, setActiveLang] = useState(outletCtx.lang || i18n.language || 'km')

  useEffect(() => {
    if (outletCtx.lang) {
      setActiveLang(outletCtx.lang)
    }
  }, [outletCtx.lang])

  useEffect(() => {
    const handleLanguageChanged = (lng) => setActiveLang(lng)
    i18n.on('languageChanged', handleLanguageChanged)
    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [i18n])
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)

  // Fetch invitation data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-invitation', slug, token],
    queryFn: async () => {
      const endpoint = token
        ? `/api/public/invitation/${slug}/${token}`
        : `/api/public/invitation/${slug}`
      try {
        const res = await api.get(endpoint)
        return res.data.data
      } catch (err) {
        // If token failed, fallback to generic invitation (never an error screen)
        if (token) {
          const fallbackRes = await api.get(`/api/public/invitation/${slug}`)
          return fallbackRes.data.data
        }
        throw err
      }
    },
    retry: 1,
  })

  // Use the bundled song so playback does not depend on a remote MP3 host.
  useEffect(() => {
    if (data && window.__setWeddingMusic) {
      window.__setWeddingMusic(data.wedding?.music_url || '/music/ភ្ជាប់និស្ស័យ.mp3')
    }
  }, [data])

  // Lock scroll + ESC to close welcome overlay
  useEffect(() => {
    if (!showWelcome) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && setShowWelcome(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [showWelcome])

  // RSVP Mutation
  const rsvpMutation = useMutation({
    mutationFn: async (payload) => {
      const activeToken = data?.guest?.token || token || 'guest'
      const res = await api.post(`/api/public/invitation/${activeToken}/rsvp`, payload)
      return res.data.data
    },
    onSuccess: () => {
      success(
        i18n.language === 'km'
          ? 'សូមអរគុណ! ការឆ្លើយតបរបស់អ្នកត្រូវបានកត់ត្រាទុក'
          : 'Thank you! Your RSVP has been recorded.'
      )
      queryClient.invalidateQueries({ queryKey: ['public-invitation', slug, token] })
    },
    onError: () => {
      error(
        i18n.language === 'km'
          ? 'មិនអាចបញ្ជូនការឆ្លើយតបបានទេ'
          : 'Could not submit RSVP. Please try again.'
      )
    },
  })

  // Wish Mutation
  const wishMutation = useMutation({
    mutationFn: async (payload) => {
      const activeToken = data?.guest?.token || token || 'general'
      const res = await api.post(`/api/public/invitation/${activeToken}/wish`, payload)
      return res.data.data
    },
    onSuccess: () => {
      success(
        i18n.language === 'km'
          ? 'សូមអរគុណសម្រាប់ពាក្យជូនពរ!'
          : 'Thank you for your warm blessing!'
      )
      queryClient.invalidateQueries({ queryKey: ['public-invitation', slug, token] })
    },
    onError: () => {
      error(
        i18n.language === 'km'
          ? 'មិនអាចផ្ញើពាក្យជូនពរបានទេ'
          : 'Could not send wish. Please try again.'
      )
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-6 space-y-6">
        <Skeleton className="w-16 h-16 rounded-full" />
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-64 w-80 max-w-full rounded" />
        <Skeleton className="h-4 w-48" />
      </div>
    )
  }

  // Graceful fallback if completely unresolvable
  if (isError || !data?.wedding) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-6 text-center font-ui">
        <div className="w-16 h-16 rounded bg-gold-100 text-gold-700 flex items-center justify-center text-2xl font-moul mb-4">
          ធ
        </div>
        <h2 className="text-xl font-bold text-charcoal-900 mb-2">ធៀបការ អនឡាញ</h2>
        <p className="text-sm text-charcoal-600 max-w-sm">
          {i18n.language === 'km'
            ? 'មិនអាចស្វែងរកទិន្នន័យធៀបការបានទេ។ សូមពិនិត្យតំណភ្ជាប់ម្តងទៀត។'
            : 'Wedding invitation not found. Please verify the URL link.'}
        </p>
      </div>
    )
  }

  const { wedding, guest, group, schedules, gallery, wishes } = data
  const isKhmer = activeLang === 'km'
  const welcomeNames = [
    isKhmer ? (wedding?.groom_name_kh || wedding?.groom_name) : (wedding?.groom_name_en || wedding?.groom_name),
    isKhmer ? (wedding?.bride_name_kh || wedding?.bride_name) : (wedding?.bride_name_en || wedding?.bride_name),
  ].filter(Boolean)

  return (
    <>
      <TemplateRenderer
        wedding={wedding}
        guest={guest}
        schedules={schedules || []}
        gallery={gallery || []}
        wishes={wishes || []}
        templateConfig={wedding?.template_config || {}}
        onRsvpSubmit={(payload) => rsvpMutation.mutateAsync(payload)}
        onWishSubmit={(payload) => wishMutation.mutateAsync(payload)}
        onOpenQrCard={() => setIsQrModalOpen(true)}
        lang={activeLang}
      />

      {showWelcome && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowWelcome(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#f2efe9]/85 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[420px] rounded border border-[#d4af37]/90 bg-[#f8f2ea] px-6 py-7 text-center shadow-[0_18px_38px_rgba(0,0,0,0.10)]"
          >
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="h-px w-14 bg-[#d4af37] opacity-80" />
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d4af37] bg-[#f7f0e6] text-[#d4af37] shadow-sm">
                <span className="text-lg">♥</span>
              </div>
              <div className="h-px w-14 bg-[#d4af37] opacity-80" />
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#a67c2d]">
              {i18n.language === 'km' ? 'សូមគោរពអញ្ជើញ' : 'Cordially Invited'}
            </p>

            <div className="mt-5 space-y-3">
              {welcomeNames.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="font-moul text-3xl sm:text-4xl leading-tight break-words text-[#c59b27]">
                    {welcomeNames[0]}
                  </p>
                  <p className="text-xl text-[#a67c2d]">&</p>
                  <p className="font-moul text-3xl sm:text-4xl leading-tight break-words text-[#c59b27]">
                    {welcomeNames[1] || welcomeNames[0]}
                  </p>
                </div>
              ) : (
                <p className="font-moul text-2xl text-[#c59b27]">
                  {i18n.language === 'km'
                    ? 'អញ្ជើញចូលរួមពិធីមង្គលការ'
                    : 'Wedding Invitation'}
                </p>
              )}

              <div className="mx-auto mt-5 w-full max-w-[240px] rounded border border-[#d4af37] bg-[#f5eee5] px-3 py-3 shadow-sm">
                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8d6b20]">
                  {i18n.language === 'km' ? 'ភ្ញៀវកិត្តិយស' : 'Guest'}
                </p>
                <p className="mt-2 font-moul text-xl sm:text-2xl leading-tight break-words text-[#c59b27]">
                  {guest?.name || (i18n.language === 'km' ? 'ភ្ញៀវ' : 'Guest')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowWelcome(false)}
              className="mt-7 inline-flex items-center justify-center rounded-full border border-[#c9981b] bg-[#d4af37] px-9 py-3 text-sm font-semibold text-[#3b2f1c] shadow-[0_8px_18px_rgba(212,175,55,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c9981b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8d6b20] focus-visible:ring-offset-2"
            >
              {i18n.language === 'km' ? 'បន្តទៅមុខ' : 'Continue'}
            </button>
          </div>
        </div>
      )}

      {guest && (
        <GuestQrCard
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          guest={guest}
          wedding={wedding}
          group={group}
          lang={activeLang}
        />
      )}
    </>
  )
}

export default PublicInvitationPage