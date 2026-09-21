import React from 'react'
import { Calendar, MapPin, Heart, Sparkles } from 'lucide-react'
import { formatDate, getCountdown, toKhmerNumeral } from '../../lib/format'
import { getFontFamily } from '../../lib/fonts'

export function HeroBlock({ wedding, guest, config = {}, lang = 'km' }) {
  const countdown = getCountdown(wedding?.wedding_date)
  const isKhmer = lang === 'km'

  const primaryColor = config.primaryColor || '#C59B27'
  const headingFont = { fontFamily: getFontFamily(config.fontHeading || 'moul') }

  return (
    <section className="relative text-center py-12 md:py-20 px-4 overflow-hidden">
      {/* Background soft ornamentation */}
      <div className="max-w-xl mx-auto space-y-6">
        {/* Top Blessing Emblem */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-[1px] w-12 bg-gold-300" />
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center border shadow-soft"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div className="h-[1px] w-12 bg-gold-300" />
        </div>

        {/* Header Tag */}
        <p className="text-xs uppercase tracking-widest text-charcoal-500 font-serif">
          {isKhmer ? 'សិរីសួស្តី អាពាហ៍ពិពាហ៍' : 'Wedding Celebration'}
        </p>

        {/* Couple Names */}
        <div className="space-y-3 my-4">
          <h1
            className="text-2xl sm:text-4xl md:text-5xl leading-relaxed sm:leading-relaxed"
            style={{ ...headingFont, color: primaryColor }}
          >
            {isKhmer ? wedding?.groom_name_kh : wedding?.groom_name_en}
          </h1>

          <div className="flex items-center justify-center gap-3 text-gold-500">
            <span className="h-[1px] w-8 bg-gold-300" />
            <span className="font-serif italic text-lg sm:text-xl text-charcoal-400">&</span>
            <span className="h-[1px] w-8 bg-gold-300" />
          </div>

          <h1
            className="text-2xl sm:text-4xl md:text-5xl leading-relaxed sm:leading-relaxed"
            style={{ ...headingFont, color: primaryColor }}
          >
            {isKhmer ? wedding?.bride_name_kh : wedding?.bride_name_en}
          </h1>
        </div>

        {/* Personalized Guest Greeting Badge (if guest token provided) */}
        {guest && (
          <div className="inline-block mx-auto p-4 rounded bg-white/90 border border-gold-300/50 shadow-card animate-in fade-in max-w-sm">
            <div className="flex items-center justify-center gap-1 text-xs text-gold-700 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isKhmer ? 'សូមគោរពអញ្ជើញ' : 'Cordially Invited'}</span>
            </div>
            <p className="text-base font-bold text-charcoal-900 font-ui">{guest.name}</p>
            {guest.seats && (
              <p className="text-xs text-charcoal-500 font-ui mt-0.5">
                {isKhmer
                  ? `ចំនួនកៅអីបម្រុងទុក: ${toKhmerNumeral(guest.seats)} កៅអី`
                  : `Seats reserved: ${guest.seats}`}
              </p>
            )}
          </div>
        )}

        {/* Wedding Date & Venue Info */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-charcoal-700 font-ui pt-2">
          <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded border border-cream-200">
            <Calendar className="w-4 h-4 text-gold-600" />
            <span>{formatDate(wedding?.wedding_date, 'dddd D MMMM YYYY', lang)}</span>
          </div>

          <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded border border-cream-200 text-center max-w-xs truncate">
            <MapPin className="w-4 h-4 text-gold-600 shrink-0" />
            <span className="truncate">{wedding?.venue_name}</span>
          </div>
        </div>

        {/* Cover Photo */}
        {wedding?.cover_photo && (
          <div className="relative mx-auto rounded overflow-hidden shadow-elevated border-4 border-white max-w-md aspect-[4/5] mt-6">
            <img
              src={wedding.cover_photo}
              alt="Couple Cover"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-transparent" />
          </div>
        )}

        {/* Days Countdown Timer */}
        <div className="pt-6">
          {countdown.isPast ? (
            <p className="text-xs text-charcoal-500 font-ui italic">
              {isKhmer ? 'កម្មវិធីបានប្រារព្ធដោយជោគជ័យ' : 'The wedding celebration has concluded'}
            </p>
          ) : (
            <div className="inline-flex items-center gap-4 bg-white/90 px-6 py-3 rounded border border-gold-200/80 shadow-soft">
              <div className="text-center">
                <span className="block text-2xl font-bold font-serif" style={{ color: primaryColor }}>
                  {isKhmer ? toKhmerNumeral(countdown.days) : countdown.days}
                </span>
                <span className="text-[11px] text-charcoal-500 font-ui">
                  {isKhmer ? 'ថ្ងៃ' : 'Days'}
                </span>
              </div>
              <div className="h-6 w-[1px] bg-cream-300" />
              <div className="text-center">
                <span className="block text-2xl font-bold font-serif" style={{ color: primaryColor }}>
                  {isKhmer ? toKhmerNumeral(countdown.hours) : countdown.hours}
                </span>
                <span className="text-[11px] text-charcoal-500 font-ui">
                  {isKhmer ? 'ម៉ោង' : 'Hours'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default HeroBlock
