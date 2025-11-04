import Link from 'next/link';
import { getFooterSettings } from '@/lib/api';

export default async function FooterContactServer() {
  const s = await getFooterSettings();

  const telHref = s.phoneNumber ? `tel:${s.phoneNumber.replace(/[^\d+]/g, '')}` : null;
  const mailHref = s.contactEmail ? `mailto:${s.contactEmail}` : null;

  return (
    <div className="text-sm leading-6">
      {s.localAddress && <p>{s.localAddress}</p>}

      {s.phoneNumber && (
        <p>
          Tel:{' '}
          {telHref ? (
            <Link href={telHref} className="underline-offset-2 hover:underline">
              {s.phoneNumber}
            </Link>
          ) : (
            s.phoneNumber
          )}
        </p>
      )}

      {s.contactEmail && (
        <p>
          Email:{' '}
          {mailHref ? (
            <Link href={mailHref} className="underline-offset-2 hover:underline">
              {s.contactEmail}
            </Link>
          ) : (
            s.contactEmail
          )}
        </p>
      )}
    </div>
  );
}
