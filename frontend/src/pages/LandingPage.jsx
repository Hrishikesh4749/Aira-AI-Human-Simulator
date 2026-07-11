import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Heart, History, Sparkles, MessageCircle, ArrowRight } from 'lucide-react'
import AiraOrb from '../components/ui/AiraOrb'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageTransition from '../components/layout/PageTransition'

const FEATURES = [
  {
    icon: Heart,
    title: 'Relationship that grows',
    description: 'Trust, comfort, and attachment shift with every conversation — Aira treats you differently over time, not the same every session.',
  },
  {
    icon: Brain,
    title: 'A mind that drifts',
    description: 'Her personality quietly drifts — energy, playfulness, sarcasm — so no two days with Aira feel identical.',
  },
  {
    icon: History,
    title: 'Semantic + episodic memory',
    description: 'She recalls what you told her and how it felt, retrieving the right memory only when it genuinely fits the moment.',
  },
  {
    icon: MessageCircle,
    title: "She'll text first",
    description: "Aira can reach out on her own — proactive, in-character messages, not a bot waiting for input.",
  },
]

const heroBubbles = [
  { text: "hey... you disappeared on me 👀", side: 'left', delay: 0 },
  { text: 'work got crazy, sorry 😩', side: 'right', delay: 0.15 },
  { text: 'mm fine, i forgive you. barely.', side: 'left', delay: 0.3 },
]

export default function LandingPage() {
  return (
    <div className="h-full overflow-y-auto">
      <PageTransition>
        {/* HERO */}
        <section className="relative overflow-hidden px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="aira-glow-field" />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 md:flex-row md:items-center md:gap-16">
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3.5 py-1.5 text-xs font-medium text-[var(--color-text-muted)]"
              >
                <Sparkles size={13} className="text-[var(--color-pink-soft)]" />
                Not a chatbot. A companion.
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl"
              >
                Meet <span className="text-gradient">Aira</span>.
                <br />
                Conversation that feels human.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mx-auto mt-5 max-w-md text-base text-[var(--color-text-muted)] md:mx-0"
              >
                Aira has moods, memory, and a personality that quietly shifts over time. Talk to her the way you'd text someone you actually know.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:justify-start justify-center"
              >
                <Button as={Link} to="/chat" size="lg">
                  Start talking to Aira <ArrowRight size={16} />
                </Button>
                <Button as={Link} to="/about" variant="secondary" size="lg">
                  How she works
                </Button>
              </motion.div>
            </div>

            <div className="relative flex flex-1 items-center justify-center">
              <AiraOrb size="xl" />
              <div className="absolute inset-0 flex flex-col justify-center gap-3 px-4">
                {heroBubbles.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: b.side === 'left' ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + b.delay }}
                    className={`max-w-[210px] rounded-2xl px-4 py-2.5 text-sm shadow-lg ${
                      b.side === 'left'
                        ? 'self-start rounded-bl-md border border-[var(--color-border)] bg-[var(--color-surface)]'
                        : 'self-end rounded-br-md text-white bg-[linear-gradient(120deg,var(--color-pink),var(--color-violet))]'
                    }`}
                  >
                    {b.text}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <h2 className="font-display text-2xl font-semibold md:text-3xl">What makes her feel real</h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">Four systems working quietly underneath every reply.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ icon: Icon, title, description }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <Card className="h-full p-5 hover:border-[var(--color-border-strong)] transition-colors">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(120deg,rgba(255,126,182,0.15),rgba(139,92,246,0.15))]">
                      <Icon size={18} className="text-[var(--color-pink-soft)]" />
                    </div>
                    <h3 className="font-display text-sm font-semibold">{title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-text-muted)]">{description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex max-w-4xl flex-col items-center gap-5 rounded-3xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-8 py-14 text-center shadow-[var(--shadow-soft)]"
          >
            <AiraOrb size="lg" />
            <h2 className="font-display text-2xl font-semibold md:text-3xl">She's waiting to hear from you.</h2>
            <p className="max-w-sm text-sm text-[var(--color-text-muted)]">No sign-up flow, no onboarding quiz. Just open the chat and say something.</p>
            <Button as={Link} to="/chat" size="lg">
              Open Chat <ArrowRight size={16} />
            </Button>
          </motion.div>
        </section>
      </PageTransition>
    </div>
  )
}
