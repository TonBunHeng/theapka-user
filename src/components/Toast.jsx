import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    ({ type = 'info', title, message, duration = 4000, action }) => {
      const id = Date.now() + Math.random().toString(36).substring(7)
      const newToast = { id, type, title, message, action }

      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }

      return id
    },
    [removeToast]
  )

  const success = useCallback(
    (message, options = {}) => addToast({ type: 'success', message, ...options }),
    [addToast]
  )

  const error = useCallback(
    (message, options = {}) => addToast({ type: 'error', message, ...options }),
    [addToast]
  )

  const warning = useCallback(
    (message, options = {}) => addToast({ type: 'warning', message, ...options }),
    [addToast]
  )

  const info = useCallback(
    (message, options = {}) => addToast({ type: 'info', message, ...options }),
    [addToast]
  )

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast container floating bottom-right (or bottom-center on mobile) */}
      <div
        className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2.5 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  }

  const borderStyles = {
    success: 'border-green-200 bg-white',
    error: 'border-red-200 bg-white',
    warning: 'border-amber-200 bg-white',
    info: 'border-blue-200 bg-white',
  }

  return (
    <div
      className={`
        pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-elevated font-ui
        animate-in slide-in-from-bottom-5 duration-200
        ${borderStyles[toast.type] || borderStyles.info}
      `}
    >
      {icons[toast.type] || icons.info}

      <div className="flex-1 min-w-0">
        {toast.title && (
          <h5 className="text-sm font-semibold text-charcoal-900">{toast.title}</h5>
        )}
        <p className="text-sm text-charcoal-700 leading-snug">{toast.message}</p>

        {toast.action && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => {
                toast.action.onClick()
                onClose()
              }}
              className="text-xs font-semibold text-burgundy-600 hover:text-burgundy-700 underline focus:outline-none"
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="p-1 -mr-1 -mt-1 text-charcoal-400 hover:text-charcoal-600 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export default ToastProvider
