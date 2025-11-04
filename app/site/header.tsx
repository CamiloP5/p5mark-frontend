// app/(site)/header.tsx  (o donde prefieras)
import Logo from '@/components/site/Logo';
import MainMenuServer from '@/components/site/MainMenuServer';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo
          href="/"
          src="https://p5marketing.com/wp-content/uploads/2024/01/logo.png"
          alt="P5 Marketing"
          width={140}
          height={36}
        />
        <MainMenuServer />
      </div>
    </header>
  );
}