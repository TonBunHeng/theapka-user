import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
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
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  const [isQrModalOpen, setIsQrModalOpen] = useState(false)

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

  // Set music URL in layout if present
  useEffect(() => {
    if (data?.wedding?.music_url && window.__setWeddingMusic) {
      window.__setWeddingMusic(data.wedding.music_url)
    }
  }, [data?.wedding?.music_url])

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
        <Skeleton className="h-64 w-80 max-w-full rounded-3xl" />
        <Skeleton className="h-4 w-48" />
      </div>
    )
  }

  // Graceful fallback if completely unresolvable
  if (isError || !data?.wedding) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-6 text-center font-ui">
        <div className="w-16 h-16 rounded-2xl bg-gold-100 text-gold-700 flex items-center justify-center text-2xl font-moul mb-4">
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
        lang={i18n.language}
      />

      {guest && (
        <GuestQrCard
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          guest={guest}
          wedding={wedding}
          group={group}
          lang={i18n.language}
        />
      )}
    </>
  )
}

export default PublicInvitationPage
