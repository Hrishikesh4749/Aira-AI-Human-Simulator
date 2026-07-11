import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import PageTransition from '../components/layout/PageTransition'
import ChatBubble from '../components/chat/ChatBubble'
import ChatInput from '../components/chat/ChatInput'
import TypingIndicator from '../components/chat/TypingIndicator'
import DayDivider from '../components/chat/DayDivider'
import AiraOrb from '../components/ui/AiraOrb'
import { useChat } from '../context/ChatContext'
import { useSettings } from '../context/SettingsContext'
import { useAutoScroll } from '../hooks/useAutoScroll'
import { useAiraState } from '../hooks/useAiraState'
import { formatDayDivider } from '../utils/formatTime'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const { messages, isAiraTyping, error, sendMessage, retryLastMessage, enableIdleInitiations } = useChat()
  const { autoInitiations } = useSettings()
  const { containerRef, bottomRef } = useAutoScroll(messages.length + (isAiraTyping ? 1 : 0))
  const { state: airaState } = useAiraState(15000, messages.length)

  useEffect(() => {
    enableIdleInitiations(autoInitiations)
    return () => enableIdleInitiations(false)
  }, [enableIdleInitiations, autoInitiations])

  useEffect(() => {
    if (error) {
      toast.error(error, {
        id: 'chat-error',
      })
    }
  }, [error])

  let lastDay = null

  return (
    <div className="flex h-full min-h-0 flex-col">
      <TopBar title="Aira" subtitle="usually replies in seconds" mood={airaState?.mood?.mood} />

      <div ref={containerRef} className="relative flex-1 overflow-y-auto px-4 md:px-8 pb-4 pt-6">
        <div className="aira-glow-field -z-10" />
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 pb-24 md:pb-6">
          {messages.length === 0 && !isAiraTyping && (
            <PageTransition className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
              <AiraOrb size="xl" />
              <div>
                <h2 className="font-display text-xl font-semibold">Say hi to Aira</h2>
                <p className="mx-auto mt-1 max-w-xs text-sm text-[var(--color-text-muted)]">
                  She remembers what matters, picks up your vibe, and texts back like a real person.
                </p>
              </div>
            </PageTransition>
          )}

          <AnimatePresence initial={false}>
            {messages.map((message) => {
              const day = formatDayDivider(new Date(message.timestamp))
              const showDivider = day !== lastDay
              lastDay = day
              return (
                <div key={message.id} className="flex flex-col gap-4">
                  {showDivider && <DayDivider label={day} />}
                  <ChatBubble message={message} />
                </div>
              )
            })}
            {isAiraTyping && <TypingIndicator key="typing" />}
          </AnimatePresence>

          {error && !isAiraTyping && (
            <div className="flex justify-center">
              <button
                onClick={retryLastMessage}
                className="rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:text-white"
              >
                Retry last message
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-soft)]/80 backdrop-blur px-4 md:px-8 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-4">
        <div className="mx-auto w-full max-w-2xl">
          <ChatInput onSend={sendMessage} disabled={isAiraTyping} />
          <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-[var(--color-text-faint)]">
            <Sparkles size={11} />
            Aira has her own moods, memory, and personality — replies may vary.
          </p>
        </div>
      </div>
    </div>
  )
}
