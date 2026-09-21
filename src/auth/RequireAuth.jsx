import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from './authStore'
import { useToast } from '../components/Toast'

export function RequireAuth({ children }) {
  const { isAuthenticated, user, logout } = useAuthStore()
  const location = useLocation()
  const { t } = useTranslation()
  const { warning } = useToast()

  const isAdminRole = user?.role === 'admin' || user?.role === 'super_admin'

  useEffect(() => {
    if (isAdminRole) {
      warning(t('auth.adminWarning', 'This account has Admin privileges. Please use the Admin Portal.'))
      logout()
    }
  }, [isAdminRole, logout, t, warning])

  if (!isAuthenticated || isAdminRole) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default RequireAuth
