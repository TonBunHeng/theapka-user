import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Lock, Mail, Sparkles, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../auth/authStore'
import api from '../../lib/api'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Card, { CardContent } from '../../components/Card'
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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'sovann@theapka.com',
      password: 'password123',
    },
  })

  const onSubmit = async (formData) => {
    setServerError('')
    try {
      const res = await api.post('/api/auth/login', formData)
      const { user, token } = res.data.data

      // Check if admin role
      if (user.role === 'admin' || user.role === 'super_admin') {
        warning(t('auth.adminWarning', 'This account has Admin privileges. Please use the Admin Portal.'))
        return
      }

      // Fetch user profile and wedding details
      const meRes = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const { wedding } = meRes.data.data

      login({ user, token, wedding })
      success(t('common.success', 'Logged in successfully!'))

      // Navigate to onboarding if no wedding, else dashboard
      if (!wedding) {
        navigate('/onboarding', { replace: true })
      } else {
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify credentials.'
      setServerError(msg)
      error(msg)
    }
  }

  return (
    <Card className="border-gold-200/80 shadow-card">
      <CardContent className="space-y-6 pt-8 pb-8">
        {/* Title */}
        <div className="text-center space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 font-ui tracking-tight">
            {t('auth.loginTitle', 'Log in to your wedding portal')}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500 font-ui">
            {t('auth.loginSubtitle', 'Enter your credentials to continue')}
          </p>
        </div>

        {serverError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-ui flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

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
              <label className="block text-sm font-medium text-charcoal-800 font-ui">
                {t('auth.password', 'Password')}
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-burgundy-600 hover:text-burgundy-700 font-ui"
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
            className="w-full py-3 text-sm font-bold mt-2"
          >
            {t('auth.login', 'Log In')}
          </Button>
        </form>

        {/* Quick Demo Credentials Helper */}
        <div className="pt-2 border-t border-cream-200 space-y-2">
          <p className="text-[11px] text-charcoal-400 text-center font-ui uppercase tracking-wider">
            Demo Quick Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setValue('email', 'sovann@theapka.com')
                setValue('password', 'password123')
              }}
              className="px-2.5 py-1.5 rounded-lg bg-cream-100 hover:bg-cream-200 text-[11px] font-semibold text-charcoal-700 font-ui border border-cream-200 truncate"
            >
              Couple Account
            </button>
            <button
              type="button"
              onClick={() => {
                setValue('email', 'admin@theapka.com')
                setValue('password', 'admin123')
              }}
              className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-[11px] font-semibold text-red-700 font-ui border border-red-100 truncate"
            >
              Admin (Test Reject)
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center text-xs text-charcoal-600 font-ui pt-2">
          <span>{t('auth.noAccount', "Don't have an account?")} </span>
          <Link
            to="/register"
            className="font-bold text-burgundy-600 hover:text-burgundy-700 underline"
          >
            {t('auth.register', 'Register')}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoginPage
