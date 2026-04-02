import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

import { cn } from '../../lib/utils/cn'

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'retro-panel bg-[#d6dee8] text-slate-900 hover:bg-[#e2e8ef] disabled:text-slate-500',
  secondary:
    'retro-panel bg-[#c9d3de] text-slate-900 hover:bg-[#d5dde7] disabled:text-slate-500',
  ghost:
    'retro-panel bg-[#c9d3de] text-slate-900 hover:bg-[#d5dde7] disabled:text-slate-500',
}

export function Button({
  children,
  className,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-10 items-center justify-center px-4 py-2 text-sm font-bold tracking-[0.02em] disabled:cursor-not-allowed',
        variantClasses[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}
