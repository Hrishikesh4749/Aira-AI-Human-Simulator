import { Link } from 'react-router-dom'
import AiraOrb from '../components/ui/AiraOrb'
import Button from '../components/ui/Button'
import PageTransition from '../components/layout/PageTransition'

export default function NotFoundPage() {
  return (
    <PageTransition className="flex h-full flex-col items-center justify-center gap-4 text-center px-6">
      <AiraOrb size="lg" pulsing={false} />
      <div>
        <h1 className="font-display text-2xl font-semibold">Aira can't find that page</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Maybe it drifted off, like she sometimes does.</p>
      </div>
      <Button as={Link} to="/">
        Back home
      </Button>
    </PageTransition>
  )
}
