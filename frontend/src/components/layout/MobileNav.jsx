import { NavLink } from 'react-router-dom'
import { Home, MessageCircle, Settings, Info } from 'lucide-react'
import { cn } from '../../utils/cn'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/about', label: 'About', icon: Info },
]

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-bg-soft)]/95 backdrop-blur px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors',
              isActive ? 'text-[var(--color-pink-soft)]' : 'text-[var(--color-text-faint)]'
            )
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
