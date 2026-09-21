import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, FolderKanban, Users } from 'lucide-react'
import api from '../../lib/api'
import Card, { CardContent } from '../../components/Card'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import EmptyState from '../../components/EmptyState'
import { SkeletonCard } from '../../components/Skeleton'
import { toKhmerNumeral } from '../../lib/format'
import { useToast } from '../../components/Toast'

const COLOR_PRESETS = [
  '#8B1E3F', // Royal Burgundy
  '#1A4D3E', // Deep Emerald
  '#C59B27', // Soft Gold
  '#2563EB', // Sapphire Blue
  '#7C3AED', // Purple
  '#EA580C', // Orange
  '#4B5563', // Charcoal Gray
]

export function GuestGroupsPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  const isKhmer = i18n.language === 'km'

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    color: '#8B1E3F',
  })

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['guest-groups'],
    queryFn: async () => {
      const res = await api.get('/api/user/guest-groups')
      return res.data.data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingGroup) {
        const res = await api.put(`/api/user/guest-groups/${editingGroup.id}`, payload)
        return res.data.data
      } else {
        const res = await api.post('/api/user/guest-groups', payload)
        return res.data.data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-groups'] })
      setIsModalOpen(false)
      setEditingGroup(null)
      success(t('common.success', 'Group saved successfully!'))
    },
    onError: () => error('Failed to save group'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/user/guest-groups/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-groups'] })
      success(t('common.success', 'Group deleted'))
    },
  })

  const openAdd = () => {
    setEditingGroup(null)
    setFormData({ name: '', color: '#8B1E3F' })
    setIsModalOpen(true)
  }

  const openEdit = (grp) => {
    setEditingGroup(grp)
    setFormData({ name: grp.name, color: grp.color || '#8B1E3F' })
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 font-ui">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
            {t('groups.title', 'Guest Groups')}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500">
            {t('groups.subtitle', 'Organize guests into groups (Family, Friends, Colleagues)')}
          </p>
        </div>

        <Button variant="primary" onClick={openAdd} leftIcon={Plus}>
          {t('groups.addGroup', 'Create Group')}
        </Button>
      </div>

      {isLoading ? (
        <SkeletonCard />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={t('groups.empty', 'No guest groups created yet')}
          description="បង្កើតក្រុមដើម្បីងាយស្រួលគ្រប់គ្រងភ្ញៀវតាមប្រភេទ"
          actionLabel={t('groups.addGroup', 'Create Group')}
          onAction={openAdd}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card key={group.id} className="hover:border-gold-300 transition-all">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shadow-sm shrink-0"
                      style={{ backgroundColor: group.color || '#C59B27' }}
                    />
                    <h4 className="text-base font-bold text-charcoal-900">{group.name}</h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(group)}
                      className="p-1.5 text-charcoal-500 hover:text-charcoal-900 rounded"
                      title={t('common.edit', 'Edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Delete this group?')) {
                          deleteMutation.mutate(group.id)
                        }
                      }}
                      className="p-1.5 text-charcoal-400 hover:text-red-600 rounded"
                      title={t('common.delete', 'Delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-cream-100 text-xs text-charcoal-600">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gold-600" />
                    <span>{t('groups.guestCount', 'Guests')}</span>
                  </span>
                  <span className="font-bold text-charcoal-900 text-sm">
                    {isKhmer ? toKhmerNumeral(group.count || 0) : group.count || 0} នាក់
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGroup ? t('groups.editGroup', 'Edit Group') : t('groups.addGroup', 'Create Group')}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            saveMutation.mutate(formData)
          }}
          className="space-y-4 font-ui"
        >
          <Input
            label={t('groups.groupName', 'Group Name')}
            required
            placeholder="គ្រួសារខាងប្រុស"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
              {t('groups.color', 'Color Tag')}
            </label>
            <div className="flex items-center gap-3">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c })}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    formData.color === c ? 'scale-125 ring-2 ring-gold-400 shadow-sm' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border border-cream-300 p-0.5"
              />
            </div>
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

export default GuestGroupsPage
