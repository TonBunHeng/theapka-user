import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { User, Lock, Globe, Save, Check } from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../auth/authStore'
import Card, { CardContent, CardHeader, CardTitle } from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { useToast } from '../../components/Toast'

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { user, updateUser } = useAuthStore()
  const { success, error } = useToast()

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  })

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put('/api/user/profile', payload)
      return res.data.data
    },
    onSuccess: (updated) => {
      updateUser(updated)
      success(t('common.success', 'Profile updated successfully!'))
    },
    onError: () => error('Failed to update profile'),
  })

  // Password update mutation
  const passwordMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put('/api/user/password', payload)
      return res.data.data
    },
    onSuccess: () => {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
      success(t('common.success', 'Password changed successfully!'))
    },
    onError: () => error('Failed to change password'),
  })

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    profileMutation.mutate(profileForm)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      error('New passwords do not match')
      return
    }
    passwordMutation.mutate(passwordForm)
  }

  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang)
  }

  return (
    <div className="space-y-6 font-ui max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
          {t('settings.title', 'Account Settings')}
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-500">
          {t('settings.subtitle', 'Manage profile information, password, and language')}
        </p>
      </div>

      {/* Language Switch Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4 text-gold-600" />
            <span>{t('settings.language', 'Language')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => switchLanguage('km')}
              className={`flex-1 p-3 rounded-xl border font-semibold text-xs sm:text-sm transition-all flex items-center justify-between touch-target ${
                i18n.language === 'km'
                  ? 'bg-gold-50 border-gold-500 text-gold-900 shadow-sm'
                  : 'bg-white border-cream-200 text-charcoal-700 hover:bg-cream-50'
              }`}
            >
              <span>ភាសាខ្មែរ (Khmer - Default)</span>
              {i18n.language === 'km' && <Check className="w-4 h-4 text-gold-600" />}
            </button>

            <button
              type="button"
              onClick={() => switchLanguage('en')}
              className={`flex-1 p-3 rounded-xl border font-semibold text-xs sm:text-sm transition-all flex items-center justify-between touch-target ${
                i18n.language === 'en'
                  ? 'bg-gold-50 border-gold-500 text-gold-900 shadow-sm'
                  : 'bg-white border-cream-200 text-charcoal-700 hover:bg-cream-50'
              }`}
            >
              <span>English</span>
              {i18n.language === 'en' && <Check className="w-4 h-4 text-gold-600" />}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-gold-600" />
            <span>{t('settings.profile', 'Profile Info')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('auth.name', 'Full Name')}
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />

              <Input
                label={t('auth.phone', 'Phone Number')}
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('auth.email', 'Email Address')}
                type="email"
                required
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              />

              <Input
                label="Avatar URL"
                value={profileForm.avatar}
                onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={profileMutation.isPending}
                leftIcon={Save}
              >
                {t('common.save', 'Save Changes')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4 text-gold-600" />
            <span>{t('settings.changePassword', 'Change Password')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label={t('settings.currentPassword', 'Current Password')}
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('settings.newPassword', 'New Password')}
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />

              <Input
                label={t('settings.confirmNewPassword', 'Confirm New Password')}
                type="password"
                required
                value={passwordForm.confirmNewPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="secondary"
                isLoading={passwordMutation.isPending}
              >
                {t('settings.changePassword', 'Update Password')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage
