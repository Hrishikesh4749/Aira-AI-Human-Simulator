import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

const VARIANTS = {
  primary:
    'text-white shadow-[var(--shadow-glow-pink)] bg-[linear-gradient(120deg,var(--color-pink),var(--color-violet))]',
  secondary:
    'bg-[var(--color-surface-2)] text-white border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-3)]',
  ghost: 'bg-transparent text-[var(--color-text-muted)] hover:text-white hover:bg-white/5',
  danger: 'bg-transparent text-red-400 hover:bg-red-500/10 border border-red-500/20',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
  icon: 'p-2.5 rounded-full',
}

export default function Button({
  as: Comp = 'button',
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}) {
  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className="inline-block"
    >
      <Comp
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </Comp>
    </motion.div>
  )
}
