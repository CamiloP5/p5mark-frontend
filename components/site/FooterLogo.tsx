// components/site/FooterLogo.tsx
import Image from 'next/image';

export default function FooterLogo({ logoUrl }: { logoUrl: string }) {
  if (!logoUrl) {
    return <span className="text-lg font-semibold">P5 Marketing</span>;
  }
  return (
    <Image
      src={logoUrl}
      alt="Footer logo"
      width={140}
      height={36}
      className="h-auto w-auto"
    />
  );
}
