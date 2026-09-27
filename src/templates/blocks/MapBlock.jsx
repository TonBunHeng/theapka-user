import React, { useMemo } from 'react'
import { MapPin, Navigation, ExternalLink } from 'lucide-react'
import { getFontFamily } from '../../lib/fonts'
import { parseGoogleMapsUrl } from '../../features/location/LocationPage'

export function MapBlock({ wedding, config = {}, lang = 'km' }) {
  const isKhmer = lang === 'km'
  const primaryColor = config.primaryColor || '#C59B27'
  const headingFont = { fontFamily: getFontFamily(config.fontHeading || 'moul') }

  const lat = Number(wedding?.lat) || 11.6685
  const lng = Number(wedding?.lng) || 104.9452
  const customMapUrl = wedding?.map_url || wedding?.venue_map_url || ''

  // Determine iframe embed URL
  const embedUrl = useMemo(() => {
    if (customMapUrl) {
      const parsed = parseGoogleMapsUrl(customMapUrl)
      if (parsed.embedUrl) {
        return parsed.embedUrl
      }
    }
    if (lat && lng) {
      return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    }
    if (wedding?.venue_name || wedding?.venue_address) {
      const query = [wedding?.venue_name, wedding?.venue_address].filter(Boolean).join(', ')
      return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    }
    return `https://maps.google.com/maps?q=11.6685,104.9452&t=&z=15&ie=UTF8&iwloc=&output=embed`
  }, [customMapUrl, lat, lng, wedding?.venue_name, wedding?.venue_address])

  const directMapUrl =
    customMapUrl && customMapUrl.startsWith('http')
      ? customMapUrl
      : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h3
            className="text-xl sm:text-2xl leading-relaxed"
            style={{ ...headingFont, color: primaryColor }}
          >
            {isKhmer ? 'ទីតាំងប្រារព្ធពិធី' : 'Venue & Directions'}
          </h3>
          <p className="text-xs text-charcoal-500 font-serif uppercase tracking-widest">
            {isKhmer ? 'ផែនទី និងទិសដៅធ្វើដំណើរ' : 'Location Map'}
          </p>
        </div>

        {/* Venue Details Card */}
        <div className="bg-white rounded p-6 border border-gold-200/60 shadow-card text-center space-y-4">
          <div className="w-10 h-10 rounded bg-gold-100 flex items-center justify-center text-gold-600 mx-auto">
            <MapPin className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-bold text-charcoal-900 font-ui">
              {wedding?.venue_name || 'សណ្ឋាគារ / គេហដ្ឋាន'}
            </h4>
            <p className="text-xs sm:text-sm text-charcoal-600 font-ui leading-relaxed max-w-md mx-auto">
              {wedding?.venue_address || 'រាជធានីភ្នំពេញ'}
            </p>
          </div>

          {/* Embedded Map */}
          <div className="w-full aspect-[16/9] sm:aspect-[2/1] rounded overflow-hidden border border-cream-300 shadow-inner bg-cream-100 relative">
            <iframe
              key={embedUrl}
              title="Venue Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              src={embedUrl}
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>

          {/* Google Maps Link Button */}
          <div className="pt-2">
            <a
              href={directMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded bg-gold-500 hover:bg-gold-600 text-white font-semibold text-sm shadow-sm transition-transform active:scale-[0.98] font-ui touch-target"
            >
              <Navigation className="w-4 h-4" />
              <span>{isKhmer ? 'បើកក្នុង Google Maps' : 'Open in Google Maps'}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MapBlock
