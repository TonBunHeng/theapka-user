import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Lock, Mail, Sparkles, AlertCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../auth/authStore'
import api from '../../lib/api'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import { useToast } from '../../components/Toast'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()
  const { success, error, warning } = useToast()

  const [serverError, setServerError] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false)
  const [googleEmail, setGoogleEmail] = useState('')
  const [googleName, setGoogleName] = useState('')
  const [googleError, setGoogleError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Process authenticated user & token
  const processAuthSuccess = (user, token, wedding) => {
    if (user.role === 'admin' || user.role === 'super_admin') {
      warning(t('auth.adminWarning', 'This account has Admin privileges. Please use the Admin Portal.'))
      return
    }

    login({ user, token, wedding })
    success(t('common.success', 'Logged in successfully!'))

    if (!wedding) {
      navigate('/onboarding', { replace: true })
    } else {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }

  // Handle standard email/password login
  const onSubmit = async (formData) => {
    setServerError('')
    try {
      const res = await api.post('/api/auth/login', formData)
      const { user, token } = res.data.data

      if (user.role === 'admin' || user.role === 'super_admin') {
        warning(t('auth.adminWarning', 'This account has Admin privileges. Please use the Admin Portal.'))
        return
      }

      // Fetch user profile and wedding details
      const meRes = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const { wedding } = meRes.data.data

      processAuthSuccess(user, token, wedding)
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify credentials.'
      setServerError(msg)
      error(msg)
    }
  }

  // Handle Google authentication payload
  const handleGoogleAuth = async (payload) => {
    setIsGoogleLoading(true)
    setServerError('')
    setGoogleError('')

    try {
      const res = await api.post('/api/auth/google', payload)
      const { user, token, wedding } = res.data.data
      setIsGoogleModalOpen(false)
      processAuthSuccess(user, token, wedding)
    } catch (err) {
      const msg = err.response?.data?.message || 'Google authentication failed. Please try again.'
      setServerError(msg)
      setGoogleError(msg)
      error(msg)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  // Initialize Google Identity Services if client ID is configured
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) {
            handleGoogleAuth({ credential: response.credential })
          }
        },
      })
    }
  }, [])

  const onGoogleButtonClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsGoogleModalOpen(true)
        }
      })
    } else {
      setIsGoogleModalOpen(true)
    }
  }

  const handleModalGoogleSubmit = (e) => {
    e.preventDefault()
    if (!googleEmail || !googleEmail.includes('@')) {
      setGoogleError('Please enter a valid Google email address')
      return
    }
    handleGoogleAuth({
      email: googleEmail.trim(),
      name: googleName.trim() || undefined,
    })
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <div className="w-12 h-12 bg-brand-emerald-50 text-brand-emerald-700 border border-brand-emerald-200/60 rounded flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 font-display">
          {t('auth.loginTitle', 'Log in to Couple Portal')}
        </h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          {t('auth.loginSubtitle', 'Enter your credentials to manage your wedding celebration')}
        </p>
      </div>

      {serverError && (
        <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('auth.email', 'Email Address')}
          type="email"
          placeholder="example@theapka.com"
          leftIcon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">
              {t('auth.password', 'Password')}
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-brand-emerald-700 hover:text-brand-emerald-800 font-medium"
            >
              {t('auth.forgotPassword', 'Forgot Password?')}
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            leftIcon={Lock}
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          className="w-full py-2.5 text-sm font-semibold mt-2"
        >
          {t('auth.login', 'Log In')}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2.5 text-slate-500 font-medium font-ui">
            {t('auth.orContinueWith', 'Or continue with')}
          </span>
        </div>
      </div>

      {/* Google Sign In Button */}
      <button
        type="button"
        onClick={onGoogleButtonClick}
        disabled={isGoogleLoading || isSubmitting}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.09C3.29 21.48 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.59H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.41l4.02-3.09z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.29 2.52 1.26 6.59l4.02 3.09c.95-2.83 3.6-4.93 6.72-4.93z"
            />
          </svg>
        )}
        <span>
          {isGoogleLoading
            ? t('auth.connectingGoogle', 'Connecting to Google...')
            : t('auth.continueWithGoogle', 'Continue with Google')}
        </span>
      </button>

      {/* Register Link */}
      <div className="text-center text-xs text-slate-600 font-ui pt-1">
        <span>{t('auth.noAccount', "Don't have an account?")} </span>
        <Link
          to="/register"
          className="font-bold text-brand-emerald-700 hover:text-brand-emerald-800 underline ml-1"
        >
          {t('auth.register', 'Register')}
        </Link>
      </div>

      {/* Google Connect Modal (Fallback when direct client ID not in env) */}
      <Modal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        title={t('auth.connectGoogleTitle', 'Connect with Google')}
        description={t(
          'auth.connectGoogleSubtitle',
          'Enter your Google account email to sign in or create your account'
        )}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleModalGoogleSubmit} className="space-y-4 pt-2">
          {googleError && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{googleError}</span>
            </div>
          )}

          <Input
            label={t('auth.googleEmail', 'Google Email Address')}
            type="email"
            required
            placeholder="yourname@gmail.com"
            value={googleEmail}
            onChange={(e) => setGoogleEmail(e.target.value)}
            leftIcon={Mail}
          />

          <Input
            label={t('auth.googleName', 'Your Name (Optional)')}
            type="text"
            placeholder="Sokha & Bopha"
            value={googleName}
            onChange={(e) => setGoogleName(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsGoogleModalOpen(false)}
              disabled={isGoogleLoading}
            >
              {t('auth.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isGoogleLoading}
            >
              {t('auth.connect', 'Connect Account')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default LoginPage
