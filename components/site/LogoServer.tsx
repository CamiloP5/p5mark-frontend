// components/site/LogoServer.tsx
import Logo from './Logo';
import { getSiteCustomSettings } from '@/lib/api';

export default async function LogoServer() {
  const s = await getSiteCustomSettings();
  return (
    <Logo
      src={s.logo?.url}
      alt="Site logo"
      fill
      textFallback="P5 Marketing"
    />
  );
}
