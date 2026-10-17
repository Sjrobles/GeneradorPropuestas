import type { ReactNode } from 'react'

interface PageHeaderProps {
  description: string
  eyebrow: string
  title: string
  trailing?: ReactNode
}

export function PageHeader({
  description,
  eyebrow,
  title,
  trailing,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
          {description}
        </p>
      </div>
      {trailing}
    </header>
  )
}
