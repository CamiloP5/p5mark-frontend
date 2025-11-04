// components/site/Logo.tsx
import Link from 'next/link';
import Image from 'next/image';

export type LogoProps = {
  href?: string;
  src?: string;           // URL de la imagen del logo
  alt?: string;           // Texto alternativo
  width?: number;         // Ancho del logo (px)
  height?: number;        // Alto del logo (px)
  priority?: boolean;     // Carga prioritaria en páginas críticas
  textFallback?: string;  // Texto si no hay imagen
  className?: string;     // Clases extra para el contenedor
};

export default function Logo({
  href = '/',
  src,
  alt = 'Site logo',
  width = 140,
  height = 36,
  priority = true,
  textFallback = 'P5 Marketing',
  className = '',
}: LogoProps) {
  return (
    <Link href={href} aria-label="Go to home" className={`inline-flex items-center ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="h-auto w-auto"
          priority={priority}
        />
      ) : (
        <span className="text-lg font-bold tracking-tight">{textFallback}</span>
      )}
    </Link>
  );
}
