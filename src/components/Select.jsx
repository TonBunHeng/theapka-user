import React, { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

export const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      options = [],
      children,
      className = '',
      wrapperClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name || Math.random().toString(36).substring(7)

    return (
      <div className={`w-full ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-charcoal-800 mb-1.5 font-ui"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full min-h-[44px] px-3.5 py-2.5 pr-10 rounded text-charcoal-900 bg-white
              border transition-all duration-200 text-sm font-ui appearance-none
              ${
                error
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-cream-300 hover:border-gold-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200'
              }
              focus:outline-none disabled:bg-cream-100 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          >
            {children
              ? children
              : options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
          </select>

          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-charcoal-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error ? (
          <p className="mt-1.5 text-xs text-red-600 font-ui">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-charcoal-500 font-ui">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Select.displayName = 'Select'
export default Select
