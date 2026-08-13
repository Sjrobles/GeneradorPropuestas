import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-[#2f54ca]',
        secondary:
          'border border-border bg-card text-foreground hover:bg-secondary',
        ghost: 'text-foreground hover:bg-muted',
      },
      size: {
        default: 'min-h-11',
        small: 'min-h-9 px-4 text-xs',
        large: 'min-h-12 px-7 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

export type AgoraButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export const AgoraButton = forwardRef<HTMLButtonElement, AgoraButtonProps>(
  ({ className, size, type = 'button', variant, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ className, size, variant }))}
      {...props}
    />
  ),
)

AgoraButton.displayName = 'AgoraButton'
