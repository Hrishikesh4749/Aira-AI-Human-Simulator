import { useEffect, useRef } from 'react'

export function useAutoScroll(dependency) {
  const containerRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [dependency])

  return { containerRef, bottomRef }
}
