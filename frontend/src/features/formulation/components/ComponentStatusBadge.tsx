import {
  AlertTriangle,
  Check,
  Circle,
  LoaderCircle,
  PencilLine,
  ShieldCheck,
  XCircle,
} from 'lucide-react'

import { COMPONENT_STATUSES, type ComponentStatus } from '@/types/domain'

const statusConfig: Record<
  ComponentStatus,
  { className: string; icon: typeof Circle; label: string }
> = {
  [COMPONENT_STATUSES.PENDING]: {
    label: 'Pendiente',
    icon: Circle,
    className: 'bg-[#f1f3f7] text-[#76839a]',
  },
  [COMPONENT_STATUSES.GENERATING]: {
    label: 'Generando',
    icon: LoaderCircle,
    className: 'bg-primary/10 text-primary',
  },
  [COMPONENT_STATUSES.GENERATED]: {
    label: 'Generado',
    icon: Check,
    className: 'bg-[#eaf8f3] text-[#238260]',
  },
  [COMPONENT_STATUSES.VALIDATED]: {
    label: 'Validado',
    icon: ShieldCheck,
    className: 'bg-[#eaf8f3] text-[#238260]',
  },
  [COMPONENT_STATUSES.NEEDS_REVISION]: {
    label: 'Requiere revisión',
    icon: AlertTriangle,
    className: 'bg-[#fff6e8] text-[#a86717]',
  },
  [COMPONENT_STATUSES.MODIFIED]: {
    label: 'Modificado',
    icon: PencilLine,
    className: 'bg-[#eef2ff] text-[#365ac9]',
  },
  [COMPONENT_STATUSES.APPROVED]: {
    label: 'Aprobado',
    icon: ShieldCheck,
    className: 'bg-[#e7f8ee] text-[#17764f]',
  },
  [COMPONENT_STATUSES.ERROR]: {
    label: 'Error',
    icon: XCircle,
    className: 'bg-danger/10 text-danger',
  },
}

export function ComponentStatusBadge({ status }: { status: ComponentStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-extrabold ${config.className}`}
    >
      <Icon
        className={
          status === COMPONENT_STATUSES.GENERATING ? 'animate-spin' : ''
        }
        aria-hidden="true"
        size={13}
      />
      {config.label}
    </span>
  )
}
