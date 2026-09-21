import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Image as ImageIcon, Upload, Trash2, Check, Star, ArrowUp, ArrowDown } from 'lucide-react'
import api from '../../lib/api'
import Card, { CardContent } from '../../components/Card'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import { SkeletonCard } from '../../components/Skeleton'
import { useToast } from '../../components/Toast'

export function GalleryPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  const [isUploading, setIsUploading] = useState(false)

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
      // update cover photo in wedding profile
      await api.put('/api/user/wedding', { cover_photo: photo.url })
      // set is_cover in media
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
            {t('gallery.title', 'Photo Gallery')}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500">
            {t('gallery.subtitle', 'Upload pre-wedding and memory photos')}
          </p>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-burgundy-500 hover:bg-burgundy-600 text-white text-sm font-semibold shadow-sm cursor-pointer active:scale-95 transition-all touch-target">
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
        </div>
      </div>

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
          {media.map((photo) => (
            <Card key={photo.id} className="group relative overflow-hidden">
              <div className="aspect-[3/4] relative bg-cream-200">
                <img
                  src={photo.url}
                  alt="Wedding gallery moment"
                  className="w-full h-full object-cover"
                />

                {photo.is_cover && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gold-500 text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{t('gallery.coverBadge', 'Cover')}</span>
                  </div>
                )}

                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-charcoal-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!photo.is_cover && (
                    <button
                      type="button"
                      onClick={() => setCoverMutation.mutate(photo)}
                      className="w-14 h-14 rounded bg-white text-charcoal-800 hover:text-gold-600 shadow-sm touch-target flex items-center justify-center"
                      title={t('gallery.setAsCover', 'Set as cover photo')}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Delete photo?')) {
                        deleteMutation.mutate(photo.id)
                      }
                    }}
                      className="w-14 h-14 rounded bg-white text-red-600 hover:bg-red-50 shadow-sm touch-target flex items-center justify-center"
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
    </div>
  )
}

export default GalleryPage
