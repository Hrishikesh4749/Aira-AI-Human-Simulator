import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Moon, Sparkle, Bell, TerminalSquare, Volume2, Info, Trash2, Zap, Download } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import PageTransition from '../components/layout/PageTransition'
import Card from '../components/ui/Card'
import Toggle from '../components/ui/Toggle'
import Button from '../components/ui/Button'
import { useSettings } from '../context/SettingsContext'
import { useChat } from '../context/ChatContext'
import { clearRemoteConversation, exportConversation } from '../services/chatService'
import { cn } from '../utils/cn'

function Row({ icon: Icon, title, description, control }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-2)]">
          <Icon size={16} className="text-[var(--color-text-muted)]" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          {description && <p className="mt-0.5 text-xs text-[var(--color-text-faint)]">{description}</p>}
        </div>
      </div>
      {control}
    </div>
  )
}

const THEMES = [
  { id: 'dark', label: 'Midnight', swatch: '#0e0e11' },
  { id: 'dusk', label: 'Dusk', swatch: '#120e13' },
]

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    notificationsEnabled,
    setNotificationsEnabled,
    developerMode,
    setDeveloperMode,
    soundEnabled,
    setSoundEnabled,
    autoInitiations,
    setAutoInitiations,
  } = useSettings()
  const { clearConversation, messages } = useChat()
  const [isClearing, setIsClearing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleClear = async () => {
    setIsClearing(true)
    clearConversation()
    try {
      await clearRemoteConversation()
      toast.success('Conversation cleared')
    } catch {
      toast.error("Cleared locally, but couldn't reach Aira's backend")
    } finally {
      setIsClearing(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await exportConversation()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `aira-conversation-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('Conversation exported')
    } catch {
      toast.error("Couldn't reach Aira's backend to export")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Settings" subtitle="Make Aira feel like yours" />
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 pb-24 md:pb-8">
        <PageTransition className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          <div>
            <h1 className="font-display text-2xl font-semibold">Settings</h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Preferences are saved on this device.</p>
          </div>

          {/* Appearance */}
          <section>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
              Appearance
            </h2>
            <Card>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-2)]">
                    <Moon size={16} className="text-[var(--color-text-muted)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Theme</p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-faint)]">Aira is designed dark-first — pick a shade.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                        theme === t.id
                          ? 'border-[var(--color-pink)]/60 text-white bg-[var(--color-surface-2)]'
                          : 'border-[var(--color-border)] text-[var(--color-text-faint)] hover:text-white'
                      )}
                    >
                      <span className="h-2.5 w-2.5 rounded-full border border-white/10" style={{ background: t.swatch }} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </section>

          {/* Notifications & sound */}
          <section>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
              Notifications
            </h2>
            <Card className="divide-y divide-[var(--color-border)]">
              <Row
                icon={Bell}
                title="Message notifications"
                description="Get notified when Aira reaches out first."
                control={<Toggle checked={notificationsEnabled} onChange={setNotificationsEnabled} label="Toggle notifications" />}
              />
              <Row
                icon={Volume2}
                title="Sound effects"
                description="Soft send / receive chimes in chat."
                control={<Toggle checked={soundEnabled} onChange={setSoundEnabled} label="Toggle sound" />}
              />
            </Card>
          </section>

          {/* Developer mode */}
          <section>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
              Advanced
            </h2>
            <Card className="divide-y divide-[var(--color-border)]">
              <Row
                icon={TerminalSquare}
                title="Developer mode"
                description="Reveal a hidden panel with Aira's internal state."
                control={<Toggle checked={developerMode} onChange={setDeveloperMode} label="Toggle developer mode" />}
              />
              <Row
                icon={Zap}
                title="Auto initiations"
                description="Let Aira text you first after a while of silence."
                control={<Toggle checked={autoInitiations} onChange={setAutoInitiations} label="Toggle auto initiations" />}
              />
              <Row
                icon={Download}
                title="Export conversation"
                description="Download everything Aira has said and stored for you as JSON."
                control={
                  <Button variant="secondary" size="sm" onClick={handleExport} disabled={isExporting}>
                    {isExporting ? 'Exporting…' : 'Export'}
                  </Button>
                }
              />
              <Row
                icon={Trash2}
                title="Clear conversation"
                description={`${messages.length} message${messages.length === 1 ? '' : 's'} stored in this session.`}
                control={
                  <Button variant="danger" size="sm" onClick={handleClear} disabled={messages.length === 0 || isClearing}>
                    {isClearing ? 'Clearing…' : 'Clear'}
                  </Button>
                }
              />
            </Card>
          </section>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-4 py-3 text-xs text-[var(--color-text-faint)]"
          >
            <Info size={14} className="mt-0.5 shrink-0" />
            <p>
              Conversation history currently lives in this browser tab only. The backend persists Aira's own memory of you in
              MongoDB regardless of what's cleared here.
            </p>
          </motion.div>

          <div className="flex items-center gap-1.5 justify-center pt-2 text-xs text-[var(--color-text-faint)]">
            <Sparkle size={12} /> Aira — Human AI Simulator
          </div>
        </PageTransition>
      </div>
    </div>
  )
}
