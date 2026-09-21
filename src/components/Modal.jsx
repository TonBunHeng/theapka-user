import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  showClose = true,
  className = '',
}) {
  const modalRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidth} bg-white rounded shadow-elevated border border-gold-200/60 overflow-hidden transform transition-all duration-200 animate-in fade-in zoom-in-95 my-8 ${className}`}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between p-5 md:p-6 border-b border-cream-200">
            <div>
              {title && (
                <h3 id="modal-title" className="text-lg font-semibold text-charcoal-900 font-ui">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-charcoal-500 font-ui mt-0.5">{description}</p>
              )}
            </div>

            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 -mr-1 text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100 rounded transition-colors touch-target flex items-center justify-center"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-5 md:p-6 max-h-[calc(100vh-12rem)] overflow-y-auto font-ui">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
