import React, { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Palette,
  Maximize2,
  Check,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  ExternalLink,
  Volume2,
  VolumeX,
} from "lucide-react"
import api from "../../lib/api"
import TemplateRenderer from "../../templates/TemplateRenderer"
import Card, { CardContent, CardHeader, CardTitle } from "../../components/Card"
import PageHeader from "../../components/PageHeader"
import Button from "../../components/Button"
import Modal from "../../components/Modal"
import { SkeletonCard } from "../../components/Skeleton"
import { useToast } from "../../components/Toast"
import { FONT_OPTIONS } from "../../lib/fonts"

import traditionalPreset from "../../templates/presets/traditionalGold.json"
import modernPreset from "../../templates/presets/modernBurgundy.json"
import minimalPreset from "../../templates/presets/minimalEmerald.json"

const PRESETS = [traditionalPreset, modernPreset, minimalPreset]

export function InvitationPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  const [activePresetId, setActivePresetId] = useState("traditional-gold")
  const [templateConfig, setTemplateConfig] = useState(traditionalPreset)
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [isPreviewMusicPlaying, setIsPreviewMusicPlaying] = useState(false)
  const previewMusicRef = useRef(null)

  // Fetch current invitation config & wedding info
  const { data, isLoading } = useQuery({
    queryKey: ["user-invitation"],
    queryFn: async () => {
      const res = await api.get("/api/user/invitation")
      return res.data.data
    },
  })

  // Fetch schedules and gallery for the preview
  const { data: schedules = [] } = useQuery({
    queryKey: ["schedules-list"],
    queryFn: async () => {
      const res = await api.get("/api/user/schedules")
      return res.data.data
    },
  })

  const { data: gallery = [] } = useQuery({
    queryKey: ["gallery-media"],
    queryFn: async () => {
      const res = await api.get("/api/user/media")
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
      const res = await api.put("/api/user/invitation", payload)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-invitation"] })
      success(t("common.success", "Invitation design saved!"))
    },
    onError: () => {
      error("Failed to save invitation design")
    },
  })

  const publishMutation = useMutation({
    mutationFn: async (publish) => {
      const endpoint = publish
        ? "/api/user/invitation/publish"
        : "/api/user/invitation/unpublish"
      const res = await api.post(endpoint)
      return res.data.data
    },
    onSuccess: (_, publish) => {
      queryClient.invalidateQueries({ queryKey: ["user-invitation"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] })
      setIsPublishModalOpen(false)
      success(
        publish
          ? t("invitation.publishSuccess", "Invitation published successfully!")
          : t("invitation.unpublishSuccess", "Invitation unpublished")
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

  const wedding = data?.wedding

  useEffect(() => {
    const musicUrl = wedding?.music_url || "/music/ភ្ជាប់និស្ស័យ.mp3"
    const audio = new Audio(musicUrl)
    audio.loop = true
    audio.preload = "auto"
    previewMusicRef.current = audio

    if (isPreviewMusicPlaying) {
      audio.play().catch(() => setIsPreviewMusicPlaying(false))
    }

    return () => {
      audio.pause()
      previewMusicRef.current = null
    }
  }, [wedding?.music_url, isPreviewMusicPlaying])

  const togglePreviewMusic = () => {
    const audio = previewMusicRef.current
    if (!audio) return

    if (isPreviewMusicPlaying) {
      audio.pause()
      setIsPreviewMusicPlaying(false)
      return
    }

    audio.play().then(() => setIsPreviewMusicPlaying(true)).catch(() => setIsPreviewMusicPlaying(false))
  }

  const togglePreviewLanguage = () => {
    const next = i18n.language === "km" ? "en" : "km"
    i18n.changeLanguage(next)
  }

  if (isLoading) {
    return <SkeletonCard />
  }

  const isPublished = !!data?.is_published

  return (
    <div className="space-y-6 font-ui">
      {/* Top Header & Publish Bar */}
      <PageHeader
        title={t("invitation.title", "Design & Publish")}
        subtitle={t("invitation.subtitle", "Choose themes, customize colors and fonts, and preview live")}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleSaveDesign}
              isLoading={saveConfigMutation.isPending}
              leftIcon={Save}
            >
              {t("common.save", "Save Design")}
            </Button>

            <Button
              variant={isPublished ? "outline" : "primary"}
              onClick={() => setIsPublishModalOpen(true)}
            >
              {isPublished
                ? t("dashboard.unpublish", "Unpublish")
                : t("dashboard.publish", "Publish Live")}
            </Button>
          </div>
        }
      />

      {/* Editor & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Customization Sidebar (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preset Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-4 h-4 text-brand-emerald-700" />
                <span>{t("invitation.templates", "Template Presets")}</span>
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
                      p-3.5 rounded border-2 cursor-pointer transition-all flex items-center justify-between
                      ${
                        isSelected
                          ? "border-brand-emerald-600 bg-brand-emerald-50/40 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-serif font-bold shadow-sm"
                        style={{ backgroundColor: preset.primaryColor }}
                      >
                        TK
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {preset.name_kh}
                        </h4>
                        <p className="text-xs text-slate-500 font-serif">{preset.name_en}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-brand-emerald-700 text-white flex items-center justify-center shadow-sm">
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
              <CardTitle className="text-base">{t("invitation.customizer", "Styling & Colors")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t("invitation.colors", "Primary Color")}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={templateConfig.primaryColor || "#046A38"}
                      onChange={(e) =>
                        setTemplateConfig({ ...templateConfig, primaryColor: e.target.value })
                      }
                      className="w-9 h-9 rounded cursor-pointer border border-slate-300 p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-700">
                      {templateConfig.primaryColor}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={templateConfig.accentColor || "#C59B27"}
                      onChange={(e) =>
                        setTemplateConfig({ ...templateConfig, accentColor: e.target.value })
                      }
                      className="w-9 h-9 rounded cursor-pointer border border-slate-300 p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-700">
                      {templateConfig.accentColor}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t("invitation.fonts", "Heading Typography")}
                </label>
                <select
                  value={templateConfig.fonts?.heading || "Kantumruy Pro"}
                  onChange={(e) =>
                    setTemplateConfig({
                      ...templateConfig,
                      fonts: { ...templateConfig.fonts, heading: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded border border-slate-300 bg-white text-slate-800 focus:border-brand-emerald-600 focus:ring-2 focus:ring-brand-emerald-100 outline-none font-ui"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name} ({f.label_kh})
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Block Order & Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("invitation.blocks", "Content Blocks")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {templateConfig.blocks?.map((block, idx) => {
                const isEnabled = block.enabled !== false
                return (
                  <div
                    key={block.id}
                    className={`flex items-center justify-between p-3 rounded border transition-all ${
                      isEnabled ? "bg-white border-slate-200" : "bg-slate-50 border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => toggleBlockVisibility(block.id)}
                        className={`p-1.5 rounded touch-target flex items-center justify-center transition-colors ${
                          isEnabled ? "text-brand-emerald-700 hover:bg-brand-emerald-50" : "text-slate-400 hover:bg-slate-200"
                        }`}
                        title={isEnabled ? "Hide block" : "Show block"}
                      >
                        {isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <span className="text-sm font-semibold text-slate-800">
                        {block.title || block.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveBlockOrder(idx, -1)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === templateConfig.blocks.length - 1}
                        onClick={() => moveBlockOrder(idx, 1)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded transition-colors"
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
          <div className="flex items-center justify-end px-2">
            <a
              href={wedding?.slug ? `/i/${wedding.slug}?autoplay=1` : "#"}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => {
                if (!wedding?.slug) event.preventDefault()
              }}
              className="flex items-center gap-1.5 text-xs text-brand-emerald-700 hover:text-brand-emerald-800 font-semibold font-ui mr-4 transition-colors"
              aria-disabled={!wedding?.slug}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t("dashboard.preview", "Preview")}</span>
            </a>
            <button
              type="button"
              onClick={() => setIsFullscreenPreview(true)}
              className="flex items-center gap-1.5 text-xs text-brand-emerald-700 hover:text-brand-emerald-800 font-semibold font-ui transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{t("invitation.fullscreenView", "Full Screen")}</span>
            </button>
          </div>

          <div className="flex justify-center p-4">
            <div className="w-full max-w-[420px] overflow-hidden rounded-[2.25rem] border-4 border-slate-800 bg-slate-900 shadow-2xl p-2.5">
              <div className="h-[700px] overflow-y-auto rounded-[1.75rem] bg-white">
                <TemplateRenderer
                  wedding={wedding}
                  guest={{ name: "ភ្ញៀវកិត្តិយស (គំរូ)", seats: 2 }}
                  schedules={schedules}
                  gallery={gallery}
                  wishes={[]}
                  templateConfig={templateConfig}
                  lang={i18n.language}
                  previewMode
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pb-2">
            <button
              type="button"
              aria-label={isPreviewMusicPlaying ? "Pause music" : "Play music"}
              onClick={togglePreviewMusic}
              className={`h-12 w-12 rounded-full border shadow-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
                isPreviewMusicPlaying
                  ? "border-brand-emerald-600 bg-brand-emerald-50 text-brand-emerald-700 ring-2 ring-brand-emerald-500/20"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {isPreviewMusicPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={togglePreviewLanguage}
              aria-label="Toggle language"
              className="h-12 w-12 rounded-full border border-slate-300 bg-white hover:bg-slate-50 shadow-sm flex items-center justify-center text-slate-800 font-bold tracking-wider text-xs transition-all hover:scale-105 active:scale-95"
            >
              {i18n.language === "km" ? "EN" : "ខ្មែរ"}
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {isFullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col">
          <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <h3 className="text-base font-bold text-slate-900 font-ui">
              {t("invitation.livePreview", "Live Preview")} - {wedding?.groom_name_kh} & {wedding?.bride_name_kh}
            </h3>
            <button
              type="button"
              onClick={() => setIsFullscreenPreview(false)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded touch-target transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <TemplateRenderer
              wedding={wedding}
              guest={{ name: "ភ្ញៀវកិត្តិយស (គំរូ)", seats: 2 }}
              schedules={schedules}
              gallery={gallery}
              wishes={[]}
              templateConfig={templateConfig}
              lang={i18n.language}
              previewMode
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
            ? t("invitation.unpublishConfirm", "Unpublish Invitation?")
            : t("invitation.publishConfirm", "Publish Invitation Live?")
        }
      >
        <div className="space-y-4 font-ui">
          <p className="text-sm text-slate-600 leading-relaxed">
            {isPublished
              ? "ការផ្អាកការផ្សាយនឹងធ្វើឱ្យភ្ញៀវមិនអាចបើកមើលធៀបការបានជាបណ្តោះអាសន្ន។"
              : "ការផ្សាយជាសាធារណៈនឹងអនុញ្ញាតឱ្យភ្ញៀវបើកមើលធៀបការ ឆ្លើយតប RSVP និងផ្ញើពាក្យជូនពរបានភ្លាមៗ។"}
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsPublishModalOpen(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              variant={isPublished ? "danger" : "primary"}
              isLoading={publishMutation.isPending}
              onClick={() => publishMutation.mutate(!isPublished)}
            >
              {isPublished ? t("dashboard.unpublish", "Unpublish") : t("dashboard.publish", "Publish Live")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default InvitationPage
