// components/site/CtaButton.tsx
import Link from 'next/link';

export type CtaButtonProps = {
  href: string;
  label: string;
  external?: boolean;
  className?: string;

  // estilos rápidos
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

const base =
  'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors';
const sizes = {
  sm: 'px-3 py-2',
  md: 'px-4 py-2.5',
  lg: 'px-5 py-3',
};
const variants = {
  solid: 'bg-black text-white hover:bg-neutral-800',
  outline: 'border border-black text-black hover:bg-black hover:text-white',
  ghost: 'text-black hover:bg-neutral-100',
};

export default function CtaButton({
  href,
  label,
  external = false,
  className = '',
  variant = 'outline',
  size = 'md',
}: CtaButtonProps) {
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`.trim();

  return (
    <Link
      href={href}
      className={cls}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      {label}
    </Link>
  );
}
