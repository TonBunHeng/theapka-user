import React from 'react'

export function Badge({
  children,
  variant = 'gold',
  dot = false,
  className = '',
  size = 'md',
  ...props
}) {
  const variants = {
    gold: 'bg-gold-50 text-gold-800 border-gold-300/60',
    burgundy: 'bg-burgundy-50 text-burgundy-800 border-burgundy-300/60',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-300/60',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200',
  }

  const dotColors = {
    gold: 'bg-gold-500',
    burgundy: 'bg-burgundy-500',
    emerald: 'bg-emerald-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-charcoal-500',
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium font-ui rounded-full border ${variants[variant] || variants.gold} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.gold}`}
        />
      )}
      <span>{children}</span>
    </span>
  )
}

export default Badge
