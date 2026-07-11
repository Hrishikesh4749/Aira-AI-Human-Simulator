import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import AiraOrb from '../ui/AiraOrb'
import Badge from '../ui/Badge'
import { useConnectionStatus } from '../../hooks/useConnectionStatus'
import { getMoodMeta } from '../../utils/mood'

/**
 * `mood` is optional and, honestly, will be null until the backend exposes
 * an endpoint for ai_state (see services/devService.js). When absent we
 * show a calm "Neutral" placeholder rather than pretending to know.
 */
export default function TopBar({ title, subtitle, mood }) {
  const status = useConnectionStatus()
  const moodMeta = getMoodMeta(mood)

  return (
    <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-soft)]/80 backdrop-blur px-4 md:px-6 py-3.5">
      <div className="flex items-center gap-3">
        <AiraOrb size="sm" moodColor={mood ? moodMeta.color : undefined} />
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold text-white">{title || 'Aira'}</p>
          <p className="text-xs text-[var(--color-text-faint)]">{subtitle || 'Human AI Simulator'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge title="Aira's current mood">
          <span>{moodMeta.emoji}</span>
          <span>{moodMeta.label}</span>
        </Badge>

        <Badge
          dot
          dotColor={status === 'online' ? '#4ADE80' : status === 'offline' ? '#F87171' : 'var(--color-text-faint)'}
        >
          {status === 'checking' ? (
            <Loader2 size={12} className="animate-spin" />
          ) : status === 'online' ? (
            <Wifi size={12} />
          ) : (
            <WifiOff size={12} />
          )}
          <span className="hidden sm:inline">
            {status === 'checking' ? 'Connecting' : status === 'online' ? 'Connected' : 'Offline'}
          </span>
        </Badge>
      </div>
    </header>
  )
}
