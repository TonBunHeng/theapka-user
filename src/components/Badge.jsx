import React from 'react'

export function Badge({
  children,
  variant = 'brand',
  dot = false,
  className = '',
  size = 'md',
  ...props
}) {
  const variants = {
    brand: 'bg-brand-emerald-50 text-brand-emerald-800 border-brand-emerald-200/60',
    gold: 'bg-brand-gold-50 text-brand-gold-800 border-brand-gold-300/60',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    burgundy: 'bg-rose-50 text-rose-800 border-rose-200',
    emerald: 'bg-brand-emerald-50 text-brand-emerald-800 border-brand-emerald-200/60',
  }

  const dotColors = {
    brand: 'bg-brand-emerald-600',
    gold: 'bg-brand-gold-500',
    neutral: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-blue-500',
    burgundy: 'bg-rose-600',
    emerald: 'bg-brand-emerald-600',
  }

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.2',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-xs px-3 py-1',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variants[variant] || variants.brand} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.brand}`}
        />
      )}
      <span>{children}</span>
    </span>
  )
}

export default Badge
