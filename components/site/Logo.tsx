// components/site/Logo.tsx
import Link from 'next/link';
import Image from 'next/image';

export type LogoProps = {
  href?: string;
  src?: string;           // p. ej. settings.logo?.url (mediaItemUrl)
  alt?: string;           // p. ej. settings.logo?.alt
  width?: number | null;  // si no lo pasas, puedes usar fill
  height?: number | null;
  fill?: boolean;         // activa modo fill si true o si no tienes width/height
  priority?: boolean;
  textFallback?: string;
  className?: string;
};

export default function Logo({
  href = '/',
  src,
  alt = 'Site logo',
  width = 140,
  height = 36,
  fill, // <- si lo envías, manda
  priority = true,
  textFallback = 'P5 Marketing',
  className = '',
}: LogoProps) {
  const useFill = !!fill || !width || !height;

  return (
    <Link href={href} aria-label="Go to home" className={`inline-flex items-center ${className}`}>
      {src ? (
        <div className={useFill ? 'relative h-9 w-36' : '' /* contenedor para fill */}>
          <Image
            src={src}
            alt={alt}
            {...(useFill
              ? { fill: true, style: { objectFit: 'contain' } }
              : { width: Number(width), height: Number(height) })}
            className="h-auto w-auto"
            priority={priority}
          />
        </div>
      ) : (
        <span className="text-lg font-bold tracking-tight">{textFallback}</span>
      )}
    </Link>
  );
}
