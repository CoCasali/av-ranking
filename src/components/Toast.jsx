import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && <ToastView key={toast.id} toast={toast} onDone={() => setToast(null)} />}
    </ToastContext.Provider>
  )
}

function ToastView({ toast, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed bottom-20 inset-x-0 flex justify-center px-4 z-50 pointer-events-none">
      <div
        className={`pointer-events-auto rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-opacity ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
        }`}
      >
        {toast.message}
      </div>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
