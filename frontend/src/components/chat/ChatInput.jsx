import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!value.trim() || disabled) return
    onSend(value)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleChange = (e) => {
    setValue(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 140)}px`
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-2 pl-4 shadow-[var(--shadow-soft)] focus-within:border-[var(--color-pink)]/50 transition-colors"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Text Aira..."
        aria-label="Message Aira"
        className="max-h-[140px] flex-1 resize-none bg-transparent py-2.5 text-[15px] text-white placeholder:text-[var(--color-text-faint)] outline-none disabled:opacity-50"
      />
      <motion.button
        type="submit"
        disabled={disabled || !value.trim()}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all',
          value.trim() && !disabled
            ? 'bg-[linear-gradient(120deg,var(--color-pink),var(--color-violet))] text-white shadow-[var(--shadow-glow-pink)]'
            : 'bg-[var(--color-surface-2)] text-[var(--color-text-faint)]'
        )}
        aria-label="Send message"
      >
        <Send size={16} />
      </motion.button>
    </form>
  )
}
