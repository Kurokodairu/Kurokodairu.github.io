// useNotification.ts - Visual notification system with popups

interface NotificationItem {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
}

export const useNotification = () => {
  const notifications = useState<NotificationItem[]>('notifications', () => [])

  const show = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 5000) => {
    // Log notifications internally for debugging purposes
    const timestamp = new Date().toISOString()
    const logLevel = type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'info'
    
    console[logLevel](`[${timestamp}] ${type.toUpperCase()}: ${message}`)
    
    // Add visual notification
    const notification: NotificationItem = {
      id: Date.now() + Math.random(), // Simple unique ID
      message,
      type,
      duration
    }
    
    notifications.value.push(notification)
    
    // Optional: Store in localStorage for debugging
    if (process.client) {
      try {
        const logs = JSON.parse(localStorage.getItem('app-notifications') || '[]')
        logs.push({ timestamp, type, message })
        
        // Keep only last 100 logs to prevent storage bloat
        if (logs.length > 100) {
          logs.splice(0, logs.length - 100)
        }
        
        localStorage.setItem('app-notifications', JSON.stringify(logs))
      } catch (error) {
        console.warn('Failed to store notification log:', error)
      }
    }
  }

  const getLogs = () => {
    if (process.client) {
      try {
        return JSON.parse(localStorage.getItem('app-notifications') || '[]')
      } catch (error) {
        console.warn('Failed to retrieve notification logs:', error)
        return []
      }
    }
    return []
  }

  const clearLogs = () => {
    if (process.client) {
      localStorage.removeItem('app-notifications')
    }
  }

  return {
    show,
    getLogs,
    clearLogs
  }
}
