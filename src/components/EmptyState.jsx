import React from 'react'
import { Sparkles } from 'lucide-react'
import Button from './Button'

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  children,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-2xl bg-cream-50/70 border border-dashed border-gold-300/50 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-gold-100 flex items-center justify-center text-gold-600 mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>

      <h4 className="text-base md:text-lg font-semibold text-charcoal-900 font-ui mb-1">
        {title}
      </h4>

      {description && (
        <p className="text-sm text-charcoal-500 font-ui max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button variant={actionVariant} onClick={onAction}>
          {actionLabel}
        </Button>
      )}

      {children}
    </div>
  )
}

export default EmptyState
