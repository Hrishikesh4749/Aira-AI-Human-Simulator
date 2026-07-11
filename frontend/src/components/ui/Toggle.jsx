import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

export default function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed',
        checked ? 'bg-[linear-gradient(120deg,var(--color-pink),var(--color-violet))]' : 'bg-[var(--color-surface-3)]'
      )}
    >
      <motion.span
        className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </button>
  )
}
