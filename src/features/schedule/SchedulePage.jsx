import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Clock, MapPin, Calendar } from "lucide-react"
import api from "../../lib/api"
import Card, { CardContent } from "../../components/Card"
import Button from "../../components/Button"
import Modal from "../../components/Modal"
import Input from "../../components/Input"
import PageHeader from "../../components/PageHeader"
import EmptyState from "../../components/EmptyState"
import { SkeletonCard } from "../../components/Skeleton"
import { toKhmerNumeral } from "../../lib/format"
import { useToast } from "../../components/Toast"

export function SchedulePage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  const isKhmer = i18n.language === "km"

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    start_time: "08:00",
    end_time: "10:00",
    venue: "",
    description: "",
  })

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["schedules-list"],
    queryFn: async () => {
      const res = await api.get("/api/user/schedules")
      return res.data.data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingItem) {
        const res = await api.put(`/api/user/schedules/${editingItem.id}`, payload)
        return res.data.data
      } else {
        const res = await api.post("/api/user/schedules", payload)
        return res.data.data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules-list"] })
      setIsModalOpen(false)
      setEditingItem(null)
      success(t("common.success", "Schedule saved successfully!"))
    },
    onError: () => {
      error("Failed to save schedule")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/user/schedules/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules-list"] })
      success(t("common.success", "Event deleted!"))
    },
  })

  const openAddModal = () => {
    setEditingItem(null)
    setFormData({
      title: "",
      start_time: "08:00",
      end_time: "10:00",
      venue: "",
      description: "",
    })
    setIsModalOpen(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      start_time: item.start_time,
      end_time: item.end_time || "",
      venue: item.venue || "",
      description: item.description || "",
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm(t("common.confirmDelete", "Delete this schedule item?"))) {
      deleteMutation.mutate(id)
    }
  }

  const moveOrder = async (index, dir) => {
    const targetIdx = index + dir
    if (targetIdx < 0 || targetIdx >= schedules.length) return

    const current = schedules[index]
    const target = schedules[targetIdx]

    await api.put(`/api/user/schedules/${current.id}`, { order: target.order })
    await api.put(`/api/user/schedules/${target.id}`, { order: current.order })
    queryClient.invalidateQueries({ queryKey: ["schedules-list"] })
  }

  return (
    <div className="space-y-6 font-ui">
      {/* Header */}
      <PageHeader
        title={t("schedule.title", "Wedding Schedule")}
        subtitle={t("schedule.subtitle", "Order of ceremony, blessings, banquets, and celebrations")}
        actions={
          <Button variant="primary" onClick={openAddModal} leftIcon={Plus}>
            {t("schedule.addEvent", "Add Event")}
          </Button>
        }
      />

      {/* Schedule Items List */}
      {isLoading ? (
        <SkeletonCard />
      ) : schedules.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={t("schedule.empty", "No events scheduled yet")}
          description="បន្ថែមកម្មវិធីពិធីសែន ពិធីកាត់សក់ សំពះផ្ទឹម និងពិធីជប់លៀង"
          actionLabel={t("schedule.addEvent", "Add Event")}
          onAction={openAddModal}
        />
      ) : (
        <div className="space-y-4">
          {schedules.map((item, index) => {
            const timeStr = `${item.start_time} - ${item.end_time || ""}`
            return (
              <Card key={item.id} className="hover:border-slate-300 shadow-sm transition-all">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded bg-brand-emerald-50 text-brand-emerald-700 border border-brand-emerald-200/60 font-bold flex items-center justify-center shrink-0">
                      {isKhmer ? toKhmerNumeral(index + 1) : index + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-brand-emerald-700" />
                          <span>{isKhmer ? toKhmerNumeral(timeStr) : timeStr}</span>
                        </span>
                      </div>

                      {item.venue && (
                        <p className="text-xs text-slate-600 flex items-center gap-1.5 pt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-brand-emerald-600" />
                          <span>{item.venue}</span>
                        </p>
                      )}

                      {item.description && (
                        <p className="text-xs sm:text-sm text-slate-600 pt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions (Move Up, Move Down, Edit, Delete) */}
                  <div className="flex items-center gap-1 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveOrder(index, -1)}
                      className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded touch-target transition-colors"
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      disabled={index === schedules.length - 1}
                      onClick={() => moveOrder(index, 1)}
                      className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded touch-target transition-colors"
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-2 text-slate-500 hover:text-brand-emerald-700 rounded touch-target transition-colors"
                      title={t("common.edit", "Edit")}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded touch-target transition-colors"
                      title={t("common.delete", "Delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? t("schedule.editEvent", "Edit Event") : t("schedule.addEvent", "Add Event")}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            saveMutation.mutate(formData)
          }}
          className="space-y-4 font-ui"
        >
          <Input
            label={t("schedule.eventTitle", "Event Title")}
            required
            placeholder="ពិធីសំពះផ្ទឹម"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("schedule.startTime", "Start Time")}
              type="time"
              required
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
            <Input
              label={t("schedule.endTime", "End Time")}
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            />
          </div>

          <Input
            label={t("schedule.venue", "Venue / Location")}
            placeholder="គេហដ្ឋានខាងស្រី"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {t("schedule.description", "Description")}
            </label>
            <textarea
              rows={3}
              placeholder="ការពិពណ៌នាអំពីពិធី..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded border border-slate-300 focus:border-brand-emerald-600 focus:ring-2 focus:ring-brand-emerald-100 outline-none font-ui"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button type="submit" variant="primary" isLoading={saveMutation.isPending}>
              {t("common.save", "Save")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default SchedulePage
