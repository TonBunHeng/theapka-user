import React, { forwardRef } from 'react'

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className = '',
      wrapperClassName = '',
      id,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7)

    return (
      <div className={`w-full ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-charcoal-800 mb-1.5 font-ui"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative rounded">
          {LeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
              <LeftIcon className="w-5 h-5" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            className={`
              w-full min-h-[44px] px-3.5 py-2.5 rounded text-charcoal-900 bg-white
              border transition-all duration-200 text-sm font-ui
              placeholder:text-charcoal-400
              ${LeftIcon ? 'pl-11' : ''}
              ${RightIcon ? 'pr-11' : ''}
              ${
                error
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-cream-300 hover:border-gold-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200'
              }
              focus:outline-none disabled:bg-cream-100 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />

          {RightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-charcoal-400">
              <RightIcon className="w-5 h-5" />
            </div>
          )}
        </div>

        {error ? (
          <p className="mt-1.5 text-xs text-red-600 font-ui flex items-center gap-1">
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-charcoal-500 font-ui">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
