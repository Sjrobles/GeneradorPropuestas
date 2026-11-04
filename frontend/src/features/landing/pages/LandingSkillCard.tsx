import {
  ArrowRight,
  Blocks,
  Landmark,
  LockKeyhole,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router'
import type { Skill } from '@/types/domain'

export function LandingSkillCard({ skill }: { skill: Skill }) {
  if (!skill.enabled) return null

  const Icon =
    skill.icon === 'users'
      ? UsersRound
      : skill.icon === 'blocks'
        ? Blocks
        : Landmark
  const content = (
    <>
      <div className="agora-catalog-card-top">
        <span className="agora-catalog-icon">
          <Icon size={25} strokeWidth={1.7} aria-hidden="true" />
        </span>
        <span className="agora-catalog-status">
          {skill.enabled ? 'Disponible' : 'Próximamente'}
        </span>
      </div>
      <h3>{skill.name}</h3>
      <p>{skill.description}</p>
      <span className="agora-catalog-card-action">
        {skill.enabled ? (
          <>
            Explorar skill <ArrowRight size={18} aria-hidden="true" />
          </>
        ) : (
          <>
            <LockKeyhole size={16} aria-hidden="true" /> En preparación
          </>
        )}
      </span>
    </>
  )
  return skill.enabled ? (
    <Link
      to={`/projects/new?skill=${skill.id}`}
      className="agora-catalog-card is-available"
    >
      {content}
    </Link>
  ) : (
    <article className="agora-catalog-card" aria-disabled="true">
      {content}
    </article>
  )
}
