import {
  ArrowRight,
  Blocks,
  FlaskConical,
  Landmark,
  LockKeyhole,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router'

import type { Skill } from '@/types/domain'

const icons: Record<string, LucideIcon> = {
  blocks: Blocks,
  flask: FlaskConical,
  landmark: Landmark,
  users: UsersRound,
}

interface SkillCardProps {
  skill: Skill
}

export function SkillCard({ skill }: SkillCardProps) {
  const Icon = icons[skill.icon ?? 'landmark'] ?? Landmark

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span
          className={`grid size-12 shrink-0 place-items-center rounded-md ${
            skill.enabled
              ? 'bg-foreground text-white'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <Icon aria-hidden="true" size={23} strokeWidth={1.8} />
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            skill.enabled
              ? 'bg-secondary text-primary'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {skill.enabled ? 'Disponible' : 'Próximamente'}
        </span>
      </div>
      <h2 className="mt-6 font-sans text-2xl font-extrabold leading-tight">
        {skill.name}
      </h2>
      <p className="mt-3 grow leading-7 text-muted-foreground">
        {skill.description}
      </p>
      <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold">
        {skill.enabled ? (
          <>
            Explorar skill
            <ArrowRight
              className="transition group-hover:translate-x-1"
              aria-hidden="true"
              size={17}
            />
          </>
        ) : (
          <>
            <LockKeyhole aria-hidden="true" size={16} />
            En preparación
          </>
        )}
      </span>
    </>
  )

  const cardClassName = `group flex min-h-80 flex-col rounded-lg border bg-card p-6 shadow-sm transition sm:p-7 ${
    skill.enabled
      ? 'border-border hover:-translate-y-1 hover:border-primary/35 hover:shadow-card'
      : 'border-dashed border-border opacity-75'
  }`

  return skill.enabled ? (
    <Link
      className={`${cardClassName} no-underline`}
      to={`/projects/new?skill=${skill.id}`}
    >
      {content}
    </Link>
  ) : (
    <article className={cardClassName} aria-disabled="true">
      {content}
    </article>
  )
}
