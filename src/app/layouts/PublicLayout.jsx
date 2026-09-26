import React, { useState, useEffect, useRef } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Volume2, VolumeX, Globe } from 'lucide-react'

const DEFAULT_MUSIC_URL = '/music/ភ្ជាប់និស្ស័យ.mp3'

export function PublicLayout() {
  const { i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const shouldAutoplay = searchParams.get('autoplay') === '1'
  const [currentLang, setCurrentLang] = useState(i18n.language || 'km')

  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState(DEFAULT_MUSIC_URL)
  const audioRef = useRef(null)

  // Allow child components to set wedding-specific song without re-rendering layout
  useEffect(() => {
    window.__setWeddingMusic = (url) => {
      if (url && url !== audioUrl) setAudioUrl(url)
    }
    return () => {
      delete window.__setWeddingMusic
    }
  }, [audioUrl])

  useEffect(() => {
    if (!audioRef.current || !audioUrl) return

    if (shouldAutoplay) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }
  }, [audioUrl, shouldAutoplay])

  useEffect(() => {
    const playAfterInteraction = () => {
      if (!audioRef.current || !audioUrl || isPlaying) return
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }

    window.addEventListener('pointerdown', playAfterInteraction)
    window.addEventListener('keydown', playAfterInteraction)
    return () => {
      window.removeEventListener('pointerdown', playAfterInteraction)
      window.removeEventListener('keydown', playAfterInteraction)
    }
  }, [audioUrl, isPlaying])

  const toggleLanguage = () => {
    const next = currentLang === 'km' ? 'en' : 'km'
    i18n.changeLanguage(next)
    setCurrentLang(next)
  }

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }
  }

  return (
    <div className="min-h-screen bg-cream-100 font-ui text-charcoal-900 relative selection:bg-gold-200">
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          loop
          preload="metadata"
          autoPlay
          onError={() => {
            if (audioUrl !== DEFAULT_MUSIC_URL) setAudioUrl(DEFAULT_MUSIC_URL)
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Floating Controls Bar (Language & Music) */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2 public-floating-controls">
        {audioUrl && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Mute Music' : 'Play Music'}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center shadow-elevated border transition-all duration-300 cursor-pointer
              ${
                isPlaying
                  ? 'bg-burgundy-500 text-white border-burgundy-600 animate-spin-slow'
                  : 'bg-white/90 text-charcoal-700 border-gold-300/60 hover:bg-cream-100'
              }
            `}
          >
            {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        )}

        <button
          type="button"
          onClick={toggleLanguage}
          aria-label="Toggle Language"
          className="h-10 px-3.5 rounded-full bg-white/95 backdrop-blur-sm border border-gold-300/60 shadow-elevated text-xs font-semibold text-charcoal-800 hover:bg-cream-100 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Globe className="w-4 h-4 text-gold-600" />
          <span className="font-bold">{currentLang === 'km' ? 'ភាសាខ្មែរ' : 'English'}</span>
        </button>
      </div>

      {/* Page Content with active language context */}
      <Outlet context={{ lang: currentLang }} />
    </div>
  )
}

export default PublicLayout
