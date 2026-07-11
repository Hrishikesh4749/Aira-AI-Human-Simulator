import { useCallback, useEffect, useRef, useState } from 'react'
import { getAiraState } from '../services/devService'

/**
 * Polls GET /debug/state, which aggregates mood, relationship, personality,
 * profile, and conversation/memory/episode counts into one response.
 * Used to drive the live mood indicator in TopBar and the full Developer
 * Mode dashboard without hammering the backend with six separate requests.
 *
 * @param {number} intervalMs how often to poll while the tab is visible
 * @param {number} refreshKey bump this (e.g. after sending a message) to force an immediate refetch
 */
export function useAiraState(intervalMs = 15000, refreshKey = 0) {
  const [state, setState] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  const refresh = useCallback(async () => {
    try {
      const data = await getAiraState()
      if (!mounted.current) return
      if (data) {
        setState(data)
        setError(null)
      } else {
        setError('unreachable')
      }
    } catch {
      if (mounted.current) setError('unreachable')
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    refresh()
    const id = setInterval(refresh, intervalMs)
    return () => {
      mounted.current = false
      clearInterval(id)
    }
  }, [refresh, intervalMs])

  // Force an immediate refresh whenever refreshKey changes (e.g. new message sent)
  useEffect(() => {
    if (refreshKey > 0) refresh()
  }, [refreshKey, refresh])

  return { state, error, loading, refresh }
}
