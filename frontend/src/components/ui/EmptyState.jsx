import { PlugZap } from 'lucide-react'

export default function EmptyState({ title, description, icon: Icon = PlugZap }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border-strong)] px-6 py-8 text-center">
      <Icon size={20} className="text-[var(--color-text-faint)]" />
      <p className="text-sm font-medium text-[var(--color-text-muted)]">{title}</p>
      {description && <p className="max-w-xs text-xs text-[var(--color-text-faint)]">{description}</p>}
    </div>
  )
}
