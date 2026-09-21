import React, { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

export const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium font-ui rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none touch-target'

    const variants = {
      primary:
        'bg-burgundy-500 hover:bg-burgundy-600 text-white shadow-sm focus:ring-burgundy-500 active:scale-[0.98]',
      gold:
        'bg-gold-500 hover:bg-gold-600 text-white shadow-sm focus:ring-gold-500 active:scale-[0.98]',
      secondary:
        'bg-cream-200 hover:bg-cream-300 text-charcoal-800 border border-gold-200 focus:ring-gold-400 active:scale-[0.98]',
      outline:
        'bg-transparent hover:bg-cream-200 text-burgundy-600 border border-burgundy-500/30 focus:ring-burgundy-500 active:scale-[0.98]',
      ghost:
        'bg-transparent hover:bg-cream-200/60 text-charcoal-700 hover:text-charcoal-900 focus:ring-gold-400',
      danger:
        'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500 active:scale-[0.98]',
      emerald:
        'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm focus:ring-emerald-500 active:scale-[0.98]',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs min-h-[36px] gap-1.5',
      md: 'px-4 py-2.5 text-sm min-h-[44px] gap-2',
      lg: 'px-6 py-3.5 text-base min-h-[48px] gap-2.5',
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : LeftIcon ? (
          <LeftIcon className="w-4 h-4 shrink-0" />
        ) : null}
        <span>{children}</span>
        {!isLoading && RightIcon ? <RightIcon className="w-4 h-4 shrink-0" /> : null}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
