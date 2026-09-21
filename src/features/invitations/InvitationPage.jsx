import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Palette,
  Smartphone,
  Maximize2,
  Globe2,
  Check,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Save,
  X,
  ExternalLink,
} from 'lucide-react'
import api from '../../lib/api'
import TemplateRenderer from '../../templates/TemplateRenderer'
import Card, { CardContent, CardHeader, CardTitle } from '../../components/Card'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import { SkeletonCard } from '../../components/Skeleton'
import { useToast } from '../../components/Toast'

import traditionalPreset from '../../templates/presets/traditionalGold.json'
import modernPreset from '../../templates/presets/modernBurgundy.json'
import minimalPreset from '../../templates/presets/minimalEmerald.json'

const PRESETS = [traditionalPreset, modernPreset, minimalPreset]

export function InvitationPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  const [activePresetId, setActivePresetId] = useState('traditional-gold')
  const [templateConfig, setTemplateConfig] = useState(traditionalPreset)
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)

  // Fetch current invitation config & wedding info
  const { data, isLoading } = useQuery({
    queryKey: ['user-invitation'],
    queryFn: async () => {
      const res = await api.get('/api/user/invitation')
      return res.data.data
    },
  })

  // Fetch schedules and gallery for the preview
  const { data: schedules = [] } = useQuery({
    queryKey: ['schedules-list'],
    queryFn: async () => {
      const res = await api.get('/api/user/schedules')
      return res.data.data
    },
  })

  const { data: gallery = [] } = useQuery({
    queryKey: ['gallery-media'],
    queryFn: async () => {
      const res = await api.get('/api/user/media')
      return res.data.data
    },
  })

  useEffect(() => {
    if (data) {
      if (data.template_id) setActivePresetId(data.template_id)
      if (data.template_config) {
        setTemplateConfig(data.template_config)
      }
    }
  }, [data])

  const saveConfigMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put('/api/user/invitation', payload)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitation'] })
      success(t('common.success', 'Invitation design saved!'))
    },
    onError: () => {
      error('Failed to save invitation design')
    },
  })

  const publishMutation = useMutation({
    mutationFn: async (publish) => {
      const endpoint = publish
        ? '/api/user/invitation/publish'
        : '/api/user/invitation/unpublish'
      const res = await api.post(endpoint)
      return res.data.data
    },
    onSuccess: (_, publish) => {
      queryClient.invalidateQueries({ queryKey: ['user-invitation'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      setIsPublishModalOpen(false)
      success(
        publish
          ? t('invitation.publishSuccess', 'Invitation published successfully!')
          : t('invitation.unpublishSuccess', 'Invitation unpublished')
      )
    },
  })

  const handleApplyPreset = (preset) => {
    setActivePresetId(preset.id)
    setTemplateConfig({ ...preset })
  }

  const toggleBlockVisibility = (blockId) => {
    const updatedBlocks = templateConfig.blocks.map((b) =>
      b.id === blockId ? { ...b, enabled: !b.enabled } : b
    )
    setTemplateConfig({ ...templateConfig, blocks: updatedBlocks })
  }

  const moveBlockOrder = (index, dir) => {
    const target = index + dir
    if (target < 0 || target >= templateConfig.blocks.length) return
    const newBlocks = [...templateConfig.blocks]
    const [moved] = newBlocks.splice(index, 1)
    newBlocks.splice(target, 0, moved)
    setTemplateConfig({ ...templateConfig, blocks: newBlocks })
  }

  const handleSaveDesign = () => {
    saveConfigMutation.mutate({
      template_id: activePresetId,
      template_config: templateConfig,
    })
  }

  if (isLoading) {
    return <SkeletonCard />
  }

  const wedding = data?.wedding
  const isPublished = !!data?.is_published

  return (
    <div className="space-y-6 font-ui">
      {/* Top Header & Publish Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
            {t('invitation.title', 'Design & Publish')}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500">
            {t('invitation.subtitle', 'Choose themes, customize colors and fonts, and preview live')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleSaveDesign}
            isLoading={saveConfigMutation.isPending}
            leftIcon={Save}
          >
            {t('common.save', 'Save Design')}
          </Button>

          <Button
            variant={isPublished ? 'outline' : 'gold'}
            onClick={() => setIsPublishModalOpen(true)}
          >
            {isPublished
              ? t('dashboard.unpublish', 'Unpublish')
              : t('dashboard.publish', 'Publish Live')}
          </Button>
        </div>
      </div>

      {/* Editor & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Customization Sidebar (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preset Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-4 h-4 text-gold-600" />
                <span>{t('invitation.templates', 'Template Presets')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {PRESETS.map((preset) => {
                const isSelected = activePresetId === preset.id
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className={`
                      p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between
                      ${
                        isSelected
                          ? 'border-gold-500 bg-gold-50/50 shadow-sm'
                          : 'border-cream-200 bg-white hover:border-gold-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-serif font-bold"
                        style={{ backgroundColor: preset.primaryColor }}
                      >
                        TK
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-charcoal-900">
                          {preset.name_kh}
                        </h4>
                        <p className="text-xs text-charcoal-500 font-serif">{preset.name_en}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-gold-500 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Color & Typography Customizer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('invitation.customizer', 'Styling & Colors')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    {t('invitation.colors', 'Primary Color')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={templateConfig.primaryColor || '#C59B27'}
                      onChange={(e) =>
                        setTemplateConfig({ ...templateConfig, primaryColor: e.target.value })
                      }
                      className="w-9 h-9 rounded-lg cursor-pointer border border-cream-300 p-0.5"
                    />
                    <span className="text-xs font-mono text-charcoal-700">
                      {templateConfig.primaryColor}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={templateConfig.accentColor || '#8B1E3F'}
                      onChange={(e) =>
                        setTemplateConfig({ ...templateConfig, accentColor: e.target.value })
                      }
                      className="w-9 h-9 rounded-lg cursor-pointer border border-cream-300 p-0.5"
                    />
                    <span className="text-xs font-mono text-charcoal-700">
                      {templateConfig.accentColor}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  {t('invitation.fonts', 'Heading Typography')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setTemplateConfig({ ...templateConfig, fontHeading: 'moul' })
                    }
                    className={`p-2.5 rounded-xl border text-xs font-moul transition-all ${
                      templateConfig.fontHeading === 'moul'
                        ? 'bg-gold-50 border-gold-500 text-gold-800'
                        : 'bg-white border-cream-200 text-charcoal-600'
                    }`}
                  >
                    អក្សរមូល (Moul)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTemplateConfig({ ...templateConfig, fontHeading: 'serif' })
                    }
                    className={`p-2.5 rounded-xl border text-xs font-serif font-bold transition-all ${
                      templateConfig.fontHeading === 'serif'
                        ? 'bg-gold-50 border-gold-500 text-gold-800'
                        : 'bg-white border-cream-200 text-charcoal-600'
                    }`}
                  >
                    Serif Roman
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Block Order & Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('invitation.blocks', 'Content Blocks')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {templateConfig.blocks?.map((block, idx) => {
                const isEnabled = block.enabled !== false
                return (
                  <div
                    key={block.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isEnabled ? 'bg-white border-cream-200' : 'bg-cream-100/60 border-cream-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => toggleBlockVisibility(block.id)}
                        className={`p-1.5 rounded-lg touch-target flex items-center justify-center ${
                          isEnabled ? 'text-green-600 hover:bg-green-50' : 'text-charcoal-400 hover:bg-cream-200'
                        }`}
                        title={isEnabled ? 'Hide block' : 'Show block'}
                      >
                        {isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <span className="text-sm font-semibold text-charcoal-800">
                        {block.title || block.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveBlockOrder(idx, -1)}
                        className="p-1.5 text-charcoal-400 hover:text-charcoal-700 disabled:opacity-30 rounded"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === templateConfig.blocks.length - 1}
                        onClick={() => moveBlockOrder(idx, 1)}
                        className="p-1.5 text-charcoal-400 hover:text-charcoal-700 disabled:opacity-30 rounded"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Frame (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-xs font-bold text-charcoal-700 uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-gold-600" />
              <span>{t('invitation.mobileView', 'Mobile Frame Live Preview')}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreenPreview(true)}
              className="flex items-center gap-1.5 text-xs text-burgundy-600 hover:text-burgundy-700 font-semibold font-ui"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{t('invitation.fullscreenView', 'Full Screen')}</span>
            </button>
          </div>

          {/* Smartphone Simulator Frame */}
          <div className="mx-auto max-w-[390px] rounded-[44px] border-[10px] border-charcoal-800 shadow-elevated overflow-hidden bg-white relative">
            {/* Phone Speaker Notch */}
            <div className="w-32 h-5 bg-charcoal-800 rounded-b-xl mx-auto absolute top-0 inset-x-0 z-30" />

            {/* Scrollable Screen Content */}
            <div className="h-[680px] overflow-y-auto">
              <TemplateRenderer
                wedding={wedding}
                guest={{ name: 'ភ្ញៀវកិត្តិយស (គំរូ)', seats: 2 }}
                schedules={schedules}
                gallery={gallery}
                wishes={[]}
                templateConfig={templateConfig}
                lang={i18n.language}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {isFullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/80 backdrop-blur-md flex flex-col">
          <div className="p-4 bg-white/95 border-b border-cream-200 flex items-center justify-between px-6">
            <h3 className="text-base font-bold text-charcoal-900 font-ui">
              {t('invitation.livePreview', 'Live Preview')} - {wedding?.groom_name_kh} & {wedding?.bride_name_kh}
            </h3>
            <button
              type="button"
              onClick={() => setIsFullscreenPreview(false)}
              className="p-2 text-charcoal-600 hover:text-charcoal-900 rounded-lg touch-target"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <TemplateRenderer
              wedding={wedding}
              guest={{ name: 'ភ្ញៀវកិត្តិយស (គំរូ)', seats: 2 }}
              schedules={schedules}
              gallery={gallery}
              wishes={[]}
              templateConfig={templateConfig}
              lang={i18n.language}
            />
          </div>
        </div>
      )}

      {/* Publish / Unpublish Confirmation Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title={
          isPublished
            ? t('invitation.unpublishConfirm', 'Unpublish Invitation?')
            : t('invitation.publishConfirm', 'Publish Invitation Live?')
        }
      >
        <div className="space-y-4 font-ui">
          <p className="text-sm text-charcoal-600 leading-relaxed">
            {isPublished
              ? 'ការផ្អាកការផ្សាយនឹងធ្វើឱ្យភ្ញៀវមិនអាចបើកមើលធៀបការបានជាបណ្តោះអាសន្ន។'
              : 'ការផ្សាយជាសាធារណៈនឹងអនុញ្ញាតឱ្យភ្ញៀវបើកមើលធៀបការ ឆ្លើយតប RSVP និងផ្ញើពាក្យជូនពរបានភ្លាមៗ។'}
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-cream-200">
            <Button variant="ghost" onClick={() => setIsPublishModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              variant={isPublished ? 'danger' : 'gold'}
              isLoading={publishMutation.isPending}
              onClick={() => publishMutation.mutate(!isPublished)}
            >
              {isPublished ? t('dashboard.unpublish', 'Unpublish') : t('dashboard.publish', 'Publish Live')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default InvitationPage
