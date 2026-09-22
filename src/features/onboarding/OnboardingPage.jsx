import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, Calendar, MapPin, Palette, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { useAuthStore } from '../../auth/authStore'
import api from '../../lib/api'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Card, { CardContent, CardFooter } from '../../components/Card'
import { useToast } from '../../components/Toast'

import traditionalPreset from '../../templates/presets/traditionalGold.json'
import modernPreset from '../../templates/presets/modernBurgundy.json'
import minimalPreset from '../../templates/presets/minimalEmerald.json'

const PRESETS = [traditionalPreset, modernPreset, minimalPreset]

export function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setWedding } = useAuthStore()
  const { success, error } = useToast()

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    groom_name_kh: 'ចាន់ សុវណ្ណ',
    groom_name_en: 'Chan Sovann',
    bride_name_kh: 'ស៊ុន មុន្នី',
    bride_name_en: 'Sun Munny',
    wedding_date: '2026-11-28',
    venue_name: 'សណ្ឋាគារ ហ្គាឌិន ស៊ីធី (Garden City Hotel)',
    venue_address: 'ផ្លូវជាតិលេខ ៦A សង្កាត់បាក់ខែង ខណ្ឌជ្រោយចង្វារ រាជធានីភ្នំពេញ',
    template_id: 'traditional-gold',
    template_config: traditionalPreset,
  })

  const updateField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }))
  }

  const handlePresetSelect = (preset) => {
    setFormData((prev) => ({
      ...prev,
      template_id: preset.id,
      template_config: preset,
    }))
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.groom_name_kh || !formData.bride_name_kh) {
        error(t('common.required', 'Please fill in groom and bride names'))
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!formData.wedding_date || !formData.venue_name) {
        error(t('common.required', 'Please fill in wedding date and venue name'))
        return
      }
      setStep(3)
    }
  }

  const handleFinish = async () => {
    setIsSubmitting(true)
    try {
      // Generate slug automatically based on names
      const slug = `${formData.groom_name_en || 'groom'}-${formData.bride_name_en || 'bride'}-wedding`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')

      const payload = {
        ...formData,
        slug,
        is_published: false,
      }

      const res = await api.post('/api/user/wedding', payload)
      const createdWedding = res.data.data

      setWedding(createdWedding)
      success(t('common.success', 'Wedding created successfully!'))
      navigate('/', { replace: true })
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create wedding')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 font-ui selection:bg-brand-emerald-100">
      <div className="w-full max-w-xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <img
            src="/TK.jpeg"
            alt="TheapKa"
            className="inline-block w-12 h-12 rounded object-cover shadow-sm mb-1 ring-4 ring-brand-emerald-100"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {t('onboarding.title', 'Set Up Your Wedding')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {t('onboarding.subtitle', 'Complete these 3 simple steps to create your digital invitation')}
          </p>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto px-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s
                    ? 'bg-brand-emerald-700 text-white shadow-sm ring-4 ring-brand-emerald-100'
                    : step > s
                    ? 'bg-brand-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full transition-colors ${
                    step > s ? 'bg-green-500' : 'bg-cream-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* STEP 1: Couple Names */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-burgundy-500" />
                    <span>{t('onboarding.step1', '1. Couple Information')}</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('onboarding.groomNameKh', "Groom's Name (Khmer)")}
                    required
                    value={formData.groom_name_kh}
                    onChange={(e) => updateField('groom_name_kh', e.target.value)}
                  />
                  <Input
                    label={t('onboarding.groomNameEn', "Groom's Name (English)")}
                    value={formData.groom_name_en}
                    onChange={(e) => updateField('groom_name_en', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('onboarding.brideNameKh', "Bride's Name (Khmer)")}
                    required
                    value={formData.bride_name_kh}
                    onChange={(e) => updateField('bride_name_kh', e.target.value)}
                  />
                  <Input
                    label={t('onboarding.brideNameEn', "Bride's Name (English)")}
                    value={formData.bride_name_en}
                    onChange={(e) => updateField('bride_name_en', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Date & Venue */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gold-600" />
                    <span>{t('onboarding.step2', '2. Date & Venue')}</span>
                  </h3>
                </div>

                <Input
                  label={t('onboarding.weddingDate', 'Wedding Date')}
                  type="date"
                  required
                  value={formData.wedding_date}
                  onChange={(e) => updateField('wedding_date', e.target.value)}
                />

                <Input
                  label={t('onboarding.venueName', 'Venue Name')}
                  required
                  placeholder="សណ្ឋាគារ ហ្គាឌិន ស៊ីធី"
                  leftIcon={MapPin}
                  value={formData.venue_name}
                  onChange={(e) => updateField('venue_name', e.target.value)}
                />

                <Input
                  label={t('onboarding.venueAddress', 'Venue Address')}
                  placeholder="ផ្លូវជាតិលេខ ៦A រាជធានីភ្នំពេញ"
                  value={formData.venue_address}
                  onChange={(e) => updateField('venue_address', e.target.value)}
                />
              </div>
            )}

            {/* STEP 3: Choose Template Preset */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-emerald-600" />
                    <span>{t('onboarding.step3', '3. Choose Starting Template')}</span>
                  </h3>
                </div>

                <div className="space-y-3">
                  {PRESETS.map((preset) => {
                    const isSelected = formData.template_id === preset.id
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handlePresetSelect(preset)}
                        className={`
                          p-4 rounded border-2 cursor-pointer transition-all flex items-center justify-between
                          ${
                            isSelected
                              ? 'border-brand-emerald-600 bg-brand-emerald-50/40 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className="w-10 h-10 rounded flex items-center justify-center text-white font-serif font-bold text-sm shadow-sm shrink-0"
                            style={{ backgroundColor: preset.primaryColor }}
                          >
                            TK
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-charcoal-900">
                              {preset.name_kh} ({preset.name_en})
                            </h4>
                            <p className="text-xs text-charcoal-500 leading-snug">
                              {preset.description_kh}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-brand-emerald-600 bg-brand-emerald-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>

          {/* Wizard Footer Controls */}
          <CardFooter className="flex items-center justify-between border-t border-slate-100">
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                leftIcon={ArrowLeft}
              >
                {t('common.back', 'Back')}
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                rightIcon={ArrowRight}
              >
                {t('common.next', 'Next')}
              </Button>
            ) : (
              <Button
                variant="primary"
                isLoading={isSubmitting}
                onClick={handleFinish}
                rightIcon={Check}
              >
                {t('onboarding.finish', 'Create & Go to Dashboard')}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default OnboardingPage
