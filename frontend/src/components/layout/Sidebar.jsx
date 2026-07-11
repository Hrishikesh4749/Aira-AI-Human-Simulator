import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, MessageCircle, Settings, Info, TerminalSquare, ChevronsLeft, ChevronsRight } from 'lucide-react'
import AiraOrb from '../ui/AiraOrb'
import { cn } from '../../utils/cn'
import { useSettings } from '../../context/SettingsContext'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/about', label: 'About', icon: Info },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { developerMode } = useSettings()

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 240 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="hidden md:flex h-screen shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-soft)] py-5"
    >
      <div className={cn('flex items-center gap-3 px-5', collapsed && 'justify-center px-0')}>
        <AiraOrb size="sm" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              className="font-display text-lg font-semibold tracking-tight"
            >
              Aira
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'text-white'
                  : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border-strong)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={18} className="relative z-10 shrink-0" />
                {!collapsed && <span className="relative z-10">{label}</span>}
              </>
            )}
          </NavLink>
        ))}

        {developerMode && (
          <NavLink
            to="/developer"
            className={({ isActive }) =>
              cn(
                'group relative mt-2 flex items-center gap-3 rounded-xl border border-dashed border-[var(--color-border-strong)] px-3 py-2.5 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0',
                isActive ? 'text-[var(--color-pink-soft)]' : 'text-[var(--color-text-muted)] hover:text-white'
              )
            }
          >
            <TerminalSquare size={18} className="shrink-0" />
            {!collapsed && <span>Developer</span>}
          </NavLink>
        )}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="mx-3 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[var(--color-text-faint)] hover:text-white hover:bg-white/5 transition-colors"
      >
        {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </motion.aside>
  )
}
