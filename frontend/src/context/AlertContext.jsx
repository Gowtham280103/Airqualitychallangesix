import React, { createContext, useContext, useState, useCallback } from 'react'

const AlertContext = createContext(null)

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([])

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  const addAlert = useCallback((message, type = 'info', duration = 5000) => {
    const id = `alert-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setAlerts(prev => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => removeAlert(id), duration)
    }
    return id
  }, [removeAlert])

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  )
}

export function useAlerts() {
  const ctx = useContext(AlertContext)
  if (!ctx) throw new Error('useAlerts must be used within AlertProvider')
  return ctx
}
