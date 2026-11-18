import React, { useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import clsx from 'clsx'
import { useAlerts } from '../../context/AlertContext'

const ICONS = {
  success: <CheckCircle className="w-5 h-5 text-green-500" aria-hidden="true" />,
  error: <XCircle className="w-5 h-5 text-red-500" aria-hidden="true" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" aria-hidden="true" />,
  info: <Info className="w-5 h-5 text-blue-500" aria-hidden="true" />,
}

const STYLES = {
  success: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950',
  error: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950',
  warning: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950',
  info: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950',
}

function ToastItem({ alert, onClose }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={clsx(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg min-w-72 max-w-sm animate-slide-up',
        STYLES[alert.type] || STYLES.info
      )}
    >
      {ICONS[alert.type] || ICONS.info}
      <p className="flex-1 text-sm text-gray-800 dark:text-gray-100">{alert.message}</p>
      <button
        onClick={() => onClose(alert.id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const { alerts, removeAlert } = useAlerts()

  if (alerts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      aria-label="Notifications"
    >
      {alerts.map(alert => (
        <ToastItem key={alert.id} alert={alert} onClose={removeAlert} />
      ))}
    </div>
  )
}
