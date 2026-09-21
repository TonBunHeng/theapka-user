import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Lock, Mail, User, Phone, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../auth/authStore'
import api from '../../lib/api'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Card, { CardContent } from '../../components/Card'
import { useToast } from '../../components/Toast'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    phone: z.string().min(8, 'Phone number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { success, error } = useToast()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (formData) => {
    setServerError('')
    try {
      const res = await api.post('/api/auth/register', formData)
      const { user, token } = res.data.data

      // Automatically log in and direct to onboarding
      login({ user, token, wedding: null })
      success(t('common.success', 'Account registered successfully!'))
      navigate('/onboarding', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      setServerError(msg)
      error(msg)
    }
  }

  return (
    <Card className="border-gold-200/80 shadow-card">
      <CardContent className="space-y-6 pt-8 pb-8">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 font-ui tracking-tight">
            {t('auth.registerTitle', 'Create a New Account')}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500 font-ui">
            {t('auth.registerSubtitle', 'Start organizing your digital wedding invitations')}
          </p>
        </div>

        {serverError && (
          <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-ui flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t('auth.name', 'Full Name')}
            placeholder="ចាន់ សុវណ្ណ"
            leftIcon={User}
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label={t('auth.email', 'Email Address')}
            type="email"
            placeholder="example@theapka.com"
            leftIcon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label={t('auth.phone', 'Phone Number')}
            type="tel"
            placeholder="012 345 678"
            leftIcon={Phone}
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label={t('auth.password', 'Password')}
            type="password"
            placeholder="••••••••"
            leftIcon={Lock}
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label={t('auth.confirmPassword', 'Confirm Password')}
            type="password"
            placeholder="••••••••"
            leftIcon={Lock}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="w-full py-3 text-sm font-bold mt-2"
          >
            {t('auth.register', 'Register')}
          </Button>
        </form>

        <div className="text-center text-xs text-charcoal-600 font-ui pt-2">
          <span>{t('auth.alreadyHaveAccount', 'Already have an account?')} </span>
          <Link
            to="/login"
            className="font-bold text-burgundy-600 hover:text-burgundy-700 underline"
          >
            {t('auth.login', 'Log In')}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default RegisterPage
