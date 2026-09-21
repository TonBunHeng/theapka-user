import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Clock, MapPin, Calendar, Sparkles } from 'lucide-react'
import api from '../../lib/api'
import Card, { CardContent } from '../../components/Card'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import EmptyState from '../../components/EmptyState'
import { SkeletonCard } from '../../components/Skeleton'
import { toKhmerNumeral } from '../../lib/format'
import { useToast } from '../../components/Toast'

export function SchedulePage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  const isKhmer = i18n.language === 'km'

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    start_time: '08:00',
    end_time: '10:00',
    venue: '',
    description: '',
  })

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['schedules-list'],
    queryFn: async () => {
      const res = await api.get('/api/user/schedules')
      return res.data.data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingItem) {
        const res = await api.put(`/api/user/schedules/${editingItem.id}`, payload)
        return res.data.data
      } else {
        const res = await api.post('/api/user/schedules', payload)
        return res.data.data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules-list'] })
      setIsModalOpen(false)
      setEditingItem(null)
      success(t('common.success', 'Schedule saved successfully!'))
    },
    onError: () => {
      error('Failed to save schedule')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/user/schedules/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules-list'] })
      success(t('common.success', 'Event deleted!'))
    },
  })

  const openAddModal = () => {
    setEditingItem(null)
    setFormData({
      title: '',
      start_time: '08:00',
      end_time: '10:00',
      venue: '',
      description: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      start_time: item.start_time,
      end_time: item.end_time || '',
      venue: item.venue || '',
      description: item.description || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm(t('common.confirmDelete', 'Are you sure you want to delete this event?'))) {
      deleteMutation.mutate(id)
    }
  }

  const moveOrder = async (index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= schedules.length) return

    const current = schedules[index]
    const target = schedules[targetIndex]

    await api.put(`/api/user/schedules/${current.id}`, { order: target.order })
    await api.put(`/api/user/schedules/${target.id}`, { order: current.order })
    queryClient.invalidateQueries({ queryKey: ['schedules-list'] })
  }

  return (
    <div className="space-y-6 font-ui">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
            {t('schedule.title', 'Wedding Schedule')}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500">
            {t('schedule.subtitle', 'Order of ceremony, blessings, banquets, and celebrations')}
          </p>
        </div>

        <Button variant="primary" onClick={openAddModal} leftIcon={Plus}>
          {t('schedule.addEvent', 'Add Event')}
        </Button>
      </div>

      {/* Schedule Items List */}
      {isLoading ? (
        <SkeletonCard />
      ) : schedules.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={t('schedule.empty', 'No events scheduled yet')}
          description="បន្ថែមកម្មវិធីពិធីសែន ពិធីកាត់សក់ សំពះផ្ទឹម និងពិធីជប់លៀង"
          actionLabel={t('schedule.addEvent', 'Add Event')}
          onAction={openAddModal}
        />
      ) : (
        <div className="space-y-4">
          {schedules.map((item, index) => {
            const timeStr = `${item.start_time} - ${item.end_time || ''}`
            return (
              <Card key={item.id} className="hover:border-gold-300 transition-all">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gold-100 text-gold-700 font-bold flex items-center justify-center shrink-0">
                      {isKhmer ? toKhmerNumeral(index + 1) : index + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-bold text-charcoal-900">{item.title}</h4>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cream-100 text-xs font-medium text-charcoal-700">
                          <Clock className="w-3.5 h-3.5 text-gold-600" />
                          <span>{isKhmer ? toKhmerNumeral(timeStr) : timeStr}</span>
                        </span>
                      </div>

                      {item.venue && (
                        <p className="text-xs text-gold-700 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{item.venue}</span>
                        </p>
                      )}

                      {item.description && (
                        <p className="text-xs sm:text-sm text-charcoal-600 pt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions (Move Up, Move Down, Edit, Delete) */}
                  <div className="flex items-center gap-1 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-cream-100">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveOrder(index, -1)}
                      className="p-2 text-charcoal-400 hover:text-charcoal-700 disabled:opacity-30 rounded-lg touch-target"
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      disabled={index === schedules.length - 1}
                      onClick={() => moveOrder(index, 1)}
                      className="p-2 text-charcoal-400 hover:text-charcoal-700 disabled:opacity-30 rounded-lg touch-target"
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-2 text-charcoal-600 hover:text-burgundy-600 rounded-lg touch-target"
                      title={t('common.edit', 'Edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-charcoal-400 hover:text-red-600 rounded-lg touch-target"
                      title={t('common.delete', 'Delete')}
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
        title={editingItem ? t('schedule.editEvent', 'Edit Event') : t('schedule.addEvent', 'Add Event')}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            saveMutation.mutate(formData)
          }}
          className="space-y-4 font-ui"
        >
          <Input
            label={t('schedule.eventTitle', 'Event Title')}
            required
            placeholder="ពិធីសំពះផ្ទឹម"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('schedule.startTime', 'Start Time')}
              type="time"
              required
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
            <Input
              label={t('schedule.endTime', 'End Time')}
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            />
          </div>

          <Input
            label={t('schedule.venue', 'Venue / Location')}
            placeholder="គេហដ្ឋានខាងស្រី"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-charcoal-800 font-ui">
              {t('schedule.description', 'Description')}
            </label>
            <textarea
              rows={3}
              placeholder="ការពិពណ៌នាអំពីពិធី..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm font-ui outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={saveMutation.isPending}>
              {t('common.save', 'Save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default SchedulePage
