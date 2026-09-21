import React, { useState } from 'react'
import { CheckCircle2, HeartHandshake, HelpCircle, XCircle, Send } from 'lucide-react'
import Button from '../../components/Button'
import { toKhmerNumeral } from '../../lib/format'

export function RsvpBlock({ guest, onRsvpSubmit, config = {}, lang = 'km' }) {
  const isKhmer = lang === 'km'
  const primaryColor = config.primaryColor || '#C59B27'
  const fontHeading = config.fontHeading === 'serif' ? 'font-serif' : 'font-moul'

  const [status, setStatus] = useState(guest?.rsvp_status || 'attending')
  const [seats, setSeats] = useState(guest?.attending_seats || guest?.seats || 1)
  const [note, setNote] = useState(guest?.rsvp_note || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const maxSeats = guest?.seats || 2

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (onRsvpSubmit) {
        await onRsvpSubmit({ rsvp_status: status, seats, note })
      }
      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-12 md:py-16 px-4" id="rsvp-section">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h3
            className={`text-xl sm:text-2xl leading-relaxed ${fontHeading}`}
            style={{ color: primaryColor }}
          >
            {isKhmer ? 'ឆ្លើយតបការអញ្ជើញ (RSVP)' : 'RSVP Confirmation'}
          </h3>
          <p className="text-xs text-charcoal-500 font-serif uppercase tracking-widest">
            {isKhmer ? 'សូមជួយបញ្ជាក់វត្តមានរបស់លោកអ្នក' : 'Kindly Let Us Know'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gold-200/60 shadow-card">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-charcoal-900 font-ui">
                {isKhmer ? 'បានផ្ញើការឆ្លើយតបជោគជ័យ' : 'Response Received'}
              </h4>
              <p className="text-sm text-charcoal-600 font-ui">
                {isKhmer
                  ? 'សូមអរគុណយ៉ាងជ្រាលជ្រៅសម្រាប់ការឆ្លើយតប។ យើងខ្ញុំទន្ទឹងរង់ចាំទទួលស្វាគមន៍!'
                  : 'Thank you for your confirmation. We look forward to celebrating with you!'}
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-xs text-burgundy-600 underline font-ui mt-3 block mx-auto"
              >
                {isKhmer ? 'កែប្រែចម្លើយ' : 'Change Response'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 font-ui">
              {guest && (
                <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 text-center">
                  <p className="text-xs text-charcoal-500">
                    {isKhmer ? 'ភ្ញៀវកិត្តិយស' : 'Guest Name'}
                  </p>
                  <p className="text-sm font-bold text-charcoal-800">{guest.name}</p>
                </div>
              )}

              {/* Status Radio Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
                  {isKhmer ? 'វត្តមានរបស់អ្នក' : 'Your Attendance'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('attending')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all touch-target ${
                      status === 'attending'
                        ? 'bg-green-50 border-green-500 text-green-800 shadow-sm ring-2 ring-green-200'
                        : 'bg-white border-cream-300 text-charcoal-600 hover:bg-cream-50'
                    }`}
                  >
                    <HeartHandshake className="w-5 h-5 mb-1 text-green-600" />
                    <span>{isKhmer ? 'ចូលរួម' : 'Attending'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('declined')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all touch-target ${
                      status === 'declined'
                        ? 'bg-red-50 border-red-500 text-red-800 shadow-sm ring-2 ring-red-200'
                        : 'bg-white border-cream-300 text-charcoal-600 hover:bg-cream-50'
                    }`}
                  >
                    <XCircle className="w-5 h-5 mb-1 text-red-600" />
                    <span>{isKhmer ? 'មិនបានចូលរួម' : 'Declined'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('maybe')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all touch-target ${
                      status === 'maybe'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-sm ring-2 ring-amber-200'
                        : 'bg-white border-cream-300 text-charcoal-600 hover:bg-cream-50'
                    }`}
                  >
                    <HelpCircle className="w-5 h-5 mb-1 text-amber-600" />
                    <span>{isKhmer ? 'មិនច្បាស់' : 'Maybe'}</span>
                  </button>
                </div>
              </div>

              {/* Seats count if attending */}
              {status === 'attending' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
                    {isKhmer
                      ? `ចំនួនអ្នកចូលរួម (អតិបរមា ${toKhmerNumeral(maxSeats)} នាក់)`
                      : `Attendees (Max ${maxSeats})`}
                  </label>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: maxSeats }).map((_, i) => {
                      const val = i + 1
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setSeats(val)}
                          className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all touch-target ${
                            seats === val
                              ? 'bg-gold-500 border-gold-600 text-white shadow-sm'
                              : 'bg-cream-50 border-cream-300 text-charcoal-700 hover:bg-cream-100'
                          }`}
                        >
                          {isKhmer ? toKhmerNumeral(val) : val}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Note / Blessing message */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
                  {isKhmer ? 'សារជូនពរ ឬចំណាំបន្ថែម' : 'Message or Note'}
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    isKhmer
                      ? 'សរសេរសារជូនពរខ្លីៗដល់គូស្វាមីភរិយា...'
                      : 'Leave a brief note or blessing...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm font-ui resize-none outline-none"
                />
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="w-full py-3 text-sm font-bold"
                rightIcon={Send}
              >
                {isKhmer ? 'ផ្ញើការឆ្លើយតប' : 'Submit RSVP'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export default RsvpBlock
