import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { Magnetic } from './Magnetic';

const base =
  'group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-4 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors duration-500';

const variants = {
  solid: 'bg-bone text-void hover:text-bone',
  outline: 'border border-bone/25 text-bone hover:border-bone hover:text-void',
  scarlet: 'bg-scarlet text-white hover:text-scarlet',
} as const;

const fills = {
  solid: 'bg-void',
  outline: 'bg-bone',
  scarlet: 'bg-white',
} as const;

type Variant = keyof typeof variants;

function Inner({ children, variant }: { children: ReactNode; variant: Variant }) {
  return (
    <>
      {/* Fill wipes up from the bottom edge on hover. */}
      <span
        aria-hidden
        className={`absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-y-100 ${fills[variant]}`}
      />
      <span className="relative z-10 flex items-center gap-3">{children}</span>
    </>
  );
}

export function ButtonLink({
  href,
  children,
  variant = 'solid',
  className = '',
  magnetic = true,
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  magnetic?: boolean;
} & Omit<ComponentProps<typeof Link>, 'href' | 'className' | 'children'>) {
  const external = href.startsWith('http') || href.startsWith('mailto:');

  const content = external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${variants[variant]} ${className}`}
    >
      <Inner variant={variant}>{children}</Inner>
    </a>
  ) : (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...rest}>
      <Inner variant={variant}>{children}</Inner>
    </Link>
  );

  return magnetic ? <Magnetic>{content}</Magnetic> : content;
}

export function ButtonAction({
  children,
  variant = 'solid',
  className = '',
  ...rest
}: { variant?: Variant } & ComponentProps<'button'>) {
  return (
    <Magnetic>
      <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
        <Inner variant={variant}>{children}</Inner>
      </button>
    </Magnetic>
  );
}
