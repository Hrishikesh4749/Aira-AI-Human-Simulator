import { motion } from 'framer-motion'
import { Brain, Heart, History, RefreshCw, ShieldCheck, Zap, Database, Sparkles } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import PageTransition from '../components/layout/PageTransition'
import Card from '../components/ui/Card'
import AiraOrb from '../components/ui/AiraOrb'

const BACKEND_SYSTEMS = [
  { icon: Heart, name: 'Emotion Engine', description: "Tracks Aira's mood, affection, and stress from message sentiment." },
  { icon: RefreshCw, name: 'Relationship Engine', description: 'Trust, comfort, playfulness, attachment, respect, and openness evolve per message.' },
  { icon: Zap, name: 'Personality Drift', description: 'Energy, sarcasm, dryness, clinginess, and sleepiness quietly shift over time.' },
  { icon: Brain, name: 'Semantic Memory', description: 'Facts about you are embedded and retrieved by relevance, not repeated blindly.' },
  { icon: History, name: 'Episodic Memory', description: 'Emotionally significant moments are stored and recalled as lived experience.' },
  { icon: Database, name: 'Vector Retrieval', description: 'Cosine-similarity search over memories and episodes surfaces what matters now.' },
  { icon: ShieldCheck, name: 'Character Preservation', description: 'A consistency check + rewrite layer keeps Aira in character, never robotic.' },
  { icon: Sparkles, name: 'Proactive Initiations', description: 'Aira can message first, adapting her tone to how long you\u2019ve been quiet.' },
]

const STACK = {
  Frontend: ['React', 'Vite', 'React Router', 'Axios', 'Tailwind CSS', 'Framer Motion', 'Lucide Icons', 'React Hot Toast'],
  Backend: ['FastAPI', 'MongoDB Atlas', 'Sentence Transformers', 'Groq (Llama 3.1 / 3.3)', 'scikit-learn'],
}

export default function AboutPage() {
  return (
    <div className="flex h-full flex-col">
      <TopBar title="About" subtitle="How Aira is built" />
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 pb-24 md:pb-8">
        <PageTransition className="mx-auto flex w-full max-w-3xl flex-col gap-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <AiraOrb size="lg" />
            <div>
              <h1 className="font-display text-2xl font-semibold md:text-3xl">Aira — Human AI Simulator</h1>
              <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--color-text-muted)]">
                Not a chatbot. An attempt at what a conversational AI feels like when it's allowed to have moods, memory, and a
                personality that changes with you.
              </p>
            </div>
          </div>

          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
              What's running underneath
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {BACKEND_SYSTEMS.map(({ icon: Icon, name, description }, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Card className="flex items-start gap-3 p-4">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-2)]">
                      <Icon size={15} className="text-[var(--color-pink-soft)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{name}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-faint)]">{description}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
              Technology stack
            </h2>
            <Card className="p-5">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {Object.entries(STACK).map(([group, items]) => (
                  <div key={group}>
                    <p className="mb-2 text-sm font-semibold text-white">{group}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1 text-[11px] text-[var(--color-text-muted)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </PageTransition>
      </div>
    </div>
  )
}
