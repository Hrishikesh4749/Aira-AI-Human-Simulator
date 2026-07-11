import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Heart,
  Brain,
  Gauge,
  BookOpen,
  History,
  BarChart3,
  Server,
  MessagesSquare,
  RefreshCcw,
} from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import PageTransition from '../components/layout/PageTransition'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import { useSettings } from '../context/SettingsContext'
import { useAiraState } from '../hooks/useAiraState'
import { getRetrievedMemories, getRetrievedEpisodes, getHealth } from '../services/devService'
import { getMoodMeta } from '../utils/mood'
import { cn } from '../utils/cn'

const POLL_MS = 6000

function Panel({ icon: Icon, title, endpoint, loading, children, isEmpty, emptyLabel }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-surface-2)]">
          <Icon size={15} className="text-[var(--color-pink-soft)]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="font-mono text-[10px] text-[var(--color-text-faint)]">{endpoint}</p>
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-[var(--color-surface-2)]" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-[var(--color-surface-2)]" />
          <div className="h-3 w-3/5 animate-pulse rounded bg-[var(--color-surface-2)]" />
        </div>
      ) : isEmpty ? (
        <EmptyState title="No data yet" description={emptyLabel || "This will populate once Aira has something to show."} />
      ) : (
        children
      )}
    </Card>
  )
}

