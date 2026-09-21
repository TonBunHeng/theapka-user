import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './authStore'

export function RequireWedding({ children }) {
  const { wedding } = useAuthStore()
  const location = useLocation()

  const isOnboarding = location.pathname === '/onboarding'

  if (!wedding && !isOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  if (wedding && isOnboarding) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RequireWedding
