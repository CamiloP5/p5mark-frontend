// app/site/footer.tsx
import { getFooterSettings } from '@/lib/api';
import FooterLogo from '@/components/site/FooterLogo';
import FooterContact from '@/components/site/FooterContact';
import FooterCopy from '@/components/site/FooterCopy';

export default async function Footer() {
  const s = await getFooterSettings(); // <- nunca lanza; ya lo blindamos

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-3">
        <FooterLogo logoUrl={s.logo?.url || ''} />
        <FooterContact
          address={s.localAddress || ''}
          phone={s.phoneNumber || ''}
          email={s.contactEmail || ''}
        />
        <FooterCopy />
      </div>
    </footer>
  );
}
