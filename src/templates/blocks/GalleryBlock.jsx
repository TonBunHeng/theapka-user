import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, ZoomIn, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'
import { getFontFamily } from '../../lib/fonts'

export function GalleryBlock({ gallery = [], config = {}, lang = 'km' }) {
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const isKhmer = lang === 'km'
  const primaryColor = config.primaryColor || '#C59B27'
  const headingFont = { fontFamily: getFontFamily(config.fontHeading || 'moul') }

  const total = gallery.length

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation()
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : total - 1))
  }, [total])

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation()
    setSelectedIndex((prev) => (prev < total - 1 ? prev + 1 : 0))
  }, [total])

  const handleClose = useCallback(() => {
    setSelectedIndex(null)
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
  }, [])

  const toggleBrowserFullscreen = useCallback((e) => {
    if (e) e.stopPropagation()
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }, [])

  // Keyboard controls, body scroll lock & hide background controls
  useEffect(() => {
    if (selectedIndex === null) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('lightbox-active')

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'f' || e.key === 'F') toggleBrowserFullscreen()
    }

    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('fullscreenchange', handleFsChange)

    return () => {
      document.body.style.overflow = prevOverflow
      document.body.classList.remove('lightbox-active')
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('fullscreenchange', handleFsChange)
    }
  }, [selectedIndex, handleClose, handlePrev, handleNext, toggleBrowserFullscreen])

  if (!gallery || gallery.length === 0) return null

  const currentPhoto = selectedIndex !== null ? gallery[selectedIndex] : null
  const currentUrl = typeof currentPhoto === 'string' ? currentPhoto : currentPhoto?.url

  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h3
            className="text-xl sm:text-2xl leading-relaxed"
            style={{ ...headingFont, color: primaryColor }}
          >
            {isKhmer ? 'វិចិត្រសាលរូបភាព' : 'Moments & Memories'}
          </h3>
          <p className="text-xs text-charcoal-500 font-serif uppercase tracking-widest">
            {isKhmer ? 'រូបភាពអនុស្សាវរីយ៍មុនថ្ងៃមង្គល' : 'Pre-wedding Photo Highlights'}
          </p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {gallery.map((photo, index) => {
            const photoUrl = typeof photo === 'string' ? photo : photo?.url
            return (
              <div
                key={photo.id || index}
                onClick={() => setSelectedIndex(index)}
                className="group relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer bg-cream-200 border border-gold-200/50 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <img
                  src={photoUrl}
                  alt={`Wedding moment ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-charcoal-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <div className="p-2.5 rounded-full bg-charcoal-900/60 backdrop-blur-xs">
                    <ZoomIn className="w-5 h-5 drop-shadow" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Fullscreen Lightbox Modal via Portal directly to body */}
        {selectedIndex !== null && typeof document !== 'undefined' && createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
            style={{ zIndex: 99999 }}
            onClick={handleClose}
          >
            {/* Top Bar with Counter & Action Buttons */}
            <div
              className="w-full px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between z-20 bg-linear-to-b from-black/80 to-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-mono font-medium tracking-wider shadow-sm">
                {selectedIndex + 1} / {total}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={toggleBrowserFullscreen}
                  className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md transition-colors cursor-pointer"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  aria-label="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2.5 rounded-full bg-white/20 hover:bg-red-600/90 text-white backdrop-blur-md transition-all cursor-pointer shadow-md"
                  title="Close preview"
                  aria-label="Close photo preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Center Image Container with Previous / Next Arrows */}
            <div
              className="relative flex-1 w-full h-full flex items-center justify-center p-2 sm:p-6 overflow-hidden"
              onClick={handleClose}
            >
              {/* Prev Button */}
              {total > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-xl"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              )}

              {/* Main Full-Size Scaled Image */}
              <div
                className="w-full h-full flex items-center justify-center max-w-[96vw] max-h-[85vh] sm:max-h-[88vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  key={currentUrl}
                  src={currentUrl}
                  alt={`Wedding moment ${selectedIndex + 1}`}
                  className="w-full h-full max-w-full max-h-full object-contain rounded-md drop-shadow-2xl animate-in zoom-in-95 duration-200"
                />
              </div>

              {/* Next Button */}
              {total > 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-xl"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              )}
            </div>

            {/* Bottom thumbnail strip or hint */}
            <div
              className="w-full px-4 py-2 sm:py-3 text-center text-white/50 text-[11px] sm:text-xs z-10 bg-linear-to-t from-black/60 to-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              {isKhmer ? 'ចុច Escape ឬចុចលើផ្ទៃខាងក្រោយដើម្បីបិទ' : 'Press ESC or click background to close'}
            </div>
          </div>,
          document.body
        )}
      </div>
    </section>
  )
}

export default GalleryBlock
