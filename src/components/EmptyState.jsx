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
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 rounded bg-white/60 border border-dashed border-slate-300 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3.5 shadow-sm">
        <Icon className="w-6 h-6" />
      </div>

      <h4 className="text-sm font-semibold text-slate-800 mb-1">
        {title}
      </h4>

      {description && (
        <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button size="sm" variant={actionVariant} onClick={onAction}>
          {actionLabel}
        </Button>
      )}

      {children}
    </div>
  )
}

export default EmptyState
