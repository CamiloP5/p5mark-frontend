// app/(site)/header.tsx
import LogoServer from '@/components/site/LogoServer';
import MainMenuServer from '@/components/site/MainMenuServer';
import HeaderCtaServer from '@/components/site/HeaderCtaServer';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <LogoServer />
        <MainMenuServer />
        <HeaderCtaServer />
      </div>
    </header>
  );
}
