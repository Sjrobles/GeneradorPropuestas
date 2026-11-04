import type { SVGProps } from 'react'

type AgoraAssistantIconProps = SVGProps<SVGSVGElement> & { size?: number }

/** A compass representing guidance through project formulation. */
export function AgoraAssistantIcon({
  size = 20,
  ...props
}: AgoraAssistantIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}
