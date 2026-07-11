import { useEffect, useState } from 'react'
import api from '../services/api'

// Backend: GET /health -> { status, mongodb, model, user_id }
// Falls back to "reachable but unhealthy" if MongoDB is down, and to
// 'offline' only on a genuine network-level failure (server unreachable).
export function useConnectionStatus(intervalMs = 20000) {
  const [status, setStatus] = useState('checking') // 'online' | 'offline' | 'checking'

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const { data } = await api.get('/health', { validateStatus: () => true })
        if (cancelled) return
        setStatus(data?.status === 'ok' ? 'online' : 'offline')
      } catch {
        if (!cancelled) setStatus('offline')
      }
    }

    check()
    const id = setInterval(check, intervalMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [intervalMs])

  return status
}
