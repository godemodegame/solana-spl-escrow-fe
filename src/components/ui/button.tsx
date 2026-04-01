import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

import { cn } from '../../lib/utils/cn'

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-teal-500 text-slate-950 hover:bg-teal-400 disabled:bg-teal-500/50',
  secondary:
    'border border-slate-300 bg-white text-slate-950 hover:border-slate-400 hover:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400',
  ghost:
    'bg-transparent text-slate-200 hover:bg-white/10 disabled:text-slate-500',
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
        'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed',
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
