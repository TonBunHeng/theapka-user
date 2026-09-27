import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop with elegant blur & deep tint to cleanly isolate modal */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity duration-200 animate-modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container - Centered on screen */}
      <div
        ref={modalRef}
        className={`relative z-10 w-full ${maxWidth} bg-white rounded shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-200 animate-modal-content max-h-[90vh] flex flex-col my-auto ${className}`}
      >
        {/* Header */}
        {title ? (
          <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 shrink-0">
            <div className="pr-4">
              <h3 id="modal-title" className="text-base sm:text-lg font-bold leading-6 text-slate-900 font-ui tracking-tight">
                {title}
              </h3>
              {description && (
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-ui leading-relaxed">{description}</p>
              )}
            </div>

            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 -mr-1 -mt-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors touch-target flex items-center justify-center cursor-pointer shrink-0"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : showClose ? (
          <div className="flex justify-end p-4 pb-0 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors touch-target flex items-center justify-center cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : null}

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto font-ui">
          {children}
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}

export default Modal
