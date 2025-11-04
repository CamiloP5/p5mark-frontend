import Image from 'next/image';
import { getFooterSettings } from '@/lib/api';

export default async function FooterLogoServer() {
  const s = await getFooterSettings();

  if (!s.logo?.url)
    return <span className="text-lg font-semibold">P5 Marketing</span>;

  return (
    <Image
      src={s.logo.url}
      alt="Footer logo"
      width={140}
      height={36}
      className="h-auto w-auto"
    />
  );
}
