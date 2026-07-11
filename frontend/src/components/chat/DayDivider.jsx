export default function DayDivider({ label }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-[var(--color-border)]" />
      <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-faint)]">{label}</span>
      <div className="h-px flex-1 bg-[var(--color-border)]" />
    </div>
  )
}
