import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'bottom', // 'bottom' | 'right' | 'left'
  className = '',
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const positionClasses = {
    bottom:
      'inset-x-0 bottom-0 max-h-[85vh] rounded animate-in slide-in-from-bottom duration-250',
    right:
      'inset-y-0 right-0 w-full max-w-md rounded animate-in slide-in-from-right duration-250',
    left:
      'inset-y-0 left-0 w-full max-w-md rounded animate-in slide-in-from-left duration-250',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      <div
        className={`fixed bg-white shadow-elevated border-gold-200/50 flex flex-col z-10 ${positionClasses[position]} ${className}`}
      >
        {/* Drag handle indicator for bottom drawer */}
        {position === 'bottom' && (
          <div className="pt-3 pb-1 flex justify-center">
            <div className="w-12 h-1.5 bg-cream-300 rounded-full" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
          <h3 className="text-base font-semibold text-charcoal-900 font-ui">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -mr-2 text-charcoal-400 hover:text-charcoal-700 rounded touch-target flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto font-ui flex-1">{children}</div>
      </div>
    </div>
  )
}

export default Drawer
