import React from 'react'
import { Clock, MapPin } from 'lucide-react'
import { toKhmerNumeral } from '../../lib/format'

export function ScheduleBlock({ schedules = [], config = {}, lang = 'km' }) {
  const isKhmer = lang === 'km'
  const primaryColor = config.primaryColor || '#C59B27'
  const fontHeading = config.fontHeading === 'serif' ? 'font-serif' : 'font-moul'

  if (!schedules || schedules.length === 0) return null

  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h3
            className={`text-xl sm:text-2xl leading-relaxed ${fontHeading}`}
            style={{ color: primaryColor }}
          >
            {isKhmer ? 'កម្មវិធីពិធីមង្គលការ' : 'Wedding Program'}
          </h3>
          <p className="text-xs text-charcoal-500 font-serif uppercase tracking-widest">
            {isKhmer ? 'កាលវិភាគពិធី និងពេលវេលា' : 'Itinerary & Schedule'}
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gold-200">
          {schedules.map((item, index) => {
            const timeStr = `${item.start_time} - ${item.end_time || ''}`
            return (
              <div key={item.id || index} className="relative group">
                {/* Bullet node on timeline */}
                <div
                  className="absolute -left-6 sm:-left-8 top-1.5 w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center shadow-sm"
                  style={{ borderColor: primaryColor }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>

                {/* Event Card */}
                <div className="bg-white rounded-2xl p-5 border border-gold-200/60 shadow-card space-y-2 hover:shadow-elevated transition-shadow duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-charcoal-900 font-ui">
                      {item.title}
                    </h4>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream-100 text-xs font-semibold text-charcoal-700 font-ui">
                      <Clock className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                      <span>{isKhmer ? toKhmerNumeral(timeStr) : timeStr}</span>
                    </div>
                  </div>

                  {item.venue && (
                    <div className="flex items-center gap-1.5 text-xs text-gold-700 font-ui">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.venue}</span>
                    </div>
                  )}

                  {item.description && (
                    <p className="text-xs sm:text-sm text-charcoal-600 font-ui leading-relaxed pt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ScheduleBlock