function StatBar({ label, value, max = 100 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--color-text-muted)]">{label}</span>
        <span className="font-mono text-[var(--color-text-faint)]">
          {value}
          {max !== 100 ? `/${max}` : ''}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
        <motion.div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-pink),var(--color-violet))]"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default function DeveloperPage() {
  const { developerMode } = useSettings()
  const [refreshKey, setRefreshKey] = useState(0)
  const { state, error, loading, refresh } = useAiraState(POLL_MS, refreshKey)
  const [memories, setMemories] = useState(null)
  const [episodes, setEpisodes] = useState(null)
  const [health, setHealth] = useState(null)
  const [subLoading, setSubLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadDetail() {
      const [m, e, h] = await Promise.all([getRetrievedMemories(), getRetrievedEpisodes(), getHealth()])
      if (cancelled) return
      setMemories(m)
      setEpisodes(e)
      setHealth(h)
      setSubLoading(false)
    }
    loadDetail()
    const id = setInterval(loadDetail, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [refreshKey])

  if (!developerMode) return <Navigate to="/settings" replace />

  const mood = state?.mood
  const relationship = state?.relationship
  const personality = state?.personality
  const lastTurn = state?.last_turn
  const moodMeta = getMoodMeta(mood?.mood)

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Developer Mode" subtitle="Aira's internal state" mood={mood?.mood} />
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 pb-24 md:pb-8">
        <PageTransition className="mx-auto flex w-full max-w-4xl flex-col gap-4">
          {/* Status strip */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-4 py-3">
            <Badge dot dotColor={health?.status === 'ok' ? '#4ADE80' : '#F87171'}>
              <Server size={12} />
              {health ? (health.status === 'ok' ? 'Backend online' : 'Backend issue') : 'Checking backend…'}
            </Badge>
            <Badge dot dotColor={health?.mongodb === 'connected' ? '#4ADE80' : '#F87171'}>
              MongoDB {health?.mongodb || 'unknown'}
            </Badge>
            <Badge>
              <MessagesSquare size={12} />
              {state?.conversation_count ?? '—'} messages
            </Badge>
            <Badge>{state?.memory_count ?? '—'} memories</Badge>
            <Badge>{state?.episode_count ?? '—'} episodes</Badge>
            <button
              onClick={() => {
                refresh()
                setRefreshKey((k) => k + 1)
              }}
              className="ml-auto flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-2.5 py-1 text-xs text-[var(--color-text-faint)] transition-colors hover:text-white"
            >
              <RefreshCcw size={11} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-dashed border-red-500/30 bg-red-500/5 px-4 py-3 text-xs text-red-300">
              Couldn't reach the backend at the configured API URL. Everything below will populate again automatically once
              it's reachable.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Panel icon={Heart} title="Current Mood" endpoint="GET /debug/mood" loading={loading && !mood} isEmpty={!mood}>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{moodMeta.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{moodMeta.label}</p>
                    <p className="text-[11px] text-[var(--color-text-faint)]">was {mood?.previous_mood || 'neutral'}</p>
                  </div>
                </div>
                <StatBar label="Affection" value={mood?.affection ?? 0} />
                <StatBar label="Stress" value={mood?.stress ?? 0} />
                <StatBar label="Social energy" value={mood?.social_energy ?? 0} />
                {mood?.emotion_history?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {mood.emotion_history.map((m, i) => (
                      <span key={i} className="rounded-md bg-[var(--color-surface-2)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-faint)]">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Panel>

            <Panel
              icon={Gauge}
              title="Relationship State"
              endpoint="GET /debug/relationship"
              loading={loading && !relationship}
              isEmpty={!relationship}
            >
              <div className="flex flex-col gap-3">
                <StatBar label="Trust" value={relationship?.trust ?? 0} />
                <StatBar label="Comfort" value={relationship?.comfort ?? 0} />
                <StatBar label="Playfulness" value={relationship?.playfulness ?? 0} />
                <StatBar label="Attachment" value={relationship?.attachment ?? 0} />
                <StatBar label="Respect" value={relationship?.respect ?? 0} />
                <StatBar label="Openness" value={relationship?.openness ?? 0} />
                {relationship?.last_interaction && (
                  <p className="pt-1 text-[11px] text-[var(--color-text-faint)]">
                    Last interaction type: <span className="text-[var(--color-text-muted)]">{relationship.last_interaction}</span>
                  </p>
                )}
              </div>
            </Panel>

            <Panel
              icon={Brain}
              title="Personality State"
              endpoint="GET /debug/personality"
              loading={loading && !personality}
              isEmpty={!personality}
            >
              <div className="flex flex-col gap-3">
                {personality &&
                  Object.entries(personality).map(([key, value]) => (
                    <StatBar key={key} label={key[0].toUpperCase() + key.slice(1)} value={value} max={10} />
                  ))}
              </div>
            </Panel>

            <Panel
              icon={BookOpen}
              title="Retrieved Memories"
              endpoint="GET /debug/memories"
              loading={subLoading}
              isEmpty={!memories || memories.count === 0}
              emptyLabel="Aira hasn't stored any semantic memories about you yet — mention something specific and she will."
            >
              <div className="flex flex-col gap-2">
                {memories?.last_retrieved?.length > 0 && (
                  <div>
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-faint)]">
                      Used in last reply
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {memories.last_retrieved.map((m, i) => (
                        <div key={i} className="rounded-lg border border-[var(--color-pink)]/20 bg-[var(--color-pink)]/5 px-2.5 py-1.5 text-xs text-white">
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-faint)]">
                  All stored ({memories?.count ?? 0})
                </p>
                <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto">
                  {memories?.memories?.map((m, i) => (
                    <div key={i} className="rounded-lg bg-[var(--color-surface-2)] px-2.5 py-1.5 text-xs text-[var(--color-text-muted)]">
                      {m.text}
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel
              icon={History}
              title="Retrieved Episodes"
              endpoint="GET /debug/episodes"
              loading={subLoading}
              isEmpty={!episodes || episodes.count === 0}
              emptyLabel="No emotional episodes stored yet."
            >
              <div className="flex flex-col gap-2">
                {episodes?.last_retrieved?.length > 0 && (
                  <div>
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-faint)]">
                      Used in last reply
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {episodes.last_retrieved.map((e, i) => (
                        <div key={i} className="rounded-lg border border-[var(--color-violet)]/20 bg-[var(--color-violet)]/5 px-2.5 py-1.5 text-xs text-white">
                          {e}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-faint)]">
                  Recent ({episodes?.count ?? 0})
                </p>
                <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto">
                  {episodes?.episodes?.map((e, i) => (
                    <div key={i} className="rounded-lg bg-[var(--color-surface-2)] px-2.5 py-1.5 text-xs text-[var(--color-text-muted)]">
                      {e.text}
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel
              icon={BarChart3}
              title="Prompt Statistics"
              endpoint="GET /debug/prompt-stats"
              loading={loading && !lastTurn}
              isEmpty={!lastTurn?.updated_at}
              emptyLabel="Send a message to Aira to see latency and token stats for that turn."
            >
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Model</span>
                  <span className="font-mono text-white">{lastTurn?.model || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Latency</span>
                  <span className="font-mono text-white">{lastTurn?.latency_ms != null ? `${lastTurn.latency_ms} ms` : '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Prompt tokens</span>
                  <span className="font-mono text-white">{lastTurn?.prompt_tokens ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Completion tokens</span>
                  <span className="font-mono text-white">{lastTurn?.completion_tokens ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Total tokens</span>
                  <span className="font-mono text-white">{lastTurn?.total_tokens ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Character check</span>
                  <span
                    className={cn(
                      'font-mono',
                      lastTurn?.character_check === 'FAIL' ? 'text-red-400' : 'text-emerald-400'
                    )}
                  >
                    {lastTurn?.character_check || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Relationship signal</span>
                  <span className="font-mono text-white">{lastTurn?.relationship_type || '—'}</span>
                </div>
              </div>
            </Panel>
          </div>
        </PageTransition>
      </div>
    </div>
  )
}
