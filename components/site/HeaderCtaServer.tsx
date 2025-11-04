// components/site/HeaderCtaServer.tsx
import CtaButton from './CtaButton';
import { getSiteCustomSettings } from '@/lib/api';

export default async function HeaderCtaServer() {
  const s = await getSiteCustomSettings();

  const label = s.navbarCta?.title || null;
  const href = s.navbarCta?.url || null;
  const external = (s.navbarCta?.target || '').toLowerCase() === '_blank';

  if (!label || !href) return null;

  return <CtaButton href={href} label={label} external={external} variant="outline" size="md" />;
}
