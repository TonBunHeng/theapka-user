import React, { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

export const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loading = false,
      disabled = false,
      leftIcon,
      icon,
      rightIcon,
      iconRight,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isSpinner = isLoading || loading
    const PrefixIcon = leftIcon || icon
    const SuffixIcon = rightIcon || iconRight

    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

    const variants = {
      primary:
        'bg-brand-emerald-700 text-white hover:bg-brand-emerald-800 active:bg-brand-emerald-900 shadow-sm focus:ring-brand-emerald-500 border border-transparent',
      gold:
        'bg-brand-gold-500 text-white hover:bg-brand-gold-600 active:bg-brand-gold-700 shadow-sm focus:ring-brand-gold-400 border border-transparent',
      secondary:
        'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 shadow-sm focus:ring-slate-400',
      outline:
        'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 focus:ring-slate-400',
      ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm focus:ring-rose-500 border border-transparent',
      emerald:
        'bg-brand-emerald-700 hover:bg-brand-emerald-800 text-white shadow-sm focus:ring-brand-emerald-500 border border-transparent',
    }

    const sizes = {
      sm: 'h-8 px-2.5 text-xs gap-1.5',
      md: 'h-9 px-3.5 text-sm gap-2',
      lg: 'h-11 px-5 text-base gap-2.5',
      icon: 'h-9 w-9 p-0 justify-center',
      'icon-sm': 'h-7 w-7 p-0 justify-center',
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isSpinner}
        className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
        {...props}
      >
        {isSpinner ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : PrefixIcon ? (
          <PrefixIcon className="w-4 h-4 shrink-0" />
        ) : null}
        {children && <span>{children}</span>}
        {!isSpinner && SuffixIcon ? <SuffixIcon className="w-4 h-4 shrink-0" /> : null}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
