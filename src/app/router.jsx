import React, { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import AuthLayout from './layouts/AuthLayout'
import PublicLayout from './layouts/PublicLayout'
import RequireAuth from '../auth/RequireAuth'
import RequireWedding from '../auth/RequireWedding'
import { Skeleton } from '../components/Skeleton'

// Code splitting / Lazy loading routes
const LoginPage = lazy(() => import('../features/auth/LoginPage'))
const RegisterPage = lazy(() => import('../features/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('../features/auth/ForgotPasswordPage'))
const OnboardingPage = lazy(() => import('../features/onboarding/OnboardingPage'))

const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'))
const WeddingProfilePage = lazy(() => import('../features/wedding-profile/WeddingProfilePage'))
const SchedulePage = lazy(() => import('../features/schedule/SchedulePage'))
const InvitationPage = lazy(() => import('../features/invitations/InvitationPage'))
const GuestsPage = lazy(() => import('../features/guests/GuestsPage'))
const GuestGroupsPage = lazy(() => import('../features/guest-groups/GuestGroupsPage'))
const QrCodePage = lazy(() => import('../features/qr-code/QrCodePage'))
const GiftsPage = lazy(() => import('../features/gifts/GiftsPage'))
const GalleryPage = lazy(() => import('../features/gallery/GalleryPage'))
const LocationPage = lazy(() => import('../features/location/LocationPage'))
const SharePage = lazy(() => import('../features/share/SharePage'))
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'))

// Public Invitation Page (Small bundle, strictly isolated chunk)
const PublicInvitationPage = lazy(() => import('../public/InvitationPage'))

const LoadingFallback = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-emerald-700 rounded-full animate-spin" />
  </div>
)

export const router = createBrowserRouter([
  // Public Guest Invitation Routes (NO LOGIN, code-split chunk)
  {
    path: '/i',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <PublicLayout />
      </Suspense>
    ),
    children: [
      {
        path: ':slug',
        element: <PublicInvitationPage />,
      },
      {
        path: ':slug/:token',
        element: <PublicInvitationPage />,
      },
    ],
  },

  // Auth Routes (Login, Register, Forgot Password)
  {
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AuthLayout />
      </Suspense>
    ),
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
    ],
  },

  // Onboarding Wizard Route (Login required, wedding not yet required)
  {
    path: '/onboarding',
    element: (
      <RequireAuth>
        <Suspense fallback={<LoadingFallback />}>
          <OnboardingPage />
        </Suspense>
      </RequireAuth>
    ),
  },

  // Dashboard & Wedding Management Routes (Login + Wedding required)
  {
    path: '/',
    element: (
      <RequireAuth>
        <RequireWedding>
          <Suspense fallback={<LoadingFallback />}>
            <DashboardLayout />
          </Suspense>
        </RequireWedding>
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'wedding',
        element: <WeddingProfilePage />,
      },
      {
        path: 'schedule',
        element: <SchedulePage />,
      },
      {
        path: 'invitation',
        element: <InvitationPage />,
      },
      {
        path: 'guests',
        element: <GuestsPage />,
      },
      {
        path: 'guests/groups',
        element: <GuestGroupsPage />,
      },
      {
        path: 'qr',
        element: <QrCodePage />,
      },
      {
        path: 'gifts',
        element: <GiftsPage />,
      },
      {
        path: 'gallery',
        element: <GalleryPage />,
      },
      {
        path: 'location',
        element: <LocationPage />,
      },
      {
        path: 'share',
        element: <SharePage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },

  // Fallback Catch-All
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export default router
