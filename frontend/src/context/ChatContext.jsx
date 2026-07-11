import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { sendMessage as sendMessageApi, initiateMessage } from '../services/chatService'

const ChatContext = createContext(null)

const IDLE_INITIATE_MS = 90_000 // how long the user must be quiet before Aira initiates

function makeMessage(role, content) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role, // 'user' | 'assistant'
    content,
    timestamp: new Date().toISOString(),
  }
}

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([])
  const [isSending, setIsSending] = useState(false)
  const [isAiraTyping, setIsAiraTyping] = useState(false)
  const [error, setError] = useState(null)
  const idleTimer = useRef(null)
  const idleEnabled = useRef(false)
  const lastFailedText = useRef(null)

  const clearIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current)
  }, [])

  const scheduleIdleInitiate = useCallback(() => {
    clearIdleTimer()
    if (!idleEnabled.current) return
    idleTimer.current = setTimeout(async () => {
      try {
        const reply = await initiateMessage()
        setMessages((prev) => [...prev, makeMessage('assistant', reply)])
      } catch {
        // silent: proactive initiation failing shouldn't disrupt the user
      } finally {
        scheduleIdleInitiate()
      }
    }, IDLE_INITIATE_MS)
  }, [clearIdleTimer])

  const enableIdleInitiations = useCallback(
    (enabled) => {
      idleEnabled.current = enabled
      if (enabled) scheduleIdleInitiate()
      else clearIdleTimer()
    },
    [scheduleIdleInitiate, clearIdleTimer]
  )

  useEffect(() => clearIdleTimer, [clearIdleTimer])

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim()
      if (!trimmed || isSending) return

      setError(null)
      const userMsg = makeMessage('user', trimmed)
      setMessages((prev) => [...prev, userMsg])
      setIsSending(true)
      setIsAiraTyping(true)
      clearIdleTimer()

      try {
        const reply = await sendMessageApi(trimmed)
        setMessages((prev) => [...prev, makeMessage('assistant', reply)])
        lastFailedText.current = null
      } catch (err) {
        lastFailedText.current = trimmed
        setError(
          err?.code === 'ERR_NETWORK'
            ? "Couldn't reach Aira's backend. Is the server running?"
            : 'Something went wrong sending that message.'
        )
      } finally {
        setIsSending(false)
        setIsAiraTyping(false)
        scheduleIdleInitiate()
      }
    },
    [isSending, clearIdleTimer, scheduleIdleInitiate]
  )

  const retryLastMessage = useCallback(() => {
    const text = lastFailedText.current
    if (!text) return
    // Drop the failed user bubble before resending, so we don't duplicate it.
    setMessages((prev) => {
      const idx = [...prev].reverse().findIndex((m) => m.role === 'user' && m.content === text)
      if (idx === -1) return prev
      const realIdx = prev.length - 1 - idx
      return [...prev.slice(0, realIdx), ...prev.slice(realIdx + 1)]
    })
    sendMessage(text)
  }, [sendMessage])

  const clearConversation = useCallback(() => {
    setMessages([])
  }, [])

  const value = {
    messages,
    isSending,
    isAiraTyping,
    error,
    sendMessage,
    retryLastMessage,
    clearConversation,
    enableIdleInitiations,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within a ChatProvider')
  return ctx
}
