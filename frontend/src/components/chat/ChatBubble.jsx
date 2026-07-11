import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import AiraOrb from '../ui/AiraOrb'
import MarkdownMessage from './MarkdownMessage'
import { cn } from '../../utils/cn'
import { formatTimestamp } from '../../utils/formatTime'

export default function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn('group flex items-end gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {!isUser && <AiraOrb size="sm" pulsing={false} className="mb-1" />}

      <div className={cn('flex max-w-[78%] md:max-w-[62%] flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'relative rounded-2xl px-4 py-2.5 shadow-sm',
            isUser
              ? 'rounded-br-md text-white bg-[linear-gradient(120deg,var(--color-pink),var(--color-violet))]'
              : 'rounded-bl-md border border-[var(--color-border)] bg-[var(--color-surface)] text-white'
          )}
        >
          <MarkdownMessage content={message.content} />
        </div>

        <div className={cn('flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity', isUser && 'flex-row-reverse')}>
          <span className="text-[11px] text-[var(--color-text-faint)]">{formatTimestamp(new Date(message.timestamp))}</span>
          <button
            onClick={copy}
            className="text-[var(--color-text-faint)] hover:text-white transition-colors"
            aria-label="Copy message"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
