import React from 'react'
import HeroBlock from './blocks/HeroBlock'
import StoryBlock from './blocks/StoryBlock'
import ScheduleBlock from './blocks/ScheduleBlock'
import GalleryBlock from './blocks/GalleryBlock'
import MapBlock from './blocks/MapBlock'
import RsvpBlock from './blocks/RsvpBlock'

export function TemplateRenderer({
  wedding,
  guest = null,
  schedules = [],
  gallery = [],
  wishes = [],
  templateConfig = {},
  onRsvpSubmit,
  onWishSubmit,
  onOpenQrCard,
  lang = 'km',
  previewMode = false,
}) {
  const config = {
    primaryColor: templateConfig?.primaryColor || '#C59B27',
    accentColor: templateConfig?.accentColor || '#8B1E3F',
    bgColor: templateConfig?.bgColor || '#FAF7F2',
    fontHeading: templateConfig?.fontHeading || 'moul',
    fontBody: templateConfig?.fontBody || 'kantumruy',
    blocks: templateConfig?.blocks || [
      { id: 'hero', enabled: true },
      { id: 'story', enabled: true },
      { id: 'schedule', enabled: true },
      { id: 'gallery', enabled: true },
      { id: 'map', enabled: true },
      { id: 'rsvp', enabled: true },
    ],
  }

  const blockMap = {
    hero: (
      <HeroBlock
        key="hero"
        wedding={wedding}
        guest={guest}
        config={config}
        lang={lang}
      />
    ),
    story: (
      <StoryBlock
        key="story"
        wedding={wedding}
        config={config}
        lang={lang}
      />
    ),
    schedule: (
      <ScheduleBlock
        key="schedule"
        schedules={schedules}
        config={config}
        lang={lang}
      />
    ),
    gallery: (
      <GalleryBlock
        key="gallery"
        gallery={gallery}
        config={config}
        lang={lang}
      />
    ),
    map: (
      <MapBlock
        key="map"
        wedding={wedding}
        config={config}
        lang={lang}
      />
    ),
    rsvp: (
      <RsvpBlock
        key="rsvp"
        guest={guest}
        onRsvpSubmit={onRsvpSubmit}
        config={config}
        lang={lang}
      />
    ),
  }

  return (
    <div
      className={previewMode ? 'min-h-full transition-colors duration-300' : 'min-h-screen transition-colors duration-300'}
      style={{ backgroundColor: config.bgColor }}
    >
      {/* Sequential blocks based on configured order and visibility */}
      {config.blocks
        .filter((b) => b.enabled !== false)
        .map((b) => blockMap[b.id] || null)}

      {/* Floating QR Entrance Pass Button for Guest (if guest is present) */}
      {guest && onOpenQrCard && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button
            type="button"
            onClick={onOpenQrCard}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-burgundy-500 text-white shadow-elevated hover:bg-burgundy-600 font-bold text-xs font-ui border-2 border-white active:scale-95 transition-all touch-target"
          >
            <span>{lang === 'km' ? 'កាត QR ចូលរួមកម្មវិធី' : 'My Entrance QR Pass'}</span>
          </button>
        </div>
      )}

      {/* Elegant Wedding Footer */}
      <footer className="py-12 px-4 text-center border-t border-gold-200/50 space-y-2">
        <p className="font-moul text-sm text-gold-700">
          {wedding?.groom_name_kh} & {wedding?.bride_name_kh}
        </p>
        <p className="text-xs text-charcoal-500 font-serif tracking-widest uppercase">
          Powered by TheapKa Online
        </p>
      </footer>
    </div>
  )
}

export default TemplateRenderer
