import React, { useState } from 'react'
import { MessageSquareHeart, Send, User } from 'lucide-react'
import Button from '../../components/Button'
import { formatDate } from '../../lib/format'
import { getFontFamily } from '../../lib/fonts'

export function WishesBlock({
  wishes = [],
  guest,
  onWishSubmit,
  config = {},
  lang = 'km',
}) {
  const isKhmer = lang === 'km'
  const primaryColor = config.primaryColor || '#C59B27'
  const headingFont = { fontFamily: getFontFamily(config.fontHeading || 'moul') }

  const [name, setName] = useState(guest?.name || '')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return

    setIsSubmitting(true)
    try {
      if (onWishSubmit) {
        await onWishSubmit({ name, message })
      }
      setMessage('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-12 md:py-16 px-4" id="wishes-section">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h3
            className="text-xl sm:text-2xl leading-relaxed"
            style={{ ...headingFont, color: primaryColor }}
          >
            {isKhmer ? 'សៀវភៅជូនពរ' : 'Guestbook Wishes'}
          </h3>
          <p className="text-xs text-charcoal-500 font-serif uppercase tracking-widest">
            {isKhmer ? 'ពាក្យជូនពរ និងក្តីស្រឡាញ់' : 'Warm Wishes & Blessings'}
          </p>
        </div>

        {/* Wish Form */}
        <div className="bg-white rounded p-6 sm:p-8 border border-gold-200/60 shadow-card space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4 font-ui">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                {isKhmer ? 'ឈ្មោះរបស់អ្នក' : 'Your Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isKhmer ? 'ឈ្មោះភ្ញៀវកិត្តិយស...' : 'Enter your name...'}
                className="w-full px-3.5 py-2.5 rounded border border-cream-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm font-ui outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                {isKhmer ? 'សារជូនពរ' : 'Your Blessing'}
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isKhmer
                    ? 'សូមជូនពរឱ្យអ្នកទាំងពីរមានសុភមង្គល...'
                    : 'Write your warmest wishes for the couple...'
                }
                className="w-full px-3.5 py-2.5 rounded border border-cream-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm font-ui resize-none outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="gold"
              isLoading={isSubmitting}
              className="w-full py-3 text-sm font-bold"
              rightIcon={Send}
            >
              {isKhmer ? 'ផ្ញើពាក្យជូនពរ' : 'Send Blessing'}
            </Button>
          </form>
        </div>

        {/* Wishes List */}
        <div className="space-y-3 font-ui">
          {wishes && wishes.length > 0 ? (
            wishes.map((w, idx) => (
              <div
                key={w.id || idx}
                className="p-4 rounded bg-white border border-gold-100 shadow-sm flex items-start gap-3.5 animate-in fade-in duration-200"
              >
                <div className="w-9 h-9 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {w.name?.[0] || <User className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-sm font-bold text-charcoal-900 truncate">{w.name}</h5>
                    <span className="text-[11px] text-charcoal-400 shrink-0">
                      {formatDate(w.created_at || new Date(), 'DD/MM/YYYY', lang)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed whitespace-pre-line">
                    {w.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-charcoal-400 text-xs">
              <MessageSquareHeart className="w-8 h-8 text-gold-400 mx-auto mb-2 opacity-60" />
              <p>{isKhmer ? 'មិនទាន់មានពាក្យជូនពរនៅឡើយទេ' : 'No wishes posted yet'}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default WishesBlock
