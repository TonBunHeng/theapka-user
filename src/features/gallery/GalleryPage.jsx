import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Image as ImageIcon, Upload, Trash2, Star, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../lib/api'
import Card from '../../components/Card'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import { SkeletonCard } from '../../components/Skeleton'
import { useToast } from '../../components/Toast'

export function GalleryPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(null)
  const isKhmer = i18n.language === 'km'

  const { data: media = [], isLoading } = useQuery({
    queryKey: ['gallery-media'],
    queryFn: async () => {
      const res = await api.get('/api/user/media')
      return res.data.data
    },
  })

  // Resize client-side using canvas before upload (Section 5.10)
  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxDim = 1200
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width
              width = maxDim
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height
              height = maxDim
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.85))
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)
    try {
      for (const file of files) {
        const resizedDataUrl = await resizeImage(file)
        await api.post('/api/user/media', {
          url: resizedDataUrl,
          is_cover: media.length === 0,
        })
      }
      queryClient.invalidateQueries({ queryKey: ['gallery-media'] })
      success(t('common.success', 'Images uploaded successfully!'))
    } catch (err) {
      error('Failed to upload image')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/user/media/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-media'] })
      success(t('common.success', 'Photo removed'))
    },
  })

  const setCoverMutation = useMutation({
    mutationFn: async (photo) => {
      await api.put('/api/user/wedding', { cover_photo: photo.url })
      await api.post('/api/user/media', { id: photo.id, url: photo.url, is_cover: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-media'] })
      queryClient.invalidateQueries({ queryKey: ['wedding-profile'] })
      success(t('common.success', 'Cover photo updated!'))
    },
  })

  return (
    <div className="space-y-6 font-ui">
      {/* Header */}
      <PageHeader
        title={t('gallery.title', 'Photo Gallery')}
        subtitle={t('gallery.subtitle', 'Upload pre-wedding and memory photos')}
        actions={
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded bg-brand-emerald-700 hover:bg-brand-emerald-800 text-white text-sm font-semibold shadow-sm cursor-pointer active:scale-95 transition-all touch-target">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? t('common.loading', 'Uploading...') : t('gallery.uploadButton', 'Upload Photos')}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              disabled={isUploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        }
      />

      {/* Gallery Grid */}
      {isLoading ? (
        <SkeletonCard />
      ) : media.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title={t('gallery.empty', 'No photos in gallery yet')}
          description={t('gallery.dragDrop', 'Upload photos of your special moments')}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.map((photo, index) => (
            <Card key={photo.id} className="group relative overflow-hidden">
              <div className="aspect-[3/4] relative bg-slate-100 cursor-pointer" onClick={() => setPreviewIndex(index)}>
                <img
                  src={photo.url}
                  alt="Wedding gallery moment"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {photo.is_cover && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gold-500 text-white text-[10px] font-bold shadow-sm flex items-center gap-1 z-10">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{t('gallery.coverBadge', 'Cover')}</span>
                  </div>
                )}

                {/* Hover overlay actions */}
                <div
                  className="absolute inset-0 bg-charcoal-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setPreviewIndex(index)}
                    className="w-10 h-10 rounded-full bg-white text-charcoal-800 hover:text-brand-emerald-700 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                    title={t('gallery.viewPhoto', 'View Full Screen')}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  {!photo.is_cover && (
                    <button
                      type="button"
                      onClick={() => setCoverMutation.mutate(photo)}
                      className="w-10 h-10 rounded-full bg-white text-charcoal-800 hover:text-gold-600 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                      title={t('gallery.setAsCover', 'Set as cover photo')}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(isKhmer ? 'តើអ្នកប្រាកដជាចង់លុបរូបភាពនេះមែនទេ?' : 'Delete photo?')) {
                        deleteMutation.mutate(photo.id)
                      }
                    }}
                    className="w-10 h-10 rounded-full bg-white text-red-600 hover:bg-red-50 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                    title={t('gallery.deletePhoto', 'Delete photo')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Full Screen Preview Lightbox */}
      {previewIndex !== null && media[previewIndex] && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200" style={{ zIndex: 99999 }}
          onClick={() => setPreviewIndex(null)}
        >
          {/* Top Bar */}
          <div
            className="w-full px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between z-10 bg-linear-to-b from-black/60 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-mono font-medium tracking-wider">
              {previewIndex + 1} / {media.length}
            </div>

            <button
              type="button"
              onClick={() => setPreviewIndex(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-red-500/80 text-white/90 hover:text-white transition-colors cursor-pointer"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Image & Navigation */}
          <div
            className="relative flex-1 w-full h-full flex items-center justify-center p-2 sm:p-6 overflow-hidden"
            onClick={() => setPreviewIndex(null)}
          >
            {media.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setPreviewIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))
                }}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-xs transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            )}

            <div
              className="w-full h-full flex items-center justify-center max-w-[96vw] max-h-[85vh] sm:max-h-[88vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                key={media[previewIndex]?.url}
                src={media[previewIndex]?.url}
                alt="Full screen preview"
                className="w-full h-full max-w-full max-h-full object-contain rounded-sm drop-shadow-2xl animate-in zoom-in-95 duration-200"
              />
            </div>

            {media.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setPreviewIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0))
                }}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-xs transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            )}
          </div>

          {/* Bottom Hint */}
          <div
            className="w-full px-4 py-2 sm:py-3 text-center text-white/50 text-[11px] sm:text-xs z-10 bg-linear-to-t from-black/60 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            {isKhmer ? 'ចុចលើផ្ទៃខាងក្រោយ ឬចុចប៊ូតុងបិទដើម្បីត្រឡប់ក្រោយ' : 'Click background or close button to exit'}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default GalleryPage
