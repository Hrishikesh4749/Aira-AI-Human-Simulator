import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

const SIZES = {
  sm: 'w-8 h-8',
  md: 'w-11 h-11',
  lg: 'w-16 h-16',
  xl: 'w-28 h-28',
}

/**
 * The recurring visual signature of the app: a soft, breathing
 * pink-to-violet gradient orb that stands in for Aira everywhere
 * she "appears" — sidebar, top bar, chat avatar, landing hero.
 */
export default function AiraOrb({ size = 'md', pulsing = true, className, moodColor }) {
  return (
    <div className={cn('relative shrink-0', SIZES[size], className)}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: moodColor
            ? `radial-gradient(circle at 32% 28%, ${moodColor}, var(--color-violet) 75%)`
            : 'radial-gradient(circle at 32% 28%, var(--color-pink), var(--color-violet) 75%)',
        }}
        animate={pulsing ? { scale: [1, 1.06, 1] } : {}}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -inset-1 rounded-full blur-md opacity-40"
        style={{
          background: 'radial-gradient(circle, var(--color-pink), var(--color-violet))',
        }}
        animate={pulsing ? { opacity: [0.25, 0.5, 0.25] } : {}}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-[15%] rounded-full bg-white/20 blur-[3px]" />
    </div>
  )
}
