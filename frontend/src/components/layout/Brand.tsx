import { Landmark } from 'lucide-react'
import { Link } from 'react-router'

export function Brand() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-3 rounded-sm text-foreground no-underline"
      aria-label="Ágora, ir al inicio"
    >
      <span className="grid size-9 place-items-center rounded-md bg-foreground text-white">
        <Landmark aria-hidden="true" size={19} strokeWidth={1.8} />
      </span>
      <span className="font-serif text-xl font-bold tracking-tight">Ágora</span>
    </Link>
  )
}
