import React, { useState } from 'react'
import { Send } from 'lucide-react'
import Button from '../components/Button'

export function WishForm({ guestName = '', onSubmit, isSubmitting = false, lang = 'km' }) {
  const isKhmer = lang === 'km'
  const [name, setName] = useState(guestName || '')
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    onSubmit?.({ name, message })
    setMessage('')
  }

  return (
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
  )
}

export default WishForm
