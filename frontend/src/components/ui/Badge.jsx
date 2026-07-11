import { cn } from '../../utils/cn'

export default function Badge({ children, className, dot, dotColor }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)]',
        className
      )}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: dotColor || 'var(--color-text-muted)' }}
        />
      )}
      {children}
    </span>
  )
}
