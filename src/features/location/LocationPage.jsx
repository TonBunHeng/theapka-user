import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Navigation, ExternalLink, Save } from 'lucide-react'
import api from '../../lib/api'
import Card, { CardContent, CardHeader, CardTitle } from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { SkeletonCard } from '../../components/Skeleton'
import { useToast } from '../../components/Toast'

export function LocationPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  const [form, setForm] = useState({
    venue_name: '',
    venue_address: '',
    lat: 11.6685,
    lng: 104.9452,
    map_url: '',
  })

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
        venue_name: wedding.venue_name || '',
        venue_address: wedding.venue_address || '',
        lat: Number(wedding.lat) || 11.6685,
        lng: Number(wedding.lng) || 104.9452,
        map_url: wedding.map_url || '',
      })
    }
  }, [wedding])

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put('/api/user/wedding', payload)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding-profile'] })
      success(t('common.success', 'Location updated successfully!'))
    },
    onError: () => error('Failed to update location'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  const lat = Number(form.lat) || 11.6685
  const lng = Number(form.lng) || 104.9452
  const bbox = `${lng - 0.008}%2C${lat - 0.008}%2C${lng + 0.008}%2C${lat + 0.008}`
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`

  const googleMapsUrl =
    form.map_url || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

  if (isLoading) return <SkeletonCard />

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-ui">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
            {t('location.title', 'Location & Map')}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500">
            {t('location.subtitle', 'Set up venue details and map directions for your guests')}
          </p>
        </div>

        <Button type="submit" variant="primary" isLoading={mutation.isPending} leftIcon={Save}>
          {t('common.save', 'Save Changes')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold-600" />
              <span>{t('location.venueName', 'Venue Details')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label={t('location.venueName', 'Venue Name')}
              required
              value={form.venue_name}
              onChange={(e) => setForm({ ...form, venue_name: e.target.value })}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-charcoal-700">
                {t('location.address', 'Full Address')}
              </label>
              <textarea
                rows={3}
                required
                value={form.venue_address}
                onChange={(e) => setForm({ ...form, venue_address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded border border-cream-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm font-ui outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude"
                type="number"
                step="0.0001"
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Longitude"
                type="number"
                step="0.0001"
                value={form.lng}
                onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <Input
              label="Custom Google Maps Link (Optional)"
              placeholder="https://maps.google.com/..."
              value={form.map_url}
              onChange={(e) => setForm({ ...form, map_url: e.target.value })}
            />

            <div className="pt-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-burgundy-600 hover:text-burgundy-700 underline"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{t('location.openGoogleMaps', 'Open in Google Maps')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Map Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('location.previewMap', 'Map Preview')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full aspect-[4/3] bg-cream-100 relative">
              <iframe
                title="Location Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={osmEmbedUrl}
                className="w-full h-full"
                loading="lazy"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

export default LocationPage
