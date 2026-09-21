import React, { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'

export function GalleryBlock({ gallery = [], config = {}, lang = 'km' }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const isKhmer = lang === 'km'
  const primaryColor = config.primaryColor || '#C59B27'
  const fontHeading = config.fontHeading === 'serif' ? 'font-serif' : 'font-moul'

  if (!gallery || gallery.length === 0) return null

  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h3
            className={`text-xl sm:text-2xl leading-relaxed ${fontHeading}`}
            style={{ color: primaryColor }}
          >
            {isKhmer ? 'វិចិត្រសាលរូបភាព' : 'Moments & Memories'}
          </h3>
          <p className="text-xs text-charcoal-500 font-serif uppercase tracking-widest">
            {isKhmer ? 'រូបភាពអនុស្សាវរីយ៍មុនថ្ងៃមង្គល' : 'Pre-wedding Photo Highlights'}
          </p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {gallery.map((photo, index) => (
            <div
              key={photo.id || index}
              onClick={() => setSelectedPhoto(photo.url)}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer bg-cream-200 border border-gold-200/50 shadow-sm"
            >
              <img
                src={photo.url}
                alt={`Wedding moment ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-charcoal-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <ZoomIn className="w-6 h-6 drop-shadow" />
              </div>
            </div>
          ))}
        </div>

        {/* Fullscreen Lightbox Modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 bg-charcoal-900/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2.5 text-white/80 hover:text-white rounded-full bg-charcoal-800/60 touch-target flex items-center justify-center"
              aria-label="Close photo preview"
            >
              <X className="w-6 h-6" />
            </button>

            <div
              className="max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto}
                alt="Enlarged wedding moment"
                className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-elevated"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default GalleryBlock
