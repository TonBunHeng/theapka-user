import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react'
import api from '../../lib/api'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Card, { CardContent } from '../../components/Card'
import { useToast } from '../../components/Toast'

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const { success, error } = useToast()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data) => {
    try {
      await api.post('/api/auth/forgot-password', data)
      setIsSubmitted(true)
      success(t('auth.forgotPasswordSubtitle', 'Password reset instructions sent to your email.'))
    } catch (err) {
      error(err.response?.data?.message || 'Failed to send reset link')
    }
  }

  return (
    <Card className="border-gold-200/80 shadow-card">
      <CardContent className="space-y-6 pt-8 pb-8">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 font-ui tracking-tight">
            {t('auth.forgotPasswordTitle', 'Reset Password')}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500 font-ui">
            {t('auth.forgotPasswordSubtitle', 'Enter your email to receive a password reset link')}
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center py-4 space-y-4 font-ui">
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-sm text-charcoal-700 leading-relaxed">
              យើងបានផ្ញើតំណភ្ជាប់ដើម្បីកំណត់ពាក្យសម្ងាត់ថ្មីទៅកាន់អ៊ីមែលរបស់អ្នករួចរាល់ហើយ។
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-burgundy-600 hover:text-burgundy-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('common.back', 'Back to')} {t('auth.login', 'Log In')}</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t('auth.email', 'Email Address')}
              type="email"
              placeholder="example@theapka.com"
              leftIcon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full py-3 text-sm font-bold mt-2"
            >
              {t('auth.sendResetLink', 'Send Password Reset Link')}
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-charcoal-600 hover:text-charcoal-900 font-ui"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('common.back', 'Back to')} {t('auth.login', 'Log In')}</span>
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export default ForgotPasswordPage
