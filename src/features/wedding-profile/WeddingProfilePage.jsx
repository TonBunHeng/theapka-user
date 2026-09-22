import PageHeader from '../../components/PageHeader'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, Save, CheckCircle, AlertCircle, Link as LinkIcon, Calendar, Sparkles } from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../auth/authStore'
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Select from '../../components/Select'
import { SkeletonCard } from '../../components/Skeleton'
import { useToast } from '../../components/Toast'

const DEFAULT_MUSIC_URL = '/music/ភ្ជាប់និស្ស័យ.mp3'
const SECOND_MUSIC_URL = '/music/គូស្នេហ៍សំណាងជាងគេ.mp3'

export function WeddingProfilePage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { setWedding } = useAuthStore()
  const { success, error } = useToast()

  const [form, setForm] = useState({
    groom_name_kh: '',
    groom_name_en: '',
    bride_name_kh: '',
    bride_name_en: '',
    groom_father_kh: '',
    groom_mother_kh: '',
    bride_father_kh: '',
    bride_mother_kh: '',
    wedding_date: '',
    venue_name: '',
    venue_address: '',
    story: '',
    cover_photo: '',
    music_url: '',
    slug: '',
  })

  const [slugStatus, setSlugStatus] = useState('idle') // idle | checking | available | taken

  const { data: wedding, isLoading } = useQuery({
    queryKey: ['wedding-profile'],
    queryFn: async () => {
      const res = await api.get('/api/user/wedding')
      return res.data.data
    },
  })

  useEffect(() => {
    if (wedding) {
      setForm({
        groom_name_kh: wedding.groom_name_kh || '',
        groom_name_en: wedding.groom_name_en || '',
        bride_name_kh: wedding.bride_name_kh || '',
        bride_name_en: wedding.bride_name_en || '',
        groom_father_kh: wedding.groom_father_kh || '',
        groom_mother_kh: wedding.groom_mother_kh || '',
        bride_father_kh: wedding.bride_father_kh || '',
        bride_mother_kh: wedding.bride_mother_kh || '',
        wedding_date: wedding.wedding_date || '',
        venue_name: wedding.venue_name || '',
        venue_address: wedding.venue_address || '',
        story: wedding.story || '',
        cover_photo: wedding.cover_photo || '',
        music_url: [DEFAULT_MUSIC_URL, SECOND_MUSIC_URL].includes(wedding.music_url)
          ? wedding.music_url
          : DEFAULT_MUSIC_URL,
        slug: wedding.slug || '',
      })
    }
  }, [wedding])

  const checkSlugAvailability = (newSlug) => {
    if (!newSlug) {
      setSlugStatus('idle')
      return
    }
    setSlugStatus('checking')
    setTimeout(() => {
      // simulate check
      setSlugStatus('available')
    }, 300)
  }

  const updateField = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }))
    if (field === 'slug') {
      checkSlugAvailability(val)
    }
  }

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put('/api/user/wedding', payload)
      return res.data.data
    },
    onSuccess: (updated) => {
      setWedding(updated)
      queryClient.invalidateQueries({ queryKey: ['wedding-profile'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      success(t('common.success', 'Wedding profile updated successfully!'))
    },
    onError: (err) => {
      error(err.response?.data?.message || 'Failed to update profile')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  if (isLoading) {
    return <SkeletonCard />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-ui">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
            {t('wedding.title', 'Wedding Profile')}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500">
            {t('wedding.subtitle', 'Manage couple details, family names, and love story')}
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={mutation.isPending}
          leftIcon={Save}
        >
          {t('common.save', 'Save Changes')}
        </Button>
      </div>

      {/* Web Slug Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-brand-emerald-700" />
            <span>{t('wedding.slug', 'Invitation Web Link (Slug)')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <span className="text-xs text-charcoal-500 font-mono bg-slate-100 px-3 py-2 rounded border border-slate-200">
              theapka.online/i/
            </span>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              className="flex-1 px-3.5 py-2.5 rounded border border-slate-300 focus:border-brand-emerald-600 focus:ring-2 focus:ring-brand-emerald-100 text-sm font-mono outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            {slugStatus === 'available' && (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {t('wedding.slugAvailable', 'This link is available')}
              </span>
            )}
            {slugStatus === 'checking' && (
              <span className="text-charcoal-500">{t('wedding.slugChecking', 'Checking...')}</span>
            )}
            <span className="text-charcoal-400">
              ({t('wedding.slugHint', 'Guests will use this URL to open their invitations')})
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Couple Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Groom */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-burgundy-700">
              {t('wedding.groomSection', "Groom's Side")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="ឈ្មោះកូនកំលោះ (ខ្មែរ)"
              required
              value={form.groom_name_kh}
              onChange={(e) => updateField('groom_name_kh', e.target.value)}
            />
            <Input
              label="ឈ្មោះកូនកំលោះ (អង់គ្លេស)"
              value={form.groom_name_en}
              onChange={(e) => updateField('groom_name_en', e.target.value)}
            />
            <div className="pt-2 border-t border-cream-100 space-y-3">
              <p className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                {t('wedding.parentsGroom', "Groom's Parents")}
              </p>
              <Input
                label="ឈ្មោះឪពុក"
                value={form.groom_father_kh}
                onChange={(e) => updateField('groom_father_kh', e.target.value)}
              />
              <Input
                label="ឈ្មោះម្តាយ"
                value={form.groom_mother_kh}
                onChange={(e) => updateField('groom_mother_kh', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bride */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-burgundy-700">
              {t('wedding.brideSection', "Bride's Side")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="ឈ្មោះកូនក្រមុំ (ខ្មែរ)"
              required
              value={form.bride_name_kh}
              onChange={(e) => updateField('bride_name_kh', e.target.value)}
            />
            <Input
              label="ឈ្មោះកូនក្រមុំ (អង់គ្លេស)"
              value={form.bride_name_en}
              onChange={(e) => updateField('bride_name_en', e.target.value)}
            />
            <div className="pt-2 border-t border-cream-100 space-y-3">
              <p className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                {t('wedding.parentsBride', "Bride's Parents")}
              </p>
              <Input
                label="ឈ្មោះឪពុក"
                value={form.bride_father_kh}
                onChange={(e) => updateField('bride_father_kh', e.target.value)}
              />
              <Input
                label="ឈ្មោះម្តាយ"
                value={form.bride_mother_kh}
                onChange={(e) => updateField('bride_mother_kh', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Love Story & Media */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('wedding.story', 'Our Love Story & Music')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal-700">
              {t('wedding.story', 'Our Love Story')}
            </label>
            <textarea
              rows={4}
              value={form.story}
              onChange={(e) => updateField('story', e.target.value)}
              placeholder="រៀបរាប់ដំណើររឿងស្នេហាដ៏ផ្អែមល្ហែម..."
              className="w-full px-3.5 py-2.5 rounded border border-slate-300 focus:border-brand-emerald-600 focus:ring-2 focus:ring-brand-emerald-100 text-sm font-ui outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('wedding.coverPhoto', 'Cover Photo URL')}
              value={form.cover_photo}
              onChange={(e) => updateField('cover_photo', e.target.value)}
            />
            <Select
              label={t('wedding.musicUrl', 'Background Music')}
              value={form.music_url}
              onChange={(e) => updateField('music_url', e.target.value)}
            >
              <option value={DEFAULT_MUSIC_URL}>ភ្ជាប់និស្ស័យ</option>
              <option value={SECOND_MUSIC_URL}>គូស្នេហ៍សំណាងជាងគេ</option>
            </Select>
          </div>

          {form.cover_photo && (
            <div className="pt-2">
              <p className="text-xs text-charcoal-500 mb-2">រូបភាពគម្របបច្ចុប្បន្ន (Cover Preview):</p>
              <img
                src={form.cover_photo}
                alt="Cover Preview"
                className="w-40 h-28 object-cover rounded border border-gold-200 shadow-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  )
}

export default WeddingProfilePage
