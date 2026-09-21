import React, { useState } from 'react'
import { CheckCircle2, HeartHandshake, HelpCircle, XCircle, Send } from 'lucide-react'
import Button from '../components/Button'
import { toKhmerNumeral } from '../lib/format'

export function RsvpForm({ guest, onSubmit, isSubmitting = false, lang = 'km' }) {
  const isKhmer = lang === 'km'
  const [status, setStatus] = useState(guest?.rsvp_status || 'attending')
  const [seats, setSeats] = useState(guest?.attending_seats || guest?.seats || 1)
  const [note, setNote] = useState(guest?.rsvp_note || '')

  const maxSeats = guest?.seats || 2

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.({ rsvp_status: status, seats, note })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-ui">
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
          {isKhmer ? 'វត្តមានរបស់អ្នក' : 'Your Attendance'}
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setStatus('attending')}
            className={`flex flex-col items-center justify-center p-3 rounded border text-xs font-semibold transition-all touch-target ${
              status === 'attending'
                ? 'bg-green-50 border-green-500 text-green-800 ring-2 ring-green-200'
                : 'bg-white border-cream-300 text-charcoal-600 hover:bg-cream-50'
            }`}
          >
            <HeartHandshake className="w-5 h-5 mb-1 text-green-600" />
            <span>{isKhmer ? 'ចូលរួម' : 'Attending'}</span>
          </button>

          <button
            type="button"
            onClick={() => setStatus('declined')}
            className={`flex flex-col items-center justify-center p-3 rounded border text-xs font-semibold transition-all touch-target ${
              status === 'declined'
                ? 'bg-red-50 border-red-500 text-red-800 ring-2 ring-red-200'
                : 'bg-white border-cream-300 text-charcoal-600 hover:bg-cream-50'
            }`}
          >
            <XCircle className="w-5 h-5 mb-1 text-red-600" />
            <span>{isKhmer ? 'មិនបានចូលរួម' : 'Declined'}</span>
          </button>

          <button
            type="button"
            onClick={() => setStatus('maybe')}
            className={`flex flex-col items-center justify-center p-3 rounded border text-xs font-semibold transition-all touch-target ${
              status === 'maybe'
                ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-200'
                : 'bg-white border-cream-300 text-charcoal-600 hover:bg-cream-50'
            }`}
          >
            <HelpCircle className="w-5 h-5 mb-1 text-amber-600" />
            <span>{isKhmer ? 'មិនច្បាស់' : 'Maybe'}</span>
          </button>
        </div>
      </div>

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
                  className={`flex-1 py-2.5 rounded border text-sm font-bold transition-all touch-target ${
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
          className="w-full px-3.5 py-2.5 rounded border border-cream-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm font-ui resize-none outline-none"
        />
      </div>

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
  )
}

export default RsvpForm
