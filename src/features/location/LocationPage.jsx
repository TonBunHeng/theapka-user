import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Navigation, ExternalLink, Save, CheckCircle, Info } from 'lucide-react'
import api from '../../lib/api'
import Card, { CardContent, CardHeader, CardTitle } from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { SkeletonCard } from '../../components/Skeleton'
import { useToast } from '../../components/Toast'

// Robust parser for all variants of Google Maps URLs, embeds, and iframe snippets
export function parseGoogleMapsUrl(input) {
  if (!input || typeof input !== 'string') {
    return { cleanUrl: '', lat: null, lng: null, placeName: null, embedUrl: null }
  }

  let str = input.trim()

  // 1. If user pasted iframe HTML tag, extract src
  const iframeMatch = str.match(/src=["']([^"']+)["']/)
  if (iframeMatch) {
    str = iframeMatch[1]
  }

  let lat = null
  let lng = null
  let placeName = null
  let embedUrl = null

  // 2. Direct embed links
  if (str.includes('/maps/embed') || str.includes('output=embed')) {
    embedUrl = str
  }

  // 3. Extract place name from /maps/place/PLACE_NAME
  const placeMatch = str.match(/\/maps\/place\/([^/@?]+)/u)
  if (placeMatch) {
    try {
      placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
    } catch {
      placeName = placeMatch[1].replace(/\+/g, ' ')
    }
  }

  // 4. Extract search query from /maps/search/QUERY
  const searchMatch = str.match(/\/maps\/search\/([^/@?]+)/u)
  if (searchMatch && !placeName) {
    try {
      placeName = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '))
    } catch {
      placeName = searchMatch[1].replace(/\+/g, ' ')
    }
  }

  // 5. Extract coordinates from @lat,lng
  const atMatch = str.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (atMatch) {
    lat = parseFloat(atMatch[1])
    lng = parseFloat(atMatch[2])
  }

  // 6. Extract coordinates from query params: q=lat,lng or ll=lat,lng or query=lat,lng
  if (lat === null || lng === null) {
    const qMatch = str.match(/[?&](?:q|ll|query|saddr|daddr)=(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (qMatch) {
      lat = parseFloat(qMatch[1])
      lng = parseFloat(qMatch[2])
    }
  }

  // 7. Extract coordinates from pb string (!3dlat!2dlng or !2dlng!3dlat)
  if (lat === null || lng === null) {
    const latMatch = str.match(/!3d(-?\d+\.\d+)/)
    const lngMatch = str.match(/!2d(-?\d+\.\d+)/)
    if (latMatch && lngMatch) {
      lat = parseFloat(latMatch[1])
      lng = parseFloat(lngMatch[1])
    }
  }

  // 8. If query param q=text exists and no placeName
  if (!placeName && (str.startsWith('http://') || str.startsWith('https://'))) {
    const qTextMatch = str.match(/[?&]q=([^&]+)/)
    if (qTextMatch && !qTextMatch[1].includes(',')) {
      try {
        placeName = decodeURIComponent(qTextMatch[1].replace(/\+/g, ' '))
      } catch {
        placeName = qTextMatch[1].replace(/\+/g, ' ')
      }
    }
  }

  // 9. Generate Google Maps Embed URL if not already embed
  if (!embedUrl) {
    if (placeName) {
      embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    } else if (lat !== null && lng !== null) {
      embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    } else if (str.startsWith('http://') || str.startsWith('https://')) {
      const anyQ = str.match(/[?&]q=([^&]+)/)
      if (anyQ) {
        embedUrl = `https://maps.google.com/maps?q=${anyQ[1]}&t=&z=15&ie=UTF8&iwloc=&output=embed`
      }
    }
  }

  return {
    cleanUrl: str,
    lat,
    lng,
    placeName,
    embedUrl,
  }
}

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
      const initialMapUrl = wedding.map_url || wedding.venue_map_url || ''
      setForm({
        venue_name: wedding.venue_name || '',
        venue_address: wedding.venue_address || '',
        lat: Number(wedding.lat) || 11.6685,
        lng: Number(wedding.lng) || 104.9452,
        map_url: initialMapUrl,
      })
    }
  }, [wedding])

  // Handle map URL change with auto-coordinate detection and remote resolver
  const handleMapUrlChange = async (value) => {
    const parsed = parseGoogleMapsUrl(value)
    setForm((prev) => ({
      ...prev,
      map_url: parsed.cleanUrl || value,
      lat: parsed.lat !== null ? parsed.lat : prev.lat,
      lng: parsed.lng !== null ? parsed.lng : prev.lng,
      venue_name: (!prev.venue_name && parsed.placeName) ? parsed.placeName : prev.venue_name,
    }))

    // If it's a shortened link or needs server expansion
    if (value && (value.includes('maps.app.goo.gl') || value.includes('goo.gl/maps') || (value.startsWith('http') && parsed.lat === null && !parsed.placeName))) {
      try {
        const res = await api.post('/api/user/resolve-map-url', { url: value })
        const resolved = res.data?.data
        if (resolved) {
          setForm((prev) => ({
            ...prev,
            map_url: resolved.clean_url || prev.map_url,
            lat: resolved.lat !== null ? resolved.lat : prev.lat,
            lng: resolved.lng !== null ? resolved.lng : prev.lng,
            venue_name: (!prev.venue_name && resolved.place_name) ? resolved.place_name : prev.venue_name,
          }))
        }
      } catch (err) {
        // Silently continue
      }
    }
  }

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put('/api/user/wedding', {
        ...payload,
        venue_map_url: payload.map_url,
      })
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

  // Determine the live map preview URL
  const previewMapUrl = useMemo(() => {
    if (form.map_url) {
      const parsed = parseGoogleMapsUrl(form.map_url)
      if (parsed.embedUrl) {
        return parsed.embedUrl
      }
    }
    if (form.lat && form.lng) {
      return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    }
    if (form.venue_name || form.venue_address) {
      const query = [form.venue_name, form.venue_address].filter(Boolean).join(', ')
      return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    }
    return `https://maps.google.com/maps?q=11.6685,104.9452&t=&z=15&ie=UTF8&iwloc=&output=embed`
  }, [form.map_url, form.lat, form.lng, form.venue_name, form.venue_address, lat, lng])

  const googleMapsExternalUrl =
    form.map_url && form.map_url.startsWith('http')
      ? form.map_url
      : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

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
              placeholder="e.g. Garden City Hotel / សណ្ឋាគារ ហ្គាដិន ស៊ីធី"
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
                placeholder="e.g. Street / Sangkat / Khan / City"
                value={form.venue_address}
                onChange={(e) => setForm({ ...form, venue_address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded border border-cream-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm font-ui outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <Input
                label="Custom Google Maps Link (Optional)"
                placeholder="Paste link, embed code, or coordinates (e.g. https://maps.app.goo.gl/...)"
                value={form.map_url}
                onChange={(e) => handleMapUrlChange(e.target.value)}
              />
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Tip: Pasting any Google Maps link or iframe embed code automatically updates coordinates and live preview.</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude"
                type="number"
                step="any"
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Longitude"
                type="number"
                step="any"
                value={form.lng}
                onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="pt-2">
              <a
                href={googleMapsExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-emerald-700 hover:text-brand-emerald-800 underline"
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t('location.previewMap', 'Map Preview')}</CardTitle>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle className="w-3 h-3" />
              <span>Google Maps Live</span>
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full aspect-[4/3] bg-slate-100 relative rounded-b overflow-hidden">
              <iframe
                key={previewMapUrl}
                title="Google Maps Location Preview"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={previewMapUrl}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between font-mono">
              <span>Lat: {lat.toFixed(4)}</span>
              <span>Lng: {lng.toFixed(4)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

export default LocationPage
