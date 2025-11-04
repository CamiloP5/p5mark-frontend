// app/(site)/footer.tsx
import FooterLogoServer from '@/components/site/FooterLogoServer';
import FooterContactServer from '@/components/site/FooterContactServer';
import FooterCopyServer from '@/components/site/FooterCopyServer';

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-3">
        <FooterLogoServer />
        <FooterContactServer />
        <FooterCopyServer />
      </div>
    </footer>
  );
}
