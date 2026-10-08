import { useEffect, useState } from 'react'

function readOnlineStatus(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine
}

export function useConnectivity(): boolean {
  const [isOnline, setIsOnline] = useState(readOnlineStatus)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
